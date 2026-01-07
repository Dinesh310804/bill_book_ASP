import { useEffect, useState } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Receipt,
  Users,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-zinc-600">Loading dashboard...</div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Sales',
      value: `₹${(stats?.total_sales || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Total Expenses',
      value: `₹${(stats?.total_expenses || 0).toLocaleString()}`,
      icon: Receipt,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: 'Profit',
      value: `₹${(stats?.profit || 0).toLocaleString()}`,
      icon: stats?.profit >= 0 ? TrendingUp : TrendingDown,
      color: stats?.profit >= 0 ? 'text-emerald-600' : 'text-red-600',
      bg: stats?.profit >= 0 ? 'bg-emerald-50' : 'bg-red-50',
    },
    {
      title: 'Outstanding',
      value: `₹${(stats?.total_outstanding || 0).toLocaleString()}`,
      icon: FileText,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  const metricCards = [
    { title: 'Customers', value: stats?.customers_count || 0, icon: Users },
    { title: 'Invoices', value: stats?.invoices_count || 0, icon: FileText },
    { title: 'Products', value: stats?.products_count || 0, icon: Package },
  ];

  return (
    <div className="space-y-8" data-testid="dashboard">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-heading font-bold text-slate-900">Dashboard</h1>
        <p className="text-zinc-600 mt-2">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-zinc-200 shadow-sm" data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-mono font-semibold text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="border-zinc-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-zinc-600" />
                  <div>
                    <p className="text-sm text-zinc-600">{metric.title}</p>
                    <p className="text-xl font-mono font-semibold text-slate-900">
                      {metric.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="border-b border-zinc-100 pb-4">
            <CardTitle className="text-lg font-heading">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {stats?.recent_invoices && stats.recent_invoices.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{invoice.customer_name}</p>
                      <p className="text-sm text-zinc-600 font-mono">
                        {invoice.invoice_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold text-slate-900">
                        ₹{invoice.total.toLocaleString()}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          invoice.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : invoice.status === 'partial'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
                <Link to="/invoices">
                  <Button variant="ghost" className="w-full mt-2" data-testid="view-all-invoices">
                    View All Invoices
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-zinc-600 mb-4">No invoices yet</p>
                <Link to="/invoices/new">
                  <Button data-testid="create-first-invoice">Create Invoice</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="border-b border-zinc-100 pb-4">
            <CardTitle className="text-lg font-heading">Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {stats?.recent_expenses && stats.recent_expenses.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {expense.category_name || 'Uncategorized'}
                      </p>
                      <p className="text-sm text-zinc-600">
                        {expense.description || expense.expense_number}
                      </p>
                    </div>
                    <p className="font-mono font-semibold text-slate-900">
                      ₹{expense.total.toLocaleString()}
                    </p>
                  </div>
                ))}
                <Link to="/expenses">
                  <Button variant="ghost" className="w-full mt-2" data-testid="view-all-expenses">
                    View All Expenses
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-zinc-600 mb-4">No expenses yet</p>
                <Link to="/expenses/new">
                  <Button data-testid="create-first-expense">Add Expense</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {stats?.low_stock_products && stats.low_stock_products.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 shadow-sm">
          <CardHeader className="border-b border-amber-100 pb-4">
            <CardTitle className="text-lg font-heading flex items-center text-amber-900">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.low_stock_products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-4 rounded-lg border border-amber-200"
                >
                  <p className="font-medium text-slate-900">{product.name}</p>
                  <p className="text-sm text-zinc-600 mt-1">
                    Stock: <span className="font-mono font-semibold text-amber-700">
                      {product.stock_quantity} {product.unit}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Dashboard;
