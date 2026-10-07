import { useState, useEffect } from 'react';
import {
  ShoppingBag, Package, Users, Tag, ChevronRight,
  Plus, ImageIcon, Settings, Calendar as CalendarIcon,
  Zap, Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { API_ENDPOINTS, fetchJSON } from '../../utils/api';
import { isSoldOut } from '../../lib/catalog';
import { shortOrderId } from '../../lib/format';
import { orderUserId, orderUserName, type AdminOrder } from '../../lib/adminTypes';

const AdminDashboard = () => {
  const { state } = useAppContext();
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  useEffect(() => {
    fetchJSON<AdminOrder[]>(API_ENDPOINTS.ORDERS.BASE).then(setOrders).catch(() => setOrders([]));
  }, []);

  const DAY = 86_400_000;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  // Seven calendar days ending today, oldest first.
  const days = Array.from({ length: 7 }, (_, i) => new Date(startOfToday.getTime() - (6 - i) * DAY));
  const dayLabels = days.map((d) => d.toLocaleDateString('en-IN', { weekday: 'short' }));
  const dayIndex = (iso?: string) => {
    if (!iso) return -1;
    const t = new Date(iso).getTime();
    const i = Math.floor((t - days[0].getTime()) / DAY);
    return i >= 0 && i < 7 ? i : -1;
  };
  const inPrevWeek = (iso?: string) => {
    if (!iso) return false;
    const t = new Date(iso).getTime();
    return t >= days[0].getTime() - 7 * DAY && t < days[0].getTime();
  };

  const paid = orders.filter((o) => o.isPaid || o.paymentStatus === 'Paid');
  const orderTotal = (o: AdminOrder) => o.totalPrice || o.totalAmount || 0;
  const customerKey = (o: AdminOrder) => orderUserId(o) || o.shippingAddress?.email || o.shippingAddress?.name || '';
  const totalRevenue = paid.reduce((sum, o) => sum + orderTotal(o), 0);
  const uniqueCustomers = new Set(paid.map(customerKey).filter(Boolean)).size;

  const revenueData = [0, 0, 0, 0, 0, 0, 0];
  const orderData = [0, 0, 0, 0, 0, 0, 0];
  const customerSets = days.map(() => new Set<string>());
  paid.forEach((o) => {
    const i = dayIndex(o.createdAt);
    if (i < 0) return;
    revenueData[i] += orderTotal(o);
    orderData[i] += 1;
    customerSets[i].add(customerKey(o));
  });
  const customerData = customerSets.map((set) => set.size);
  const productData = days.map((_, i) => state.products.filter((p) => dayIndex(p.createdAt) === i).length);

  const prevPaid = paid.filter((o) => inPrevWeek(o.createdAt));
  const sum = (list: number[]) => list.reduce((a, b) => a + b, 0);
  const trend = (current: number, previous: number, money = false) => {
    if (!current && !previous) return { text: 'No activity in the last 7 days', color: 'text-gray-500' };
    if (!previous) return { text: `${money ? '₹' : ''}${current.toLocaleString('en-IN')} in the last 7 days`, color: 'text-green-600' };
    const pct = Math.round(((current - previous) / previous) * 100);
    return { text: `${pct >= 0 ? '↑' : '↓'} ${Math.abs(pct)}% vs previous 7 days`, color: pct >= 0 ? 'text-green-600' : 'text-red-600' };
  };
  const revenueTrend = trend(sum(revenueData), sum(prevPaid.map(orderTotal)), true);
  const orderTrend = trend(sum(orderData), prevPaid.length);
  const customerTrend = trend(new Set(customerSets.flatMap((set) => [...set])).size, new Set(prevPaid.map(customerKey)).size);
  const productTrend = sum(productData)
    ? { text: `${sum(productData)} added in the last 7 days`, color: 'text-green-600' }
    : { text: 'None added in the last 7 days', color: 'text-gray-500' };

  const lowStock = state.products.filter((p) => !isSoldOut(p) && (p.countInStock ?? 99) <= 3);
  const outOfStock = state.products.filter(isSoldOut);

  const createSmoothPath = (x: number[], y: number[]) => {
    if (x.length === 0) return '';
    let d = `M${x[0]},${y[0]}`;
    for (let i = 0; i < x.length - 1; i++) {
      const xMid = (x[i] + x[i + 1]) / 2;
      d += ` C${xMid},${y[i]} ${xMid},${y[i+1]} ${x[i+1]},${y[i+1]}`;
    }
    return d;
  };

  const getSparklinePath = (data: number[]) => {
    const max = Math.max(...data, 1);
    const xPoints = [0, 16.66, 33.33, 50, 66.66, 83.33, 100];
    const yPoints = data.map(val => 25 - ((val / max) * 20));
    return {
      path: createSmoothPath(xPoints, yPoints),
      points: xPoints.map((x, i) => ({x, y: yPoints[i]}))
    };
  };

  const maxRevenue = Math.max(...revenueData, 1);
  const yAxisMax = Math.max(Math.ceil(maxRevenue / 5000) * 5000, 5000);
  
  const mainGraphX = [0, 16.66, 33.33, 50, 66.66, 83.33, 100];
  const mainGraphY = revenueData.map(val => 100 - ((val / yAxisMax) * 100));
  const mainLinePath = createSmoothPath(mainGraphX, mainGraphY);
  const mainAreaPath = `${mainLinePath} L100,100 L0,100 Z`;

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      change: revenueTrend.text,
      icon: ShoppingBag,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      line: '#9333ea',
      changeColor: revenueTrend.color,
      spark: getSparklinePath(revenueData)
    },
    {
      title: 'Paid Orders',
      value: paid.length,
      change: orderTrend.text,
      icon: Package,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      line: '#10b981',
      changeColor: orderTrend.color,
      spark: getSparklinePath(orderData)
    },
    {
      title: 'Total Customers',
      value: uniqueCustomers,
      change: customerTrend.text,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      line: '#3b82f6',
      changeColor: customerTrend.color,
      spark: getSparklinePath(customerData)
    },
    {
      title: 'Total Products',
      value: state.products.length,
      change: productTrend.text,
      icon: Package,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      line: '#f97316',
      changeColor: productTrend.color,
      spark: getSparklinePath(productData)
    }
  ];

  const recentOrders = orders.slice(0, 5).map(order => {
    const customerName = orderUserName(order) || order.shippingAddress?.fullName || order.shippingAddress?.name || 'Guest User';
    const initial = customerName.substring(0, 2).toUpperCase();
    
    const bgColors = ['bg-purple-100', 'bg-emerald-100', 'bg-blue-100', 'bg-orange-100', 'bg-gray-100'];
    const textColors = ['text-purple-700', 'text-emerald-700', 'text-blue-700', 'text-orange-700', 'text-gray-700'];
    const colorIndex = customerName.length % bgColors.length;

    const firstItem = order.orderItems?.[0] || order.items?.[0] || {};
    const productName = firstItem.name || 'Various Items';
    const image = firstItem.image || '';
    
    const status = order.status === 'Pending' && !order.isPaid ? 'Unpaid' : order.status || 'Pending';

    return {
      id: shortOrderId(order._id),
      initial,
      name: customerName,
      initialBg: bgColors[colorIndex],
      initialColor: textColors[colorIndex],
      product: productName,
      image,
      amount: `₹${orderTotal(order).toLocaleString('en-IN')}`,
      status,
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'
    };
  });

  const productSales: Record<string, {name: string, price: number, image: string, count: number}> = {};
  paid.forEach(order => {
    const items = order.orderItems || order.items || [];
    items.forEach((item) => {
      const pid = item.product || item._id || item.name;
      if (productSales[pid]) {
        productSales[pid].count += (item.qty || item.quantity || 1);
      } else {
        productSales[pid] = {
          name: item.name || 'Unknown Product',
          price: item.price || 0,
          image: item.image || '',
          count: item.qty || item.quantity || 1
        };
      }
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(p => ({
      name: p.name,
      price: `₹${p.price.toLocaleString('en-IN')}`,
      orders: `${p.count} sold`,
      image: p.image
    }));

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 leading-tight">
            Welcome back, <span className="text-[#6B21A8]">Admin</span> 👋
          </h1>
          <p className="text-[15px] text-gray-500 mt-1">
            Here's what's happening with <span className="font-semibold text-gray-700">Rang and Craft</span> today.
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-3.5 flex items-center gap-6 shadow-sm">
          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Today's Date</p>
            <p className="text-[14px] font-semibold text-gray-900 mt-0.5">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#F3E8FF] flex items-center justify-center text-[#6B21A8]">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-gray-500 mb-0.5">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
              </div>
            </div>
            <div>
              <p className={`text-[11px] font-semibold ${stat.changeColor} mb-3`}>{stat.change}</p>
              {/* SVG Sparkline */}
              <div className="h-10 w-full overflow-hidden mt-1">
                <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
                  <path d={stat.spark.path} fill="none" stroke={stat.line} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  {stat.spark.points.map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r="2" fill={stat.line} />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
              <button className="text-sm font-semibold text-[#6B21A8] flex items-center gap-1 hover:text-[#581C87] transition-colors">
                View All Orders <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left px-6 py-4 text-[12px] font-semibold text-gray-500">Order ID</th>
                    <th className="text-left px-6 py-4 text-[12px] font-semibold text-gray-500">Customer</th>
                    <th className="text-left px-6 py-4 text-[12px] font-semibold text-gray-500">Product</th>
                    <th className="text-left px-6 py-4 text-[12px] font-semibold text-gray-500">Amount</th>
                    <th className="text-left px-6 py-4 text-[12px] font-semibold text-gray-500">Status</th>
                    <th className="text-left px-6 py-4 text-[12px] font-semibold text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length > 0 ? recentOrders.map((order, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${order.initialBg} ${order.initialColor}`}>
                            {order.initial}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{order.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded border border-gray-200 overflow-hidden bg-gray-100 shrink-0">
                            {order.image ? (
                              <img src={order.image} alt={order.product} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">IMG</div>
                            )}
                          </div>
                          <span className="text-sm text-gray-600 truncate max-w-[150px] inline-block">{order.product}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">{order.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-semibold ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'Processing' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{order.date}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                        No recent orders found. Waiting for new sales!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sales Overview */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-gray-900">Sales Overview</h2>
              <div className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600">
                Last 7 days
              </div>
            </div>
            <div className="h-64 w-full relative">
              {/* Y-Axis Labels */}
              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[11px] font-medium text-gray-400">
                <span>₹{(yAxisMax).toLocaleString('en-IN')}</span>
                <span>₹{(yAxisMax * 0.75).toLocaleString('en-IN')}</span>
                <span>₹{(yAxisMax * 0.5).toLocaleString('en-IN')}</span>
                <span>₹{(yAxisMax * 0.25).toLocaleString('en-IN')}</span>
                <span>₹0</span>
              </div>
              {/* Chart Area */}
              <div className="absolute left-12 right-0 top-2 bottom-8 overflow-hidden">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6B21A8" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#6B21A8" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="0" x2="100" y2="0" stroke="#f3f4f6" strokeWidth="0.5" />
                  <line x1="0" y1="25" x2="100" y2="25" stroke="#f3f4f6" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#f3f4f6" strokeWidth="0.5" />
                  <line x1="0" y1="75" x2="100" y2="75" stroke="#f3f4f6" strokeWidth="0.5" />
                  <line x1="0" y1="100" x2="100" y2="100" stroke="#f3f4f6" strokeWidth="0.5" />
                  
                  {/* Area and Line */}
                  <path d={mainAreaPath} fill="url(#gradientArea)" />
                  <path d={mainLinePath} fill="none" stroke="#6B21A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  
                  {/* Points */}
                  {mainGraphX.map((x, i) => (
                    <circle key={i} cx={x} cy={mainGraphY[i]} r="1.5" fill="#6B21A8" />
                  ))}
                </svg>
              </div>
              {/* X-Axis Labels */}
              <div className="absolute left-12 right-0 bottom-0 flex justify-between text-[12px] font-medium text-gray-500">
                {dayLabels.map((label, i) => <span key={i}>{label}</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-gray-800" />
              <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">Add Product</p>
                    <p className="text-[11px] text-gray-500">Create a new product</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>

              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">Manage Banners</p>
                    <p className="text-[11px] text-gray-500">Update store banners</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>

              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">Manage Promotions</p>
                    <p className="text-[11px] text-gray-500">Create & manage offers</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>

              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">Store Settings</p>
                    <p className="text-[11px] text-gray-500">Configure your store</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>
            </div>
          </div>

          {/* Inventory health */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-gray-800" />
                <h2 className="text-[15px] font-bold text-gray-900">Inventory Health</h2>
              </div>
              <Link to="/admin/inventory" className="text-[12px] font-semibold text-[#6B21A8] hover:text-[#581C87]">Manage</Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-orange-50 p-3">
                <p className="text-2xl font-bold text-orange-700">{lowStock.length}</p>
                <p className="text-[12px] font-medium text-orange-700">Low stock (3 or fewer)</p>
              </div>
              <div className="rounded-xl bg-red-50 p-3">
                <p className="text-2xl font-bold text-red-700">{outOfStock.length}</p>
                <p className="text-[12px] font-medium text-red-700">Sold out</p>
              </div>
            </div>
            {lowStock.length > 0 && (
              <p className="mt-3 text-[12px] text-gray-500 truncate">Running low: {lowStock.slice(0, 3).map((p) => p.name).join(', ')}{lowStock.length > 3 ? '…' : ''}</p>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-bold text-gray-900">Top Products</h2>
              <Link to="/admin/reports/products" className="text-[12px] font-semibold text-[#6B21A8] hover:text-[#581C87]">View All</Link>
            </div>
            <div className="space-y-4">
              {topProducts.length > 0 ? topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">IMG</div>
                      )}
                    </div>
                    <p className="text-[13px] font-medium text-gray-800 truncate max-w-[120px]">{product.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-bold text-gray-900">{product.price}</p>
                    <p className="text-[11px] font-medium text-gray-400">{product.orders}</p>
                  </div>
                </div>
              )) : (
                <div className="py-6 text-center text-sm text-gray-500">
                  No products sold yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
