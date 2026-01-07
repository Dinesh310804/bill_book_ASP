import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

function SolarProjectForm() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    project_name: '',
    site_address: '',
    system_capacity_kw: '',
    panel_type: '',
    panel_quantity: '',
    inverter_type: '',
    inverter_quantity: '',
    estimated_cost: '',
    subsidy_amount: '',
    discom_name: '',
    consumer_number: '',
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to load customers');
    }
  };

  const calculateSubsidy = (capacity) => {
    const kw = parseFloat(capacity);
    if (isNaN(kw) || kw <= 0) return 0;
    
    // PM Surya Ghar Yojana subsidy rates
    if (kw <= 2) {
      return kw * 30000; // ₹30,000 per kW for up to 2 kW
    } else if (kw <= 3) {
      return 60000 + ((kw - 2) * 18000); // ₹60,000 for 2kW + ₹18,000 per additional kW
    } else {
      return 78000; // Maximum ₹78,000 for 3kW and above
    }
  };

  const handleCapacityChange = (value) => {
    setFormData({ 
      ...formData, 
      system_capacity_kw: value,
      subsidy_amount: calculateSubsidy(value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_id) {
      toast.error('Please select a customer');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/solar/projects`, {
        ...formData,
        system_capacity_kw: parseFloat(formData.system_capacity_kw),
        panel_quantity: parseInt(formData.panel_quantity),
        inverter_quantity: parseInt(formData.inverter_quantity),
        estimated_cost: parseFloat(formData.estimated_cost),
        subsidy_amount: parseFloat(formData.subsidy_amount),
      });
      toast.success('Solar project created successfully');
      navigate('/solar/projects');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="solar-project-form">
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
          <h1 className="text-4xl font-heading font-bold text-slate-900">New Solar Project</h1>
          <p className="text-zinc-600 mt-2">Create a new PM Surya Ghar solar installation project</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="border-b border-zinc-100">
            <CardTitle className="text-lg font-heading">Customer & Project Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="customer" className="text-sm font-medium text-zinc-700">
                  Customer *
                </Label>
                <Select
                  value={formData.customer_id}
                  onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                >
                  <SelectTrigger className="mt-1.5" data-testid="customer-select">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="project_name" className="text-sm font-medium text-zinc-700">
                  Project Name *
                </Label>
                <Input
                  id="project_name"
                  required
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  className="mt-1.5"
                  placeholder="e.g., Residential Rooftop Solar Installation"
                  data-testid="project-name-input"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="site_address" className="text-sm font-medium text-zinc-700">
                  Installation Site Address *
                </Label>
                <Textarea
                  id="site_address"
                  required
                  value={formData.site_address}
                  onChange={(e) => setFormData({ ...formData, site_address: e.target.value })}
                  className="mt-1.5"
                  rows={2}
                  placeholder="Complete address where solar panels will be installed"
                  data-testid="site-address-input"
                />
              </div>

              <div>
                <Label htmlFor="start_date" className="text-sm font-medium text-zinc-700">
                  Project Start Date
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="mt-1.5"
                  data-testid="start-date-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="border-b border-zinc-100">
            <CardTitle className="text-lg font-heading">System Specifications</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="system_capacity_kw" className="text-sm font-medium text-zinc-700">
                  System Capacity (kW) *
                </Label>
                <Input
                  id="system_capacity_kw"
                  type="number"
                  step="0.01"
                  required
                  value={formData.system_capacity_kw}
                  onChange={(e) => handleCapacityChange(e.target.value)}
                  className="mt-1.5"
                  placeholder="e.g., 3.5"
                  data-testid="capacity-input"
                />
              </div>

              <div>
                <Label htmlFor="subsidy_amount" className="text-sm font-medium text-zinc-700">
                  PM Surya Ghar Subsidy (Auto-calculated)
                </Label>
                <Input
                  id="subsidy_amount"
                  type="number"
                  value={formData.subsidy_amount}
                  readOnly
                  className="mt-1.5 bg-emerald-50 font-mono font-semibold text-emerald-700"
                  data-testid="subsidy-input"
                />
              </div>

              <div>
                <Label htmlFor="panel_type" className="text-sm font-medium text-zinc-700">
                  Solar Panel Type *
                </Label>
                <Input
                  id="panel_type"
                  required
                  value={formData.panel_type}
                  onChange={(e) => setFormData({ ...formData, panel_type: e.target.value })}
                  className="mt-1.5"
                  placeholder="e.g., Monocrystalline 540W"
                  data-testid="panel-type-input"
                />
              </div>

              <div>
                <Label htmlFor="panel_quantity" className="text-sm font-medium text-zinc-700">
                  Panel Quantity *
                </Label>
                <Input
                  id="panel_quantity"
                  type="number"
                  required
                  value={formData.panel_quantity}
                  onChange={(e) => setFormData({ ...formData, panel_quantity: e.target.value })}
                  className="mt-1.5"
                  placeholder="e.g., 8"
                  data-testid="panel-qty-input"
                />
              </div>

              <div>
                <Label htmlFor="inverter_type" className="text-sm font-medium text-zinc-700">
                  Inverter Type *
                </Label>
                <Input
                  id="inverter_type"
                  required
                  value={formData.inverter_type}
                  onChange={(e) => setFormData({ ...formData, inverter_type: e.target.value })}
                  className="mt-1.5"
                  placeholder="e.g., String Inverter 5kW"
                  data-testid="inverter-type-input"
                />
              </div>

              <div>
                <Label htmlFor="inverter_quantity" className="text-sm font-medium text-zinc-700">
                  Inverter Quantity *
                </Label>
                <Input
                  id="inverter_quantity"
                  type="number"
                  required
                  value={formData.inverter_quantity}
                  onChange={(e) => setFormData({ ...formData, inverter_quantity: e.target.value })}
                  className="mt-1.5"
                  placeholder="e.g., 1"
                  data-testid="inverter-qty-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="border-b border-zinc-100">
            <CardTitle className="text-lg font-heading">Cost & DISCOM Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="estimated_cost" className="text-sm font-medium text-zinc-700">
                  Estimated Project Cost *
                </Label>
                <Input
                  id="estimated_cost"
                  type="number"
                  step="0.01"
                  required
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                  className="mt-1.5"
                  placeholder="Total project cost"
                  data-testid="cost-input"
                />
              </div>

              <div>
                <Label htmlFor="discom_name" className="text-sm font-medium text-zinc-700">
                  DISCOM Name *
                </Label>
                <Input
                  id="discom_name"
                  required
                  value={formData.discom_name}
                  onChange={(e) => setFormData({ ...formData, discom_name: e.target.value })}
                  className="mt-1.5"
                  placeholder="e.g., BSES Rajdhani, Adani Electricity"
                  data-testid="discom-input"
                />
              </div>

              <div>
                <Label htmlFor="consumer_number" className="text-sm font-medium text-zinc-700">
                  Consumer Number *
                </Label>
                <Input
                  id="consumer_number"
                  required
                  value={formData.consumer_number}
                  onChange={(e) => setFormData({ ...formData, consumer_number: e.target.value })}
                  className="mt-1.5"
                  placeholder="Electricity consumer number"
                  data-testid="consumer-number-input"
                />
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="notes" className="text-sm font-medium text-zinc-700">
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1.5"
                rows={3}
                placeholder="Any special requirements or notes about the project"
                data-testid="notes-input"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/solar/projects')}
            data-testid="cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800"
            data-testid="submit-project-button"
          >
            {loading ? 'Creating Project...' : 'Create Solar Project'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SolarProjectForm;
