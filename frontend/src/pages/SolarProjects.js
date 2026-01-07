import { useEffect, useState } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

function SolarProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/solar/projects`);
      setProjects(response.data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/solar/projects/${id}`);
      toast.success('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="space-y-6" data-testid="solar-projects-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold text-slate-900">Solar Projects</h1>
          <p className="text-zinc-600 mt-2">Manage PM Surya Ghar solar installation projects</p>
        </div>
        <Link to="/solar/projects/new">
          <Button className="bg-slate-900 hover:bg-slate-800" data-testid="create-project-button">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      <Card className="border-zinc-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-zinc-600">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-zinc-600 mb-4">No solar projects found</p>
              <Link to="/solar/projects/new">
                <Button>Create Your First Project</Button>
              </Link>
            </div>
          ) : (
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
                      System
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      DISCOM
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Subsidy
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-zinc-50" data-testid={`project-row-${project.project_number}`}>
                      <td className="px-6 py-4 font-mono text-sm text-slate-900">
                        {project.project_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {project.customer_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {project.system_capacity_kw} kW
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600">
                        {project.discom_name}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-slate-900">
                        ₹{project.estimated_cost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-emerald-600">
                        ₹{project.subsidy_amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                            project.installation_status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : project.installation_status === 'in_progress'
                              ? 'bg-blue-50 text-blue-700'
                              : project.installation_status === 'on_hold'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {project.installation_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link to={`/solar/projects/${project.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              data-testid={`view-project-${project.project_number}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                data-testid={`delete-project-${project.project_number}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the
                                  project and all related data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(project.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SolarProjects;
