import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { decryptPassword, decodePassword, encryptPassword } from '../utils/encryption';
import type { Session } from '@supabase/supabase-js';

interface AdminUser {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: string;
  last_login?: string;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  session: Session | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage first for persistent login
    const savedUser = localStorage.getItem('olavubooks_admin_user');
    const savedSession = localStorage.getItem('olavubooks_admin_session');

    if (savedUser && savedSession) {
      try {
        const userData = JSON.parse(savedUser);
        const sessionData = JSON.parse(savedSession);

        // Check if session is still valid (24 hours)
        const sessionTime = new Date(sessionData.timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - sessionTime.getTime()) / (1000 * 60 * 60);

        if (hoursDiff < 24) {
          setUser(userData);
          setLoading(false);
          return;
        } else {
          // Session expired, clear storage
          localStorage.removeItem('olavubooks_admin_user');
          localStorage.removeItem('olavubooks_admin_session');
        }
      } catch (error) {
        localStorage.removeItem('olavubooks_admin_user');
        localStorage.removeItem('olavubooks_admin_session');
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        // If we have a Supabase session, try to get admin user info
        loadAdminUserFromSession(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        await loadAdminUserFromSession(session.user.id);
      } else {
        setUser(null);
        localStorage.removeItem('olavubooks_admin_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadAdminUserFromSession = async (userId: string) => {
    try {
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (adminUser && !error) {
        const userInfo: AdminUser = {
          id: adminUser.id,
          username: adminUser.username,
          full_name: adminUser.full_name,
          email: adminUser.email,
          role: adminUser.role,
          last_login: adminUser.last_login
        };
        setUser(userInfo);
        localStorage.setItem('olavubooks_admin_user', JSON.stringify(userInfo));
        localStorage.setItem('olavubooks_admin_session', JSON.stringify({
          timestamp: new Date().toISOString(),
          userId: adminUser.id
        }));
      }
    } catch (error) {
      // Silent error handling
    }
  };

  // Remove the old useEffect and replace with the new one above

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);

      // Fetch user from database
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username.trim())
        .eq('is_active', true)
        .maybeSingle();

      if (error || !adminUser) {
        return { success: false, error: 'Invalid username or password' };
      }

      // Try multiple password verification methods
      let isValidPassword = false;

      // Method 1: Direct comparison (for plain text - development only)
      if (password === adminUser.password_hash) {
        isValidPassword = true;
      }

      // Method 2: Base64 decode comparison
      if (!isValidPassword) {
        try {
          const base64Decoded = decodePassword(adminUser.password_hash);
          if (password === base64Decoded) {
            isValidPassword = true;
          }
        } catch (e) {
          // Decode failed, continue
        }
      }

      // Method 3: XOR decryption (legacy method)
      if (!isValidPassword) {
        try {
          const decryptedPassword = decryptPassword(adminUser.password_hash);
          if (password === decryptedPassword) {
            isValidPassword = true;
          }
        } catch (e) {
          // Decryption failed, continue
        }
      }

      if (!isValidPassword) {
        return { success: false, error: 'Invalid username or password' };
      }

      // CRITICAL: Establish proper Supabase auth session for RLS
      try {
        // Try to sign in first
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: adminUser.email,
          password: password,
        });

        if (signInError) {
          // If sign in fails, try to create the account
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: adminUser.email,
            password: password,
            options: {
              emailRedirectTo: undefined,
              data: {
                admin_user_id: adminUser.id,
                username: adminUser.username
              }
            }
          });

          if (!signUpError && signUpData.user) {
            adminUser.id = signUpData.user.id;
          }
        } else if (signInData.user) {
          // Verify the session is working
          await supabase.auth.getSession();
        }
      } catch (authError) {
        // Continue with login even if auth setup fails
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id);

      const userInfo: AdminUser = {
        id: adminUser.id,
        username: adminUser.username,
        full_name: adminUser.full_name,
        email: adminUser.email,
        role: adminUser.role,
        last_login: new Date().toISOString()
      };

      setUser(userInfo);
      localStorage.setItem('olavubooks_admin_user', JSON.stringify(userInfo));
      localStorage.setItem('olavubooks_admin_session', JSON.stringify({
        timestamp: new Date().toISOString(),
        userId: adminUser.id
      }));

      return { success: true };
    } catch (error) {
      return { success: false, error: `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    localStorage.removeItem('olavubooks_admin_user');
    localStorage.removeItem('olavubooks_admin_session');
  };

  const value = {
    user,
    session,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};