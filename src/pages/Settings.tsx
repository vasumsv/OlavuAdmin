import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  Bell, 
  Globe,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { encryptPassword, decryptPassword } from '../utils/encryption';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile form
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    username: ''
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    order_notifications: true,
    low_stock_alerts: true,
    daily_reports: false
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name,
        email: user.email,
        username: user.username
      });
      fetchNotificationPreferences();
    }
  }, [user]);

  const fetchNotificationPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        const prefs = {
          order_notifications: data.order_notifications,
          low_stock_alerts: data.low_stock_alerts,
          daily_reports: data.daily_reports
        };
        setNotificationPrefs(prefs);
        // Save to localStorage for immediate access
        localStorage.setItem('notification_preferences', JSON.stringify(prefs));
      } else if (!error) {
        // Create default preferences if they don't exist
        const defaultPrefs = {
          order_notifications: true,
          low_stock_alerts: true,
          daily_reports: false
        };
        await supabase
          .from('user_preferences')
          .insert([{
            user_id: user.id,
            ...defaultPrefs
          }]);
        localStorage.setItem('notification_preferences', JSON.stringify(defaultPrefs));
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('admin_users')
        .update({
          full_name: profileData.full_name,
          email: profileData.email,
          username: profileData.username,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      showMessage('success', 'Profile updated successfully');
      
      // Update the user context with new data
      const updatedUser = {
        ...user,
        full_name: profileData.full_name,
        email: profileData.email,
        username: profileData.username
      };
      
      // Update localStorage
      localStorage.setItem('olavubooks_admin_user', JSON.stringify(updatedUser));
      
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async (field: keyof typeof notificationPrefs, value: boolean) => {
    if (!user) return;

    try {
      setLoading(true);

      // Update local state
      const updatedPrefs = { ...notificationPrefs, [field]: value };
      setNotificationPrefs(updatedPrefs);

      // Save to localStorage for the notification listener
      localStorage.setItem('notification_preferences', JSON.stringify(updatedPrefs));

      // Update in database
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...updatedPrefs,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      showMessage('success', 'Notification preferences updated successfully');
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update preferences');
      // Revert on error
      setNotificationPrefs(notificationPrefs);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwordData.new_password !== passwordData.confirm_password) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      showMessage('error', 'New password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);

      // Verify current password
      const { data: currentUser } = await supabase
        .from('admin_users')
        .select('password_hash')
        .eq('id', user.id)
        .single();

      if (!currentUser) throw new Error('User not found');

      // Try multiple password verification methods
      let isValidPassword = false;
      
      // Method 1: Direct comparison (for plain text)
      if (passwordData.current_password === currentUser.password_hash) {
        isValidPassword = true;
      }
      
      // Method 2: Base64 decode comparison
      if (!isValidPassword) {
        try {
          const base64Decoded = decryptPassword(currentUser.password_hash);
          if (passwordData.current_password === base64Decoded) {
            isValidPassword = true;
          }
        } catch (e) {
          // Continue to next method
        }
      }
      
      // Method 3: XOR decryption (legacy method)
      if (!isValidPassword) {
        try {
          const decryptedPassword = decryptPassword(currentUser.password_hash);
          if (passwordData.current_password === decryptedPassword) {
            isValidPassword = true;
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (!isValidPassword) {
        showMessage('error', 'Current password is incorrect');
        return;
      }

      // Encrypt new password
      const newPasswordHash = btoa(passwordData.new_password); // Use base64 encoding like the admin user

      // Update password
      const { error } = await supabase
        .from('admin_users')
        .update({
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      showMessage('success', 'Password updated successfully');
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock, disabled: true },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'general', name: 'General', icon: Globe }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={tab.disabled}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : tab.disabled
                      ? 'border-transparent text-gray-300 cursor-not-allowed'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="max-w-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-lg">
              <div className="text-center py-12">
                <Lock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Security Settings Locked</h3>
                <p className="text-gray-500">This section is temporarily disabled and will be available later.</p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
              <p className="text-sm text-gray-600 mb-6">
                Enable notifications to get real-time alerts about your store activities
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">Order Notifications</p>
                    <p className="text-sm text-gray-500">Get notified when new orders are placed</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.order_notifications}
                    onChange={(e) => handleNotificationUpdate('order_notifications', e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">Low Stock Alerts</p>
                    <p className="text-sm text-gray-500">Get notified when products are running low</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.low_stock_alerts}
                    onChange={(e) => handleNotificationUpdate('low_stock_alerts', e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">Daily Reports</p>
                    <p className="text-sm text-gray-500">Receive daily sales and analytics reports</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.daily_reports}
                    onChange={(e) => handleNotificationUpdate('daily_reports', e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="max-w-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Zone
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                    <option>Asia/Kolkata (IST)</option>
                    <option>UTC</option>
                    <option>America/New_York</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Format
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;