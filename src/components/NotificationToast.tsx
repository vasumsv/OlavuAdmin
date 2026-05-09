import React, { useEffect, useState } from 'react';
import { X, ShoppingCart, CheckCircle } from 'lucide-react';

interface NotificationToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning';
  onClose: () => void;
  autoClose?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  type = 'info',
  onClose,
  autoClose = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const bgColors = {
    success: 'bg-green-500',
    info: 'bg-blue-500',
    warning: 'bg-orange-500'
  };

  const icons = {
    success: CheckCircle,
    info: ShoppingCart,
    warning: ShoppingCart
  };

  const Icon = icons[type];

  return (
    <div
      className={`fixed top-4 left-4 z-50 transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}
    >
      <div className={`${bgColors[type]} text-white rounded-lg shadow-lg p-4 flex items-center space-x-3 min-w-[300px] max-w-md`}>
        <Icon className="h-6 w-6 flex-shrink-0" />
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
