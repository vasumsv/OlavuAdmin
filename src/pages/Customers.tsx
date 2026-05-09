import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  Eye
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  city?: string;
  state?: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  is_active: boolean;
  created_at: string;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          placed_at,
          order_items (
            book_title,
            quantity
          )
        `)
        .eq('customer_id', customerId)
        .order('placed_at', { ascending: false });

      if (error) throw error;
      setCustomerOrders(data || []);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
    }
  };

  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
    await fetchCustomerOrders(customer.id);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage customer information</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-4 sm:mt-0">
          <Users className="h-4 w-4" />
          <span>Total Customers: {customers.length}</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Total Customers</p>
              <p className="text-lg font-bold text-blue-600">{customers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Active Customers</p>
              <p className="text-lg font-bold text-green-600">
                {customers.filter(c => c.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Total Revenue</p>
              <p className="text-lg font-bold text-yellow-600">
                ₹{customers.reduce((sum, c) => sum + (c.total_spent || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">New This Month</p>
              <p className="text-lg font-bold text-purple-600">
                {customers.filter(c => {
                  const created = new Date(c.created_at);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Orders</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Total Spent</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Last Order</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-medium">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">
                          Joined {format(new Date(customer.created_at), 'MMM yyyy')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 text-gray-400 mr-2" />
                        {customer.phone}
                      </div>
                      {customer.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-3 w-3 text-gray-400 mr-2" />
                          {customer.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {customer.city || customer.state ? (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-3 w-3 text-gray-400 mr-2" />
                        {[customer.city, customer.state].filter(Boolean).join(', ')}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not provided</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{customer.total_orders}</p>
                      <p className="text-gray-500">orders</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-green-600">₹{customer.total_spent.toLocaleString()}</p>
                  </td>
                  <td className="py-4 px-4">
                    {customer.last_order_date ? (
                      <div className="text-sm">
                        <p className="text-gray-900">
                          {format(new Date(customer.last_order_date), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-gray-500">
                          {format(new Date(customer.last_order_date), 'HH:mm')}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No orders</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleViewCustomer(customer)}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No customers found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm
                ? 'Try adjusting your search'
                : 'Customers will appear here once they start placing orders'
              }
            </p>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Customer Details
                </h2>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-yellow-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{selectedCustomer.name}</h3>
                    <p className="text-sm text-gray-500">
                      Customer since {format(new Date(selectedCustomer.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{selectedCustomer.phone}</span>
                    </div>
                    {selectedCustomer.email && (
                      <div className="flex items-center mb-2">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm">{selectedCustomer.email}</span>
                      </div>
                    )}
                    {(selectedCustomer.city || selectedCustomer.state) && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm">
                          {[selectedCustomer.city, selectedCustomer.state].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm mb-2">
                      <span className="text-gray-600">Total Orders: </span>
                      <span className="font-medium">{selectedCustomer.total_orders}</span>
                    </div>
                    <div className="text-sm mb-2">
                      <span className="text-gray-600">Total Spent: </span>
                      <span className="font-medium text-green-600">₹{selectedCustomer.total_spent.toLocaleString()}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Status: </span>
                      <span className={`font-medium ${selectedCustomer.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedCustomer.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Order History</h3>
                {customerOrders.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {customerOrders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">#{order.order_number}</span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(order.placed_at), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">
                              {order.order_items?.length || 0} items
                            </p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <span className="font-medium text-green-600">
                            ₹{order.total_amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No orders found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;