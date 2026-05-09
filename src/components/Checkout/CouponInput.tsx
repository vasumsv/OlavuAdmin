import React, { useState } from 'react';
import { Tag, Check, X, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CouponInputProps {
  onCouponApplied: (coupon: { code: string; discount: number } | null) => void;
  appliedCoupon: { code: string; discount: number } | null;
  totalAmount: number;
}

const CouponInput: React.FC<CouponInputProps> = ({ 
  onCouponApplied, 
  appliedCoupon, 
  totalAmount 
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('coupon_code', couponCode.toUpperCase().trim())
        .eq('is_active', true)
        .gte('expiry_date', new Date().toISOString().split('T')[0])
        .single();

      if (error || !coupon) {
        setError('Invalid or expired coupon code');
        return;
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        setError('This coupon has reached its usage limit');
        return;
      }

      // Apply coupon
      onCouponApplied({
        code: coupon.coupon_code,
        discount: coupon.discount_pct
      });

      setSuccess(`Coupon applied! You saved ${coupon.discount_pct}%`);
      setCouponCode('');
    } catch (error) {
      console.error('Error validating coupon:', error);
      setError('Failed to validate coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    onCouponApplied(null);
    setSuccess('');
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateCoupon();
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <Tag className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="font-medium text-gray-900">Discount Coupon</h3>
      </div>

      {appliedCoupon ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                <p className="text-sm text-green-600">
                  {appliedCoupon.discount}% discount applied
                </p>
              </div>
            </div>
            <button
              onClick={removeCoupon}
              className="text-green-600 hover:text-green-800 p-1"
              title="Remove coupon"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 text-sm text-green-700">
            You saved ₹{((totalAmount * appliedCoupon.discount) / 100).toFixed(2)}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              disabled={loading}
            />
            <button
              onClick={validateCoupon}
              disabled={loading || !couponCode.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-center text-red-600 text-sm">
              <X className="h-4 w-4 mr-1" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center text-green-600 text-sm">
              <Check className="h-4 w-4 mr-1" />
              {success}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        Enter a valid coupon code to get discount on your order
      </div>
    </div>
  );
};

export default CouponInput;