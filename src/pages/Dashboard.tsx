import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  AlertTriangle,
  DollarSign,
  Star,
  Calendar,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, subDays, startOfDay, endOfDay, differenceInDays } from 'date-fns';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockCount: number;
  pendingOrders: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

interface TopProduct {
  id: string;
  title_en: string;
  author: string;
  total_sold: number;
  revenue: number;
}

interface LowStockProduct {
  id: string;
  title_en: string;
  sku: string;
  stock_qty: number;
  min_threshold: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  placed_at: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tempFromDate, setTempFromDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [tempToDate, setTempToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockCount: 0,
    pendingOrders: 0,
    revenueGrowth: 0,
    ordersGrowth: 0
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refreshDashboardData = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleViewRecords = () => {
    setFromDate(tempFromDate);
    setToDate(tempToDate);
    fetchDashboardData();
  };

  const handleQuickDateRange = (days: number) => {
    const today = new Date();
    const startDate = subDays(today, days - 1);
    const newFromDate = format(startDate, 'yyyy-MM-dd');
    const newToDate = format(today, 'yyyy-MM-dd');
    
    setTempFromDate(newFromDate);
    setTempToDate(newToDate);
    setFromDate(newFromDate);
    setToDate(newToDate);
    fetchDashboardData();
  };
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Convert dates to proper ISO format for database queries
      const startDate = startOfDay(new Date(fromDate)).toISOString();
      const endDate = endOfDay(new Date(toDate)).toISOString();
      
      // Calculate comparison period (same duration before the selected period)
      const daysDiff = differenceInDays(new Date(toDate), new Date(fromDate)) + 1;
      const comparisonStartDate = startOfDay(subDays(new Date(fromDate), daysDiff)).toISOString();
      const comparisonEndDate = endOfDay(subDays(new Date(fromDate), 1)).toISOString();

      // Fetch all data in parallel
      const [
        productsResult,
        customersResult,
        lowStockResult,
        pendingOrdersResult,
        currentPeriodDeliveredOrdersResult,
        previousPeriodDeliveredOrdersResult,
        topProductsResult,
        lowStockProductsResult,
        recentOrdersResult
      ] = await Promise.all([
        supabase.from('books').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('books').select('*', { count: 'exact', head: true }).lte('stock_qty', 5),
        supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['placed', 'confirmed']),
        supabase.from('orders').select('total_amount, created_at, status').eq('status', 'delivered').gte('placed_at', startDate).lte('placed_at', endDate),
        supabase.from('orders').select('total_amount, created_at, status').eq('status', 'delivered').gte('placed_at', comparisonStartDate).lte('placed_at', comparisonEndDate),
        supabase.from('order_items').select(`
          book_id,
          book_title,
          book_author,
          quantity,
          total_amount,
          created_at
        `).gte('created_at', startDate).lte('created_at', endDate),
        supabase.from('books').select('id, title_en, sku, stock_qty, min_threshold').lte('stock_qty', 5).eq('status', 'active').limit(10),
        supabase.from('orders').select('id, order_number, customer_name, total_amount, status, placed_at').gte('placed_at', startDate).lte('placed_at', endDate).order('placed_at', { ascending: false }).limit(10)
      ]);

      // Extract counts and data
      const totalProducts = productsResult.count || 0;
      const totalCustomers = customersResult.count || 0;
      const lowStockCount = lowStockResult.count || 0;
      const pendingOrders = pendingOrdersResult.count || 0;
      const currentPeriodDeliveredOrders = currentPeriodDeliveredOrdersResult.data || [];
      const previousPeriodDeliveredOrders = previousPeriodDeliveredOrdersResult.data || [];

      // Calculate current period stats (delivered orders only)
      const currentRevenue = currentPeriodDeliveredOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      const currentDeliveredOrders = currentPeriodDeliveredOrders.length;

      // Calculate previous period stats (delivered orders only)
      const previousRevenue = previousPeriodDeliveredOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      const previousDeliveredOrdersCount = previousPeriodDeliveredOrders.length;

      // Calculate growth percentages
      const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const ordersGrowth = previousDeliveredOrdersCount > 0 ? ((currentDeliveredOrders - previousDeliveredOrdersCount) / previousDeliveredOrdersCount) * 100 : 0;

      // Process top products
      const productSales: { [key: string]: TopProduct } = {};
      
      (topProductsResult.data || []).forEach(item => {
        const bookId = item.book_id;
        if (!productSales[bookId]) {
          productSales[bookId] = {
            id: bookId,
            title_en: item.book_title,
            author: item.book_author,
            total_sold: 0,
            revenue: 0
          };
        }
        productSales[bookId].total_sold += item.quantity;
        productSales[bookId].revenue += Number(item.total_amount);
      });

      const topProductsList = Object.values(productSales)
        .sort((a, b) => b.total_sold - a.total_sold)
        .slice(0, 5);

      // Set all state
      setStats({
        totalRevenue: currentRevenue,
        totalOrders: currentDeliveredOrders,
        totalProducts,
        totalCustomers,
        lowStockCount,
        pendingOrders,
        revenueGrowth,
        ordersGrowth
      });

      setTopProducts(topProductsList);
      setLowStockProducts(lowStockProductsResult.data || []);
      setRecentOrders(recentOrdersResult.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'low-stock':
        navigate('/products?filter=low-stock');
        break;
      case 'pending-orders':
        navigate('/orders?status=placed,confirmed');
        break;
      case 'analytics':
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        break;
      case 'revenue':
        navigate('/orders');
        break;
      default:
        break;
    }
  };


  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    growth?: number;
    onClick?: () => void;
  }> = ({ title, value, icon: Icon, color, growth }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {growth !== undefined && (
            <div className="flex items-center mt-2">
              {growth >= 0 ? (
                <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(growth).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs previous period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
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
      {/* Header with Date Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Analytics for {format(new Date(fromDate), 'MMM dd, yyyy')} - {format(new Date(toDate), 'MMM dd, yyyy')}</p>
        </div>
        
        {/* Date Range Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Quick Date Range Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleQuickDateRange(7)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              7 Days
            </button>
            <button
              onClick={() => handleQuickDateRange(30)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              30 Days
            </button>
            <button
              onClick={() => handleQuickDateRange(90)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              90 Days
            </button>
          </div>
          
          {/* Date Inputs */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <input
                type="date"
                value={tempFromDate}
                onChange={(e) => setTempFromDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">To:</label>
              <input
                type="date"
                value={tempToDate}
                onChange={(e) => setTempToDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <button
              onClick={handleViewRecords}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Calendar className="w-4 h-4" />
              <span>View Records</span>
            </button>
            <button
              onClick={refreshDashboardData}
              disabled={refreshing}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-green-500"
          growth={stats.revenueGrowth}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="bg-blue-500"
          growth={stats.ordersGrowth}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          color="bg-yellow-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => handleQuickAction('low-stock')}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Low Stock Alert</p>
              <p className="text-sm text-red-600">{stats.lowStockCount} products</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => handleQuickAction('pending-orders')}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Pending Orders</p>
              <p className="text-sm text-orange-600">{stats.pendingOrders} orders</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => handleQuickAction('revenue')}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Revenue Growth</p>
              <p className={`text-sm ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => handleQuickAction('analytics')}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Analytics</p>
              <p className="text-sm text-blue-600">View Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {product.title_en}
                      </p>
                      <p className="text-xs text-gray-500">{product.author}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{product.total_sold} sold</p>
                    <p className="text-xs text-green-600">₹{product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No sales data for selected period</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="space-y-4">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {product.title_en}
                    </p>
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">{product.stock_qty} left</p>
                    <p className="text-xs text-gray-500">Min: {product.min_threshold}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>All products are well stocked</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <ShoppingCart className="h-5 w-5 text-blue-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <p className="text-sm font-medium text-gray-900">#{order.order_number}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-sm text-gray-900">{order.customer_name}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-sm font-medium text-green-600">₹{order.total_amount.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-sm text-gray-500">
                        {format(new Date(order.placed_at), 'MMM dd, HH:mm')}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No orders found for selected period</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;