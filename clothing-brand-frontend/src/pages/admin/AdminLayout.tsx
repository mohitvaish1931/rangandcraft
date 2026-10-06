import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet, NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, Ticket, Users,
  Image as ImageIcon, Tag, BarChart2, PieChart, LineChart,
  Settings, UsersRound, ShieldCheck, LogOut, Menu,
  ExternalLink, Star, Inbox
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { state, dispatch } = useAppContext();
  const user = state.user;

  useEffect(() => {
    if (!user) navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
  }, [user, navigate, location.pathname]);

  if (!user) return null;

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-md">
          <ShieldCheck className="w-10 h-10 mx-auto text-gray-400 mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Admin access required</h1>
          <p className="text-sm text-gray-500 mb-6">You are signed in as {user.email}, which is not an admin account.</p>
          <Link to="/" className="inline-block px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium">Back to store</Link>
        </div>
      </div>
    );
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  const navGroups = [
    {
      title: 'MANAGEMENT',
      items: [
        { path: '/admin/products', name: 'Products', icon: ShoppingBag },
        { path: '/admin/first-photo', name: 'First Photo Editor', icon: ImageIcon },
        { path: '/admin/inventory', name: 'Inventory', icon: Package },
        { path: '/admin/orders', name: 'Orders', icon: Ticket },
        { path: '/admin/customers', name: 'Customers', icon: Users },
        { path: '/admin/reviews', name: 'Reviews', icon: Star },
        { path: '/admin/inbox', name: 'Inbox', icon: Inbox },
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
        { path: '/admin/settings', name: 'Store Status', icon: Settings },
        { path: '/admin/users', name: 'Manage Users', icon: UsersRound },
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
        <div className="h-[88px] flex items-center px-6 shrink-0 bg-gradient-to-r from-[#143130] to-[#1f4645]">
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M50 10 C 60 30, 90 30, 90 50 C 90 70, 60 70, 50 90 C 40 70, 10 70, 10 50 C 10 30, 40 30, 50 10" fill="currentColor" fillOpacity="0.8"/>
              <circle cx="50" cy="50" r="15" fill="white"/>
            </svg>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold text-white tracking-wide leading-none">Rang and Craft</span>
              <span className="text-[10px] font-medium tracking-[0.3em] text-white/80 uppercase mt-0.5">JAIPUR</span>
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
                    ? 'bg-[#e3ecea] text-[#1f4645]'
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
                          ? 'bg-[#e3ecea] text-[#1f4645]'
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
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-[14px] font-medium text-[#1f4645] bg-[#e3ecea]/50 hover:bg-[#e3ecea] transition-colors"
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
              aria-label="Open admin menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-[15px] font-semibold text-gray-800">Rang and Craft · Admin</h1>
          </div>

          <div className="flex items-center gap-5">
            <a href="/" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              <ExternalLink className="w-4 h-4 text-gray-400" />
              Live Store
            </a>

            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-[#e3ecea] flex items-center justify-center text-[#1f4645] font-semibold text-lg border border-[#c9dbd8]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
                <p className="text-[11px] text-gray-500 font-medium">{user.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
