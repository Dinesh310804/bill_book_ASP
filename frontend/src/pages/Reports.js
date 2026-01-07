import { useEffect, useState } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

function Reports() {
  const [salesReport, setSalesReport] = useState(null);
  const [expenseReport, setExpenseReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [salesRes, expenseRes] = await Promise.all([
        axios.get(`${API}/reports/sales`),
        axios.get(`${API}/reports/expenses`),
      ]);
      setSalesReport(salesRes.data);
      setExpenseReport(expenseRes.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-zinc-600">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="reports-page">
      <div>
        <h1 className="text-4xl font-heading font-bold text-slate-900">Reports</h1>
        <p className="text-zinc-600 mt-2">Analyze your business performance</p>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="sales" data-testid="sales-tab">Sales Report</TabsTrigger>
          <TabsTrigger value="expenses" data-testid="expenses-tab">Expense Report</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6 mt-6">
          {/* Sales Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-zinc-200 shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-zinc-600 mb-1">Total Sales</p>
                <p className="text-2xl font-mono font-semibold text-slate-900">
                  ₹{(salesReport?.summary?.total_sales || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="border-zinc-200 shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-zinc-600 mb-1">Total Tax</p>
                <p className="text-2xl font-mono font-semibold text-slate-900">
                  ₹{(salesReport?.summary?.total_tax || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="border-zinc-200 shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-zinc-600 mb-1">Paid Amount</p>
                <p className="text-2xl font-mono font-semibold text-emerald-600">
                  ₹{(salesReport?.summary?.total_paid || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="border-zinc-200 shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-zinc-600 mb-1">Outstanding</p>
                <p className="text-2xl font-mono font-semibold text-amber-600">
                  ₹{(salesReport?.summary?.total_outstanding || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Invoice List */}
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="border-b border-zinc-100">
              <CardTitle className="text-lg font-heading">All Invoices</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {salesReport?.invoices && salesReport.invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                          Invoice #
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {salesReport.invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-zinc-50">
                          <td className="px-6 py-4 font-mono text-sm text-slate-900">
                            {invoice.invoice_number}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900">
                            {invoice.customer_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-600">
                            {new Date(invoice.invoice_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-sm text-slate-900">
                            ₹{invoice.total.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                invoice.status === 'paid'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : invoice.status === 'partial'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {invoice.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-zinc-600">No sales data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6 mt-6">
          {/* Expense Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-zinc-200 shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-zinc-600 mb-1">Total Expenses</p>
                <p className="text-2xl font-mono font-semibold text-slate-900">
                  ₹{(expenseReport?.summary?.total_amount || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="border-zinc-200 shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-zinc-600 mb-1">Total Count</p>
                <p className="text-2xl font-mono font-semibold text-slate-900">
                  {expenseReport?.summary?.expense_count || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          {expenseReport?.summary?.category_breakdown && (
            <Card className="border-zinc-200 shadow-sm">
              <CardHeader className="border-b border-zinc-100">
                <CardTitle className="text-lg font-heading">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {Object.entries(expenseReport.summary.category_breakdown).map(
                    ([category, amount]) => (
                      <div key={category} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
                        <span className="text-sm font-medium text-slate-900">{category}</span>
                        <span className="font-mono font-semibold text-slate-900">
                          ₹{amount.toLocaleString()}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expense List */}
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="border-b border-zinc-100">
              <CardTitle className="text-lg font-heading">All Expenses</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {expenseReport?.expenses && expenseReport.expenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                          Expense #
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {expenseReport.expenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-zinc-50">
                          <td className="px-6 py-4 font-mono text-sm text-slate-900">
                            {expense.expense_number}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900">
                            {expense.category_name || 'Uncategorized'}
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-600">
                            {new Date(expense.expense_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-sm text-slate-900">
                            ₹{expense.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-zinc-600">No expense data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Reports;
