import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, BarChart3, Package, Users, ShoppingCart, Grid2x2 as Grid, Settings, Tag, Gift, LogOut, Menu, X, Bell, CircleUser as UserCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrderNotifications } from '../../hooks/useOrderNotifications';
import NotificationToast from '../NotificationToast';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Notification preferences
  const [orderNotificationsEnabled, setOrderNotificationsEnabled] = useState(true);

  // Get notification preferences from localStorage
  useEffect(() => {
    const prefs = localStorage.getItem('notification_preferences');
    if (prefs) {
      try {
        const parsed = JSON.parse(prefs);
        setOrderNotificationsEnabled(parsed.order_notifications ?? true);
      } catch (e) {
        console.error('Error parsing notification preferences:', e);
      }
    }
  }, []);

  // Listen for preference changes
  useEffect(() => {
    const handleStorageChange = () => {
      const prefs = localStorage.getItem('notification_preferences');
      if (prefs) {
        try {
          const parsed = JSON.parse(prefs);
          setOrderNotificationsEnabled(parsed.order_notifications ?? true);
        } catch (e) {
          console.error('Error parsing notification preferences:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Use the order notifications hook
  const { notification, clearNotification } = useOrderNotifications(orderNotificationsEnabled);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Categories', href: '/categories', icon: Grid },
    { name: 'Authors', href: '/authors', icon: UserCircle },
    { name: 'Gift Combos', href: '/gift-combos', icon: Gift },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Coupons', href: '/coupons', icon: Tag },
    { name: 'Reviews', href: '/reviews', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Order Notification Toast */}
      {notification && (
        <NotificationToast
          message={`New order #${notification.order_number} from ${notification.customer_name} - ₹${notification.total_amount.toLocaleString()}`}
          type="info"
          onClose={clearNotification}
          autoClose={8000}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <img
              src="https://raw.githubusercontent.com/vasumsv/Vnova-Technologies/refs/heads/main/Olava%20Books/Logo.png"
              alt="OlavuBooks"
              className="h-8 w-auto"
            />
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-red-50 text-red-700 border-l-4 border-red-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 border-b">
            <img
              src="https://raw.githubusercontent.com/vasumsv/Vnova-Technologies/refs/heads/main/Olava%20Books/Logo.png"
              alt="OlavuBooks"
              className="h-8 w-auto"
            />
            <span className="ml-2 text-lg font-semibold text-gray-900">Admin</span>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-red-50 text-red-700 border-l-4 border-red-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.full_name.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-600 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                className="relative text-gray-400 hover:text-gray-600"
                title={orderNotificationsEnabled ? "Notifications enabled" : "Notifications disabled"}
              >
                <Bell className="h-6 w-6" />
                {orderNotificationsEnabled && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"></span>
                )}
              </button>
              <div className="hidden sm:flex sm:items-center">
                <span className="text-sm text-gray-700">Welcome back, {user?.full_name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;