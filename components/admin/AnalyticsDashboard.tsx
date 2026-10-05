import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, Package, Users, Percent, Loader2 } from 'lucide-react';
import { OrderType, ProductType, UserType, CategoryType } from '@/lib/types';

interface AnalyticsProps {
  orders: OrderType[];
  products: ProductType[];
  users: UserType[];
  categories: CategoryType[];
  loading: boolean;
}

const COLORS = ['#656B4F', '#A9B896', '#EAF0E5', '#CDDBC6', '#8E9D64'];

export default function AnalyticsDashboard({ orders, products, users, categories, loading }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Filter orders based on time range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      if (timeRange === 'all') return true;
      if (timeRange === 'today') {
        return orderDate.toDateString() === now.toDateString();
      }
      if (timeRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return orderDate >= weekAgo;
      }
      if (timeRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return orderDate >= monthAgo;
      }
      return true;
    });
  }, [orders, timeRange]);

  const isOrderFailedOrExpired = (ord: OrderType) => {
    if (ord.paymentStatus === 'Failed' || ord.status === 'Cancelled') return true;
    if (ord.isLocked) return true;
    if (ord.paymentMethod === 'Razorpay (Online)' && ord.paymentStatus === 'Pending') {
      const createdTime = new Date(ord.createdAt).getTime();
      return Date.now() > createdTime + 30 * 60 * 1000;
    }
    return false;
  };

  const isConfirmed = (ord: OrderType) =>
    !isOrderFailedOrExpired(ord) &&
    ord.status !== 'Payment Failed' &&
    (ord.status === 'Confirmed' || ord.paymentStatus === 'Paid');

  // Metrics
  const totalRevenue = filteredOrders.filter(isConfirmed).reduce((acc, o) => acc + o.totalAmount, 0);
  const totalOrdersCount = filteredOrders.length;
  const confirmedOrdersCount = filteredOrders.filter(isConfirmed).length;
  const averageOrderValue = confirmedOrdersCount > 0 ? totalRevenue / confirmedOrdersCount : 0;
  const successRate = totalOrdersCount > 0 ? (confirmedOrdersCount / totalOrdersCount) * 100 : 0;
  
  // Total Items Sold
  const totalItemsSold = filteredOrders.filter(isConfirmed).reduce((acc, o) => {
    const itemsCount = o.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
    return acc + itemsCount;
  }, 0);

  // Revenue by Status
  const revenueByStatus = [
    { name: 'Confirmed', value: totalRevenue },
    { name: 'Awaiting', value: filteredOrders.filter(o => !isOrderFailedOrExpired(o) && (o.status === 'Awaiting Payment' || o.status === 'Pending') && o.paymentStatus === 'Pending').reduce((acc, o) => acc + o.totalAmount, 0) },
    { name: 'Failed/Cancelled', value: filteredOrders.filter(o => isOrderFailedOrExpired(o) || o.status === 'Payment Failed' || o.status === 'Cancelled').reduce((acc, o) => acc + o.totalAmount, 0) }
  ];

  // Daily Revenue (Last 7 Days)
  const dailyRevenue = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toDateString();
    }).reverse();

    return last7Days.map(dateStr => {
      const dayOrders = filteredOrders.filter(o => isConfirmed(o) && new Date(o.createdAt).toDateString() === dateStr);
      return {
        name: dateStr.split(' ')[0], // Mon, Tue, etc.
        date: dateStr.slice(4, 10), // Oct 04
        value: dayOrders.reduce((acc, o) => acc + o.totalAmount, 0)
      };
    });
  }, [filteredOrders]);

  // Top Products
  const topProducts = useMemo(() => {
    const productSales: Record<string, number> = {};
    filteredOrders.filter(isConfirmed).forEach(order => {
      order.items?.forEach(item => {
        productSales[item.name] = (productSales[item.name] || 0) + (item.quantity || 1);
      });
    });
    return Object.entries(productSales)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [filteredOrders]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Filters Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#4F534C]/15 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-[#1E201D] font-poppins">Analytics Overview</h2>
          <p className="text-xs text-[#61665D] mt-0.5">Track your store's performance and sales trends.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#EAF0E5] p-1 rounded-xl w-full sm:w-auto overflow-x-auto scrollbar-hide">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'Last 7 Days' },
            { id: 'month', label: 'Last 30 Days' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTimeRange(tab.id as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                timeRange === tab.id ? 'bg-[#656B4F] text-white shadow' : 'text-[#52574E] hover:text-[#1E201D]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#656B4F]" />
        </div>
      ) : (
        <>
          {/* Main KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#4F534C]/15 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-[11px] font-bold text-[#61665D] uppercase tracking-wider truncate">Revenue</h3>
              </div>
              <p className="text-2xl font-black text-[#1E201D]">₹{totalRevenue.toLocaleString()}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#4F534C]/15 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-[11px] font-bold text-[#61665D] uppercase tracking-wider truncate">Avg Order</h3>
              </div>
              <p className="text-2xl font-black text-[#1E201D]">₹{averageOrderValue.toFixed(0)}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#4F534C]/15 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="text-[11px] font-bold text-[#61665D] uppercase tracking-wider truncate">Items Sold</h3>
              </div>
              <p className="text-2xl font-black text-[#1E201D]">{totalItemsSold}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#4F534C]/15 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Percent className="w-5 h-5" />
                </div>
                <h3 className="text-[11px] font-bold text-[#61665D] uppercase tracking-wider truncate">Success Rate</h3>
              </div>
              <p className="text-2xl font-black text-[#1E201D]">{successRate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#4F534C]/15 shadow-sm">
              <h3 className="text-sm font-bold text-[#1E201D] mb-6">Revenue Trend (Last 7 Days)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#656B4F" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#656B4F" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAF0E5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#61665D', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#61665D', fontSize: 11 }} tickFormatter={(val) => `₹${val}`} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [`₹${value}`, 'Revenue']}
                      labelStyle={{ color: '#1E201D', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#656B4F" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#4F534C]/15 shadow-sm">
              <h3 className="text-sm font-bold text-[#1E201D] mb-6">Revenue by Order Status (Filtered)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByStatus} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAF0E5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#61665D', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#61665D', fontSize: 11 }} tickFormatter={(val) => `₹${val}`} />
                    <RechartsTooltip 
                      cursor={{ fill: '#E8EEE0' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [`₹${value}`, 'Revenue']}
                    />
                    <Bar dataKey="value" fill="#656B4F" radius={[6, 6, 0, 0]}>
                      {revenueByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#4F534C]/15 shadow-sm lg:col-span-2">
              <h3 className="text-sm font-bold text-[#1E201D] mb-6">Top Selling Products</h3>
              {topProducts.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EAF0E5" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#61665D', fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#1E201D', fontSize: 11, fontWeight: 'bold' }} width={120} />
                      <RechartsTooltip 
                        cursor={{ fill: '#E8EEE0' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`${value} units`, 'Sold']}
                      />
                      <Bar dataKey="sales" fill="#A9B896" radius={[0, 6, 6, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-[#61665D]">
                  <Package className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-xs">No product sales in this period.</p>
                </div>
              )}
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#4F534C]/15 shadow-sm">
              <h3 className="text-sm font-bold text-[#1E201D] mb-6">System Overview (All Time)</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#FAFAF5] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EAF0E5] text-[#656B4F] flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#1E201D]">Total Orders</span>
                  </div>
                  <span className="text-sm font-black">{orders.length}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#FAFAF5] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#1E201D]">Total Users</span>
                  </div>
                  <span className="text-sm font-black">{users.length}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#FAFAF5] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#1E201D]">Catalog Items</span>
                  </div>
                  <span className="text-sm font-black">{products.length}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
