import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail,
  User,
  Package,
  Truck,
  CheckCircle
} from 'lucide-react';
import CouponInput from '../components/Checkout/CouponInput';

interface CheckoutItem {
  id: string;
  title: string;
  author: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShippingAddress {
  name: string;
  phone: string;
  email: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
}

const Checkout: React.FC = () => {
  const [items] = useState<CheckoutItem[]>([
    {
      id: '1',
      title: 'ಮೂಕಜ್ಜಿಯ ಕನಸುಗಳು',
      author: 'ಕುವೆಂಪು',
      price: 250,
      quantity: 2,
      image: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg'
    },
    {
      id: '2',
      title: 'ಮಲೆನಾಡಿನ ಮಕ್ಕಳು',
      author: 'ಕೈಲಾಸಂ',
      price: 180,
      quantity: 1,
      image: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg'
    }
  ]);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    phone: '',
    email: '',
    address_line: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal > 500 ? 0 : 50;
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0;
  const total = subtotal + shippingCost - discountAmount;

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically:
      // 1. Create order in database
      // 2. Process payment
      // 3. Update coupon usage count
      // 4. Send confirmation email
      
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 text-red-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.name}
                    onChange={(e) => handleAddressChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) => handleAddressChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) => handleAddressChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    required
                    value={shippingAddress.address_line}
                    onChange={(e) => handleAddressChange('address_line', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={3}
                    placeholder="Enter your complete address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter your city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter your state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter PIN code"
                  />
                </div>
              </form>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="h-5 w-5 text-red-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive your order</p>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 opacity-50">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    disabled
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Online Payment</p>
                    <p className="text-sm text-gray-500">Coming soon - UPI, Cards, Net Banking</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <ShoppingCart className="h-5 w-5 text-red-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-16 bg-gray-200 rounded flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm line-clamp-2">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500">{item.author}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                        <span className="font-medium text-gray-900">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon Input */}
            <CouponInput
              onCouponApplied={setAppliedCoupon}
              appliedCoupon={appliedCoupon}
              totalAmount={subtotal}
            />

            {/* Price Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Price Details</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="text-gray-900">₹{subtotal}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {subtotal < 500 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Add ₹{500 - subtotal} more to get FREE shipping!
                  </p>
                </div>
              )}
            </div>

            {/* Place Order Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Placing Order...' : `Place Order - ₹${total.toFixed(2)}`}
            </button>

            <div className="text-center">
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Truck className="h-4 w-4 mr-1" />
                Estimated delivery: 3-5 business days
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;