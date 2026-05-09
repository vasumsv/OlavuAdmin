import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  Truck, 
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Download
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  status: 'placed' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  shipping_address: any;
  tracking_awb?: string;
  courier_partner: string;
  placed_at: string;
  shipped_at?: string;
  delivered_at?: string;
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  book_title: string;
  book_author: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
}

const Orders: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const generateAddressLabel = (order: Order) => {
    try {
      // Create new PDF document (4x6 inches = 288x432 points)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [288, 432]
      });

      // Set font
      pdf.setFont('helvetica');

      // Header - Company Name
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(211, 47, 47); // Red color
      pdf.text('OLAVUBOOKS', 144, 25, { align: 'center' });
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(102, 102, 102); // Gray color
      pdf.text('Kannada Books Online', 144, 38, { align: 'center' });

      // Header border line
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(1);
      pdf.line(15, 45, 273, 45);

      // Order Information
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Order #${order.order_number}`, 15, 65);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Date: ${format(new Date(order.placed_at), 'dd/MM/yyyy')}`, 15, 80);

      // Payment Method Box
      pdf.setFillColor(255, 243, 205); // Light yellow background
      pdf.setDrawColor(255, 234, 167); // Yellow border
      pdf.rect(15, 90, 258, 20, 'FD');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(133, 100, 4); // Dark yellow text
      const paymentText = `PAYMENT: ${order.payment_method?.toUpperCase() || 'CASH ON DELIVERY (COD)'}`;
      pdf.text(paymentText, 144, 103, { align: 'center' });

      // Ship To Section
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('SHIP TO:', 15, 130);

      // Customer Name
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(order.customer_name, 15, 150);

      // Address
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      let yPosition = 170;
      
      // Split long address lines
      const addressLines = pdf.splitTextToSize(order.shipping_address.address_line, 250);
      addressLines.forEach((line: string) => {
        pdf.text(line, 15, yPosition);
        yPosition += 15;
      });
      
      pdf.text(`${order.shipping_address.city}, ${order.shipping_address.state}`, 15, yPosition);
      yPosition += 15;
      pdf.text(`PIN: ${order.shipping_address.pincode}`, 15, yPosition);
      yPosition += 20;

      // Contact Information
      pdf.setDrawColor(204, 204, 204);
      pdf.line(15, yPosition, 273, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(10);
      pdf.text(`Phone: ${order.customer_phone}`, 15, yPosition);
      yPosition += 15;
      
      if (order.customer_email) {
        pdf.text(`Email: ${order.customer_email}`, 15, yPosition);
        yPosition += 15;
      }

      // Total Amount Box
      yPosition += 10;
      pdf.setFillColor(248, 249, 250); // Light gray background
      pdf.setDrawColor(222, 226, 230); // Gray border
      pdf.rect(15, yPosition, 258, 25, 'FD');
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      const amount = parseFloat(order.total_amount.toString()).toFixed(2);
      const formattedAmount = new Intl.NumberFormat('en-IN').format(parseFloat(amount));
      const totalAmountText = `Total Amount: Rs. ${formattedAmount}`;
      pdf.text(totalAmountText, 144, yPosition + 17, { align: 'center' });

      // AWB Number (if available)
      if (order.tracking_awb) {
        yPosition += 35;
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`AWB: ${order.tracking_awb}`, 144, yPosition, { align: 'center' });
      }

      // Save the PDF
      pdf.save(`address-label-${order.order_number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Check for URL parameters to filter orders
    const urlParams = new URLSearchParams(location.search);
    const status = urlParams.get('status');
    if (status) {
      setStatusFilter(status);
    }
  }, []);

  useEffect(() => {
    // Update filter when location changes
    const urlParams = new URLSearchParams(location.search);
    const status = urlParams.get('status');
    if (status) {
      setStatusFilter(status);
    }
  }, [location.search]);
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            book_title,
            book_author,
            quantity,
            unit_price,
            total_amount
          )
        `)
        .order('placed_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'shipped' && !orders.find(o => o.id === orderId)?.shipped_at) {
        updateData.shipped_at = new Date().toISOString();
      }
      if (newStatus === 'delivered' && !orders.find(o => o.id === orderId)?.delivered_at) {
        updateData.delivered_at = new Date().toISOString();
      }
      if (newStatus === 'confirmed' && !orders.find(o => o.id === orderId)?.confirmed_at) {
        updateData.confirmed_at = new Date().toISOString();
      }
      if (newStatus === 'packed' && !orders.find(o => o.id === orderId)?.packed_at) {
        updateData.packed_at = new Date().toISOString();
      }
      if (newStatus === 'cancelled' && !orders.find(o => o.id === orderId)?.cancelled_at) {
        updateData.cancelled_at = new Date().toISOString();
      }
      
      // Always update the updated_at timestamp
      updateData.updated_at = new Date().toISOString();

      // Perform the update
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        throw error;
      }
      
      // Update local state immediately for better UX
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, ...updateData }
            : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      
      // Revert the UI change by refetching data
      fetchOrders();
    }
  };

  const updateAwbNumber = async (orderId: string, awbNumber: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          tracking_awb: awbNumber.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, tracking_awb: awbNumber.trim() || null }
            : order
        )
      );
    } catch (error) {
      console.error('Error updating AWB number:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      placed: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      confirmed: { color: 'bg-yellow-100 text-yellow-800', icon: CheckCircle },
      packed: { color: 'bg-purple-100 text-purple-800', icon: Package },
      shipped: { color: 'bg-indigo-100 text-indigo-800', icon: Truck },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
      returned: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || Clock;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm);
    
    let matchesStatus = true;
    if (statusFilter) {
      if (statusFilter.includes(',')) {
        // Handle multiple statuses (e.g., "placed,confirmed")
        const statuses = statusFilter.split(',');
        matchesStatus = statuses.includes(order.status);
      } else {
        matchesStatus = order.status === statusFilter;
      }
    }

    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage customer orders</p>
          {statusFilter && (
            <div className="mt-2 flex items-center text-blue-600">
              <Package className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">
                {statusFilter.includes(',') 
                  ? `Showing ${statusFilter.split(',').join(' and ')} orders`
                  : `Showing ${statusFilter} orders`
                }
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-4 sm:mt-0">
          <Calendar className="h-4 w-4" />
          <span>Total Orders: {orders.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Status</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="flex items-center text-sm text-gray-600">
            <Package className="h-4 w-4 mr-2" />
            {filteredOrders.length} orders
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Order</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Payment</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">#{order.order_number}</p>
                      <p className="text-sm text-gray-500">
                        {order.order_items?.length || 0} items
                      </p>
                      {order.tracking_awb && (
                        <p className="text-xs text-blue-600 font-medium">
                          AWB: {order.tracking_awb}
                        </p>
                      )}
                      {!order.tracking_awb && order.status === 'shipped' && (
                        <p className="text-xs text-orange-600">No AWB assigned</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer_name}</p>
                      <p className="text-sm text-gray-500">{order.customer_phone}</p>
                      {order.customer_email && (
                        <p className="text-xs text-gray-400">{order.customer_email}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-green-600">₹{order.total_amount.toLocaleString()}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      {getStatusBadge(order.status)}
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="block w-full text-xs border-gray-300 rounded focus:ring-red-500 focus:border-red-500 mt-1 bg-white"
                        disabled={false}
                      >
                        <option value="placed">Placed</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                      </select>
                      {/* AWB Input */}
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Enter AWB number"
                          defaultValue={order.tracking_awb || ''}
                          onBlur={(e) => updateAwbNumber(order.id, e.target.value)}
                          className="block w-full text-xs border-gray-300 rounded focus:ring-red-500 focus:border-red-500 placeholder-gray-400 px-2 py-1 bg-white"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {getPaymentStatusBadge(order.payment_status)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <p className="text-gray-900">
                        {format(new Date(order.placed_at), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-gray-500">
                        {format(new Date(order.placed_at), 'HH:mm')}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderModal(true);
                      }}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => generateAddressLabel(order)}
                      className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors ml-2"
                      title="Download Address Label"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm || statusFilter
                ? 'Try adjusting your filters'
                : 'Orders will appear here once customers start placing them'
              }
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Order #{selectedOrder.order_number}
                </h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Order Status */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Payment</span>
                  {getPaymentStatusBadge(selectedOrder.payment_status)}
                </div>
              </div>

              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm">{selectedOrder.customer_name} - {selectedOrder.customer_phone}</span>
                  </div>
                  {selectedOrder.customer_email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{selectedOrder.customer_email}</span>
                    </div>
                  )}
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                    <div className="text-sm">
                      <p>{selectedOrder.shipping_address.address_line}</p>
                      <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}</p>
                      <p>PIN: {selectedOrder.shipping_address.pincode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.book_title}</p>
                        <p className="text-sm text-gray-600">{item.book_author}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{item.total_amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">₹{item.unit_price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Total Amount</span>
                  <span className="text-lg font-bold text-green-600">₹{selectedOrder.total_amount.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Placed on {format(new Date(selectedOrder.placed_at), 'MMM dd, yyyy HH:mm')}
                </div>
                {selectedOrder.tracking_awb && (
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <p className="text-sm text-blue-800">
                      <Truck className="h-4 w-4 inline mr-1" />
                      AWB: {selectedOrder.tracking_awb}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Courier: {selectedOrder.courier_partner}
                    </p>
                  </div>
                )}
                {!selectedOrder.tracking_awb && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">
                      <Truck className="h-4 w-4 inline mr-1" />
                      No tracking number assigned yet
                    </p>
                  </div>
                )}
                
                {/* Download Address Label Button */}
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => generateAddressLabel(selectedOrder)}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Address Label
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;