import { useEffect, useState } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    hsn_code: '',
    unit: 'pcs',
    price: '',
    tax_rate: 18,
    stock_quantity: 0,
    low_stock_alert: 10,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/products`, {
        ...formData,
        price: parseFloat(formData.price),
        tax_rate: parseFloat(formData.tax_rate),
        stock_quantity: parseFloat(formData.stock_quantity),
        low_stock_alert: parseFloat(formData.low_stock_alert),
      });
      toast.success('Product added successfully');
      setDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        sku: '',
        hsn_code: '',
        unit: 'pcs',
        price: '',
        tax_rate: 18,
        stock_quantity: 0,
        low_stock_alert: 10,
      });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add product');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/products/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="space-y-6" data-testid="products-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold text-slate-900">Products</h1>
          <p className="text-zinc-600 mt-2">Manage your product inventory</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800" data-testid="add-product-button">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4" data-testid="product-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Label htmlFor="name" className="text-sm font-medium text-zinc-700">
                    Product Name *
                  </Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1.5"
                    data-testid="product-name-input"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description" className="text-sm font-medium text-zinc-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1.5"
                    rows={2}
                    data-testid="product-description-input"
                  />
                </div>
                <div>
                  <Label htmlFor="sku" className="text-sm font-medium text-zinc-700">
                    SKU
                  </Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="mt-1.5"
                    data-testid="product-sku-input"
                  />
                </div>
                <div>
                  <Label htmlFor="hsn_code" className="text-sm font-medium text-zinc-700">
                    HSN Code
                  </Label>
                  <Input
                    id="hsn_code"
                    value={formData.hsn_code}
                    onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                    className="mt-1.5"
                    data-testid="product-hsn-input"
                  />
                </div>
                <div>
                  <Label htmlFor="unit" className="text-sm font-medium text-zinc-700">
                    Unit
                  </Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="mt-1.5"
                    placeholder="pcs, kg, ltr"
                    data-testid="product-unit-input"
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="text-sm font-medium text-zinc-700">
                    Price *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="mt-1.5"
                    data-testid="product-price-input"
                  />
                </div>
                <div>
                  <Label htmlFor="tax_rate" className="text-sm font-medium text-zinc-700">
                    Tax Rate (%)
                  </Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.01"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                    className="mt-1.5"
                    data-testid="product-tax-input"
                  />
                </div>
                <div>
                  <Label htmlFor="stock_quantity" className="text-sm font-medium text-zinc-700">
                    Initial Stock
                  </Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    step="0.01"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="mt-1.5"
                    data-testid="product-stock-input"
                  />
                </div>
                <div>
                  <Label htmlFor="low_stock_alert" className="text-sm font-medium text-zinc-700">
                    Low Stock Alert
                  </Label>
                  <Input
                    id="low_stock_alert"
                    type="number"
                    step="0.01"
                    value={formData.low_stock_alert}
                    onChange={(e) => setFormData({ ...formData, low_stock_alert: e.target.value })}
                    className="mt-1.5"
                    data-testid="product-alert-input"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-slate-900 hover:bg-slate-800" data-testid="submit-product-button">
                  Add Product
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-zinc-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-zinc-600">Loading...</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-zinc-600 mb-4">No products found</p>
              <Button onClick={() => setDialogOpen(true)}>Add Your First Product</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Tax %
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Stock
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
                  {products.map((product) => {
                    const isLowStock = product.stock_quantity <= product.low_stock_alert;
                    return (
                      <tr key={product.id} className="hover:bg-zinc-50" data-testid={`product-row-${product.name}`}>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{product.name}</p>
                            {product.description && (
                              <p className="text-xs text-zinc-600 mt-0.5">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-zinc-600">
                          {product.sku || '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-sm text-slate-900">
                          ₹{product.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-sm text-zinc-600">
                          {product.tax_rate}%
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-sm text-slate-900">
                          {product.stock_quantity} {product.unit}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isLowStock ? (
                            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                data-testid={`delete-product-${product.name}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the
                                  product.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(product.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Products;
