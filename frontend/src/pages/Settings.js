import { useEffect, useState } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '../App';

function Settings() {
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    gstin: '',
    address: '',
    phone: '',
    email: '',
    tax_rate: 18,
  });

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    try {
      const response = await axios.get(`${API}/businesses`);
      if (response.data.length > 0) {
        const biz = response.data[0];
        setBusiness(biz);
        setFormData({
          name: biz.name,
          gstin: biz.gstin || '',
          address: biz.address || '',
          phone: biz.phone || '',
          email: biz.email || '',
          tax_rate: biz.tax_rate || 18,
        });
      }
    } catch (error) {
      console.error('Failed to load business');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (business) {
        await axios.put(`${API}/businesses/${business.id}`, formData);
        toast.success('Business settings updated successfully');
      } else {
        await axios.post(`${API}/businesses`, formData);
        toast.success('Business created successfully');
        fetchBusiness();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-zinc-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="settings-page">
      <div>
        <h1 className="text-4xl font-heading font-bold text-slate-900">Settings</h1>
        <p className="text-zinc-600 mt-2">Manage your business and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Settings */}
        <div className="lg:col-span-2">
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="border-b border-zinc-100">
              <CardTitle className="text-lg font-heading">Business Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-zinc-700">
                    Business Name *
                  </Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1.5"
                    data-testid="business-name-input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="gstin" className="text-sm font-medium text-zinc-700">
                      GSTIN
                    </Label>
                    <Input
                      id="gstin"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      className="mt-1.5"
                      data-testid="business-gstin-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tax_rate" className="text-sm font-medium text-zinc-700">
                      Default Tax Rate (%)
                    </Label>
                    <Input
                      id="tax_rate"
                      type="number"
                      step="0.01"
                      value={formData.tax_rate}
                      onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                      className="mt-1.5"
                      data-testid="business-tax-input"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium text-zinc-700">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-1.5"
                    data-testid="business-address-input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-zinc-700">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1.5"
                      data-testid="business-phone-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-zinc-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1.5"
                      data-testid="business-email-input"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-slate-900 hover:bg-slate-800" data-testid="save-settings-button">
                    {business ? 'Update Settings' : 'Create Business'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <div>
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="border-b border-zinc-100">
              <CardTitle className="text-lg font-heading">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-600">Name</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600">Email</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600">Role</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{user?.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Settings;
