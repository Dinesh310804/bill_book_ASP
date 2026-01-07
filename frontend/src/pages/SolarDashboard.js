import { useEffect, useState } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sun, Zap, TrendingUp, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

function SolarDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API}/solar/dashboard`);
      setDashboard(response.data);
    } catch (error) {
      toast.error('Failed to load solar dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-zinc-600">Loading solar dashboard...</div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Projects',
      value: dashboard?.total_projects || 0,
      icon: Sun,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Total Capacity',
      value: `${(dashboard?.total_capacity_kw || 0).toFixed(2)} kW`,
      icon: Zap,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      title: 'Estimated Revenue',
      value: `₹${(dashboard?.total_estimated_revenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Subsidy Amount',
      value: `₹${(dashboard?.total_subsidy_amount || 0).toLocaleString()}`,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="space-y-8" data-testid="solar-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold text-slate-900">Solar Projects Dashboard</h1>
          <p className="text-zinc-600 mt-2">PM Surya Ghar Yojana - Project & Subsidy Management</p>
        </div>
        <Link to="/solar/projects/new">
          <Button className="bg-slate-900 hover:bg-slate-800" data-testid="create-solar-project">
            <Sun className="w-4 h-4 mr-2" />
            New Solar Project
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-zinc-200 shadow-sm">
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

      {/* Project Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="border-b border-zinc-100">
            <CardTitle className="text-lg font-heading">Projects by Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {dashboard?.projects_by_status && Object.keys(dashboard.projects_by_status).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(dashboard.projects_by_status).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      {status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      )}
                      <span className="font-medium text-slate-900 capitalize">
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="font-mono font-semibold text-slate-900">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-zinc-600 py-8">No projects yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="border-b border-zinc-100">
            <CardTitle className="text-lg font-heading">Pending Subsidies</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-amber-50 mx-auto flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-3xl font-mono font-bold text-slate-900 mb-2">
                {dashboard?.pending_subsidies_count || 0}
              </p>
              <p className="text-sm text-zinc-600">Applications pending approval</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="border-b border-zinc-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-heading">Recent Projects</CardTitle>
            <Link to="/solar/projects">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {dashboard?.recent_projects && dashboard.recent_projects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Project #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      DISCOM
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {dashboard.recent_projects.map((project) => (
                    <tr key={project.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4 font-mono text-sm text-slate-900">
                        <Link to={`/solar/projects/${project.id}`} className="hover:text-emerald-600">
                          {project.project_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {project.customer_name}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-900">
                        {project.system_capacity_kw} kW
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600">
                        {project.discom_name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                            project.installation_status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : project.installation_status === 'in_progress'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {project.installation_status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-zinc-600 mb-4">No projects yet</p>
              <Link to="/solar/projects/new">
                <Button>Create Your First Solar Project</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SolarDashboard;
