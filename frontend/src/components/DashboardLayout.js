import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  ShoppingCart,
} from 'lucide-react';

function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/invoices', label: 'Invoices', icon: FileText },
    { path: '/expenses', label: 'Expenses', icon: Receipt },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/vendors', label: 'Vendors', icon: ShoppingCart },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/solar', label: 'Solar Projects', icon: Building2 },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white fixed h-screen flex flex-col border-r border-zinc-800" data-testid="sidebar">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-heading font-bold">BillBook Pro</h1>
              <p className="text-xs text-zinc-400">Accounting & Solar</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-zinc-300 hover:bg-slate-800 hover:text-white'
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="mb-3 px-4">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-zinc-400">{user?.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-zinc-300 hover:text-white hover:bg-slate-800"
            data-testid="logout-button"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 bg-zinc-50">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
