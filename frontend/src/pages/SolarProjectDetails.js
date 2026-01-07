import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sun, Zap, MapPin, Calendar, DollarSign, FileText, Package, Award } from 'lucide-react';
import { toast } from 'sonner';

function SolarProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [subsidies, setSubsidies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const [projectRes, milestonesRes, materialsRes, docsRes, subsidiesRes] = await Promise.all([
        axios.get(`${API}/solar/projects/${projectId}`),
        axios.get(`${API}/solar/milestones/${projectId}`),
        axios.get(`${API}/solar/materials/${projectId}`),
        axios.get(`${API}/solar/documents/${projectId}`),
        axios.get(`${API}/solar/subsidies/${projectId}`),
      ]);
      
      setProject(projectRes.data);
      setMilestones(milestonesRes.data);
      setMaterials(materialsRes.data);
      setDocuments(docsRes.data);
      setSubsidies(subsidiesRes.data);
    } catch (error) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-zinc-600">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg text-zinc-600 mb-4">Project not found</p>
          <Button onClick={() => navigate('/solar/projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700';
      case 'on_hold':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-amber-50 text-amber-700';
    }
  };

  return (
    <div className="space-y-6" data-testid="solar-project-details">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/solar/projects')}
            data-testid="back-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-heading font-bold text-slate-900">{project.project_name}</h1>
            <p className="text-zinc-600 mt-1">
              Project #{project.project_number} • {project.customer_name}
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(project.installation_status)}>
          {project.installation_status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-600">System Capacity</p>
                <p className="text-xl font-mono font-semibold text-slate-900">
                  {project.system_capacity_kw} kW
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-600">Project Cost</p>
                <p className="text-xl font-mono font-semibold text-slate-900">
                  ₹{project.estimated_cost.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-600">Subsidy Amount</p>
                <p className="text-xl font-mono font-semibold text-slate-900">
                  ₹{project.subsidy_amount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Sun className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-600">Panels</p>
                <p className="text-xl font-mono font-semibold text-slate-900">
                  {project.panel_quantity} units
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Details */}
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="border-b border-zinc-100">
          <CardTitle className="text-lg font-heading">Project Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-zinc-600 mb-1">Installation Address</p>
              <p className="text-sm font-medium text-slate-900 flex items-start">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-zinc-500" />
                {project.site_address}
              </p>
            </div>

            <div>
              <p className="text-sm text-zinc-600 mb-1">Start Date</p>
              <p className="text-sm font-medium text-slate-900 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-zinc-500" />
                {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
              </p>
            </div>

            <div>
              <p className="text-sm text-zinc-600 mb-1">Panel Type</p>
              <p className="text-sm font-medium text-slate-900">{project.panel_type}</p>
            </div>

            <div>
              <p className="text-sm text-zinc-600 mb-1">Inverter Type</p>
              <p className="text-sm font-medium text-slate-900">
                {project.inverter_type} ({project.inverter_quantity} units)
              </p>
            </div>

            <div>
              <p className="text-sm text-zinc-600 mb-1">DISCOM</p>
              <p className="text-sm font-medium text-slate-900">{project.discom_name}</p>
            </div>

            <div>
              <p className="text-sm text-zinc-600 mb-1">Consumer Number</p>
              <p className="text-sm font-mono font-medium text-slate-900">{project.consumer_number}</p>
            </div>

            {project.notes && (
              <div className="md:col-span-2">
                <p className="text-sm text-zinc-600 mb-1">Notes</p>
                <p className="text-sm text-slate-900">{project.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Milestones, Materials, Documents, Subsidies */}
      <Tabs defaultValue="milestones" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="subsidies">Subsidies</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones" className="mt-6">
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="border-b border-zinc-100">
              <CardTitle className="text-lg font-heading">Project Milestones</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {milestones.length === 0 ? (
                <p className="text-center text-zinc-600 py-8">No milestones added yet</p>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{milestone.milestone_name}</p>
                        {milestone.description && (
                          <p className="text-sm text-zinc-600 mt-1">{milestone.description}</p>
                        )}
                      </div>
                      <Badge className={getStatusColor(milestone.status)}>
                        {milestone.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="mt-6">
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="border-b border-zinc-100">
              <CardTitle className="text-lg font-heading">Material Consumption</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {materials.length === 0 ? (
                <p className="text-center text-zinc-600 py-8">No materials consumed yet</p>
              ) : (
                <div className="space-y-4">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0"
                    >
                      <div className="flex items-center space-x-3">
                        <Package className="w-5 h-5 text-zinc-500" />
                        <div>
                          <p className="font-medium text-slate-900">{material.product_name}</p>
                          <p className="text-sm text-zinc-600">
                            {new Date(material.consumption_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="font-mono font-semibold text-slate-900">
                        {material.quantity_used} units
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="border-b border-zinc-100">
              <CardTitle className="text-lg font-heading">Government Documents</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {documents.length === 0 ? (
                <p className="text-center text-zinc-600 py-8">No documents uploaded yet</p>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-zinc-500" />
                        <div>
                          <p className="font-medium text-slate-900">{doc.document_name}</p>
                          <p className="text-sm text-zinc-600 capitalize">
                            {doc.document_type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subsidies" className="mt-6">
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="border-b border-zinc-100">
              <CardTitle className="text-lg font-heading">Subsidy Tracking</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {subsidies.length === 0 ? (
                <p className="text-center text-zinc-600 py-8">No subsidy applications yet</p>
              ) : (
                <div className="space-y-4">
                  {subsidies.map((subsidy) => (
                    <div
                      key={subsidy.id}
                      className="p-4 border border-zinc-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium text-slate-900">{subsidy.scheme_name}</p>
                        <Badge className={getStatusColor(subsidy.status)}>
                          {subsidy.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-zinc-600">Applied Amount</p>
                          <p className="font-mono font-semibold text-slate-900">
                            ₹{subsidy.applied_amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-600">Approved Amount</p>
                          <p className="font-mono font-semibold text-emerald-600">
                            ₹{subsidy.approved_amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-600">Received Amount</p>
                          <p className="font-mono font-semibold text-blue-600">
                            ₹{subsidy.received_amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SolarProjectDetails;
