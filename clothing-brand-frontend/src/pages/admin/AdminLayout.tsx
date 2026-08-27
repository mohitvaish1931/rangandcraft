import { useState, useEffect } from 'react';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, Ticket, Users,
  Image as ImageIcon, Tag, BarChart2, PieChart, LineChart,
  Settings, UsersRound, ShieldCheck, LogOut, Menu, Search,
  Bell, ExternalLink, Command
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { state, dispatch } = useAppContext();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check localStorage directly to avoid race condition on refresh
    const rawUser = localStorage.getItem('rr_user');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        if (parsed && parsed.isAdmin) {
          // Restore user in context if not already set
          if (!state.user) {
            dispatch({ type: 'SET_USER', payload: { id: parsed.id, email: parsed.email, name: parsed.name, isAdmin: parsed.isAdmin } });
          }
          setIsChecking(false);
          return;
        }
      } catch (e) { /* ignore */ }
    }
    // No admin user found in localStorage
    if (!state.user || !state.user.isAdmin) {
      navigate('/login');
    }
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center"><div className="text-gray-400 text-lg">Loading...</div></div>;
  }

  const navGroups = [
    {
      title: 'MANAGEMENT',
      items: [
        { path: '/admin/products', name: 'Products', icon: ShoppingBag },
        { path: '/admin/first-photo', name: 'First Photo Editor', icon: ImageIcon },
        { path: '/admin/inventory', name: 'Inventory', icon: Package },
        { path: '/admin/orders', name: 'Orders', icon: Ticket },
        { path: '/admin/customers', name: 'Customers', icon: Users },
      ]
    },
    {
      title: 'MARKETING',
      items: [
        { path: '/admin/banners', name: 'Banners', icon: ImageIcon },
        { path: '/admin/promotions', name: 'Promotions', icon: Tag },
      ]
    },
    {
      title: 'REPORTS',
      items: [
        { path: '/admin/reports/sales', name: 'Sales Reports', icon: BarChart2 },
        { path: '/admin/reports/products', name: 'Product Reports', icon: PieChart },
        { path: '/admin/reports/customers', name: 'Customer Reports', icon: LineChart },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { path: '/admin/settings', name: 'Store Settings', icon: Settings },
        { path: '/admin/users', name: 'Manage Users', icon: UsersRound },
        { path: '/admin/roles', name: 'Roles & Permissions', icon: ShieldCheck },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-[88px] flex items-center px-6 shrink-0 bg-gradient-to-r from-[#6A1B9A] to-[#8E24AA]">
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M50 10 C 60 30, 90 30, 90 50 C 90 70, 60 70, 50 90 C 40 70, 10 70, 10 50 C 10 30, 40 30, 50 10" fill="currentColor" fillOpacity="0.8"/>
              <circle cx="50" cy="50" r="15" fill="white"/>
            </svg>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold text-white tracking-wide leading-none">Rang and Craft</span>
              <span className="text-[10px] font-medium tracking-[0.3em] text-white/80 uppercase mt-0.5">FASHION</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6 custom-scrollbar">
          {/* Dashboard (Top Level) */}
          <div>
            <NavLink
              to="/admin"
              end
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }: { isActive: boolean }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[#F3E8FF] text-[#6B21A8]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <LayoutDashboard className="w-[18px] h-[18px]" />
              <span>Dashboard</span>
            </NavLink>
          </div>

          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <p className="px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{group.title}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }: { isActive: boolean }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                        isActive
                          ? 'bg-[#F3E8FF] text-[#6B21A8]'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon className="w-[18px] h-[18px] text-gray-400" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="p-4 shrink-0">
          <button
            onClick={() => { /* Handle logout */ }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-[14px] font-medium text-[#6B21A8] bg-[#F3E8FF]/50 hover:bg-[#F3E8FF] transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-[88px] bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button className="hidden lg:block text-gray-400 hover:text-gray-600">
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="relative hidden md:block w-[380px] ml-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-2.5 pl-11 pr-12 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#D8B4FE] focus:ring-1 focus:ring-[#D8B4FE]"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5 shadow-sm">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#6B21A8] border-2 border-white rounded-full text-[9px] font-bold text-white flex items-center justify-center">3</span>
            </button>
            
            <a href="/" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              <ExternalLink className="w-4 h-4 text-gray-400" />
              Live Store
            </a>

            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[#6B21A8] font-semibold text-lg border border-[#E9D5FF]">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 leading-tight">Admin User</p>
                <p className="text-[11px] text-gray-500 font-medium">System Controller</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
