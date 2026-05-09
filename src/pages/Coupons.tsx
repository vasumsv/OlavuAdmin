import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Tag,
  CheckCircle,
  XCircle,
  Calendar,
  Percent,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface Coupon {
  id: string;
  coupon_code: string;
  discount_pct: number;
  is_active: boolean;
  expiry_date: string;
  usage_limit?: number;
  used_count: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    coupon_code: '',
    discount_pct: '',
    expiry_date: '',
    usage_limit: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setSaving(true);

    try {
      // Validate required fields
      const errors: string[] = [];
      
      if (!formData.coupon_code.trim()) errors.push('Coupon code is required');
      if (!formData.discount_pct || parseFloat(formData.discount_pct) < 1 || parseFloat(formData.discount_pct) > 100) {
        errors.push('Discount percentage must be between 1 and 100');
      }
      if (!formData.expiry_date) errors.push('Expiry date is required');
      
      // Check if expiry date is in the future
      const expiryDate = new Date(formData.expiry_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expiryDate < today) {
        errors.push('Expiry date must be in the future');
      }
      
      if (errors.length > 0) {
        setFormErrors(errors);
        return;
      }

      const couponData = {
        coupon_code: formData.coupon_code.toUpperCase().trim(),
        discount_pct: parseFloat(formData.discount_pct),
        expiry_date: formData.expiry_date,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        description: formData.description.trim() || null,
        is_active: formData.is_active
      };

      if (editingCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editingCoupon.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert([couponData]);

        if (error) throw error;
      }

      setShowAddModal(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      
      if (error.message?.includes('duplicate key')) {
        setFormErrors(['Coupon code already exists. Please use a different code.']);
      } else if (error.message?.includes('violates check constraint')) {
        setFormErrors(['Invalid discount percentage. Must be between 1 and 100.']);
      } else {
        setFormErrors([error.message || 'Failed to save coupon. Please try again.']);
      }
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      coupon_code: '',
      discount_pct: '',
      expiry_date: '',
      usage_limit: '',
      description: '',
      is_active: true
    });
    setFormErrors([]);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      coupon_code: coupon.coupon_code,
      discount_pct: coupon.discount_pct.toString(),
      expiry_date: coupon.expiry_date,
      usage_limit: coupon.usage_limit?.toString() || '',
      description: coupon.description || '',
      is_active: coupon.is_active
    });
    setShowAddModal(true);
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);

      if (error) throw error;
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  const toggleStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !currentStatus })
        .eq('id', couponId);

      if (error) throw error;
      fetchCoupons();
    } catch (error) {
      console.error('Error updating coupon status:', error);
    }
  };

  const getStatusBadge = (isActive: boolean, expiryDate: string) => {
    const isExpired = new Date(expiryDate) < new Date();
    
    if (isExpired) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircle className="w-3 h-3 mr-1" />
          Expired
        </span>
      );
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.coupon_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (coupon.description && coupon.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-600 mt-1">Manage discount coupons and promotional codes</p>
        </div>
        <button
          onClick={() => {
            setEditingCoupon(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="mt-4 sm:mt-0 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Coupon
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      {/* Coupons Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Tag className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Total Coupons</p>
              <p className="text-lg font-bold text-blue-600">{coupons.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Active Coupons</p>
              <p className="text-lg font-bold text-green-600">
                {coupons.filter(c => c.is_active && new Date(c.expiry_date) >= new Date()).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Expiring Soon</p>
              <p className="text-lg font-bold text-yellow-600">
                {coupons.filter(c => {
                  const expiry = new Date(c.expiry_date);
                  const today = new Date();
                  const diffTime = expiry.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 7 && diffDays > 0 && c.is_active;
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Expired</p>
              <p className="text-lg font-bold text-red-600">
                {coupons.filter(c => new Date(c.expiry_date) < new Date()).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Coupon Code</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Discount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Expiry Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Usage</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{coupon.coupon_code}</p>
                      {coupon.description && (
                        <p className="text-sm text-gray-500 line-clamp-1">{coupon.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 text-green-600 mr-1" />
                      <span className="font-medium text-green-600">{coupon.discount_pct}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(coupon.is_active, coupon.expiry_date)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <p className="text-gray-900">
                        {format(new Date(coupon.expiry_date), 'MMM dd, yyyy')}
                      </p>
                      <p className={`text-xs ${
                        new Date(coupon.expiry_date) < new Date() 
                          ? 'text-red-500' 
                          : 'text-gray-500'
                      }`}>
                        {new Date(coupon.expiry_date) < new Date() ? 'Expired' : 'Valid'}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <p className="text-gray-900">{coupon.used_count} used</p>
                      {coupon.usage_limit && (
                        <p className="text-gray-500">of {coupon.usage_limit} limit</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                          coupon.is_active
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        disabled={new Date(coupon.expiry_date) < new Date()}
                      >
                        {coupon.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCoupons.length === 0 && (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No coupons found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Try adjusting your search' : 'Add your first coupon to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Messages */}
              {formErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <XCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Please fix the following errors:
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc pl-5 space-y-1">
                          {formErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.coupon_code}
                  onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g., SAVE20"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Percentage (%) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  step="0.01"
                  value={formData.discount_pct}
                  onChange={(e) => setFormData({ ...formData, discount_pct: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g., 20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usage Limit (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={3}
                  placeholder="Brief description of the coupon"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Tag className="h-4 w-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : (editingCoupon ? 'Update Coupon' : 'Create Coupon')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;