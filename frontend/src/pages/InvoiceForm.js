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
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

function InvoiceForm() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    discount: 0,
    notes: '',
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to load customers');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        product_id: '',
        product_name: '',
        quantity: 1,
        price: 0,
        tax_rate: 18,
        discount: 0,
        amount: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === 'product_id') {
      const product = products.find((p) => p.id === value);
      if (product) {
        newItems[index].product_name = product.name;
        newItems[index].price = product.price;
        newItems[index].tax_rate = product.tax_rate;
      }
    }

    // Calculate amount
    const qty = parseFloat(newItems[index].quantity) || 0;
    const price = parseFloat(newItems[index].price) || 0;
    const discount = parseFloat(newItems[index].discount) || 0;
    newItems[index].amount = qty * price - discount;

    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = items.reduce((sum, item) => sum + (item.amount * item.tax_rate) / 100, 0);
    const discount = parseFloat(formData.discount) || 0;
    const total = subtotal + tax - discount;
    return { subtotal, tax, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_id) {
      toast.error('Please select a customer');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/invoices`, {
        ...formData,
        items,
      });
      toast.success('Invoice created successfully');
      navigate('/invoices');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="space-y-6" data-testid="invoice-form">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/invoices')}
          data-testid="back-button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-4xl font-heading font-bold text-slate-900">Create Invoice</h1>
          <p className="text-zinc-600 mt-2">Fill in the details to create a new invoice</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="border-b border-zinc-100">
            <CardTitle className="text-lg font-heading">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
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

              <div>
                <Label htmlFor="invoice_date" className="text-sm font-medium text-zinc-700">
                  Invoice Date
                </Label>
                <Input
                  id="invoice_date"
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                  className="mt-1.5"
                  data-testid="invoice-date-input"
                />
              </div>

              <div>
                <Label htmlFor="due_date" className="text-sm font-medium text-zinc-700">
                  Due Date (Optional)
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="mt-1.5"
                  data-testid="due-date-input"
                />
              </div>

              <div>
                <Label htmlFor="discount" className="text-sm font-medium text-zinc-700">
                  Discount
                </Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  className="mt-1.5"
                  data-testid="discount-input"
                />
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="notes" className="text-sm font-medium text-zinc-700">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1.5"
                rows={3}
                data-testid="notes-textarea"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="border-b border-zinc-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-heading">Items</CardTitle>
              <Button type="button" onClick={addItem} size="sm" data-testid="add-item-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {items.length === 0 ? (
              <p className="text-center text-zinc-600 py-8">No items added yet</p>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-zinc-200 rounded-lg"
                    data-testid={`invoice-item-${index}`}
                  >
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-zinc-700">Product</Label>
                      <Select
                        value={item.product_id}
                        onValueChange={(value) => updateItem(index, 'product_id', value)}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-zinc-700">Quantity</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-zinc-700">Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-zinc-700">Tax %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.tax_rate}
                        onChange={(e) => updateItem(index, 'tax_rate', e.target.value)}
                        className="mt-1.5"
                      />
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="flex-1">
                        <Label className="text-sm font-medium text-zinc-700">Amount</Label>
                        <p className="mt-1.5 font-mono font-semibold text-slate-900">
                          ₹{item.amount.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-3 max-w-sm ml-auto">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Subtotal:</span>
                <span className="font-mono font-semibold text-slate-900">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Tax:</span>
                <span className="font-mono font-semibold text-slate-900">
                  ₹{tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Discount:</span>
                <span className="font-mono font-semibold text-slate-900">
                  ₹{parseFloat(formData.discount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg border-t border-zinc-200 pt-3">
                <span className="font-semibold text-slate-900">Total:</span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/invoices')}
            data-testid="cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800"
            data-testid="submit-invoice-button"
          >
            {loading ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default InvoiceForm;
