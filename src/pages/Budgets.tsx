import { useState } from "react";
import { Plus, Target, AlertTriangle, Edit2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from "@/hooks/useBudgets";
import { useCurrency } from "@/hooks/useCurrency";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import budgetsIcon from "@/assets/budgets-icon.jpg";

export default function Budgets() {
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const { toast } = useToast();

  const { data: budgets = [], isLoading } = useBudgets();
  const { data: transactions = [] } = useTransactions();
  const { data: categories = [] } = useCategories();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();
  const { format } = useCurrency();

  const [budgetForm, setBudgetForm] = useState({
    name: '',
    category_id: '',
    amount: '',
    period: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  const budgetsWithSpending = budgets.map(budget => {
    const spent = transactions
      .filter(t => t.category_id === budget.category_id && t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    
    return {
      ...budget,
      spent,
      percentage,
      color: budget.category?.color || '#8b5cf6'
    };
  });

  const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.amount), 0);
  const totalSpent = budgetsWithSpending.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBudget) {
      updateBudget.mutate({
        id: editingBudget.id,
        ...budgetForm,
        amount: parseFloat(budgetForm.amount),
      }, {
        onSuccess: () => {
          setBudgetForm({ name: '', category_id: '', amount: '', period: 'monthly', start_date: new Date().toISOString().split('T')[0], end_date: '' });
          setShowBudgetForm(false);
          setEditingBudget(null);
        },
      });
    } else {
      createBudget.mutate({
        ...budgetForm,
        amount: parseFloat(budgetForm.amount),
      }, {
        onSuccess: () => {
          setBudgetForm({ name: '', category_id: '', amount: '', period: 'monthly', start_date: new Date().toISOString().split('T')[0], end_date: '' });
          setShowBudgetForm(false);
        },
      });
    }
  };

  const handleEditBudget = (budget: any) => {
    setBudgetForm({
      name: budget.name,
      category_id: budget.category_id,
      amount: budget.amount.toString(),
      period: budget.period,
      start_date: budget.start_date,
      end_date: budget.end_date || '',
    });
    setEditingBudget(budget);
    setShowBudgetForm(true);
  };

  const handleDeleteBudget = (id: string) => {
    deleteBudget.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Budgets</h1>
          <p className="text-muted-foreground mt-1">
            Plan and track your spending across different categories.
          </p>
        </div>
        <Button onClick={() => setShowBudgetForm(true)} className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Budget
        </Button>
      </div>

      {/* Add/Edit Budget Form */}
      {showBudgetForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</CardTitle>
            <CardDescription>{editingBudget ? 'Update your budget details' : 'Set spending limits for a category'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget-name">Budget Name *</Label>
                  <Input
                    id="budget-name"
                    value={budgetForm.name}
                    onChange={(e) => setBudgetForm({ ...budgetForm, name: e.target.value })}
                    placeholder="e.g., Monthly Groceries"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget-category">Category *</Label>
                  <Select
                    value={budgetForm.category_id}
                    onValueChange={(value) => setBudgetForm({ ...budgetForm, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.filter(c => c.type === 'expense').map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget-amount">Budget Amount *</Label>
                  <Input
                    id="budget-amount"
                    type="number"
                    step="0.01"
                    value={budgetForm.amount}
                    onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget-period">Period</Label>
                  <Select
                    value={budgetForm.period}
                    onValueChange={(value: any) => setBudgetForm({ ...budgetForm, period: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={budgetForm.start_date}
                    onChange={(e) => setBudgetForm({ ...budgetForm, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date (Optional)</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={budgetForm.end_date}
                    onChange={(e) => setBudgetForm({ ...budgetForm, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createBudget.isPending || updateBudget.isPending}>
                  {(createBudget.isPending || updateBudget.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : editingBudget ? (
                    <Edit2 className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {editingBudget ? 'Update Budget' : 'Create Budget'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowBudgetForm(false);
                  setEditingBudget(null);
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Module illustration */}
      <div className="finance-card p-8 text-center">
        <img 
          src={budgetsIcon} 
          alt="Budgets" 
          className="w-32 h-24 mx-auto rounded-lg object-cover mb-4"
        />
        <h3 className="text-lg font-semibold text-foreground">Budget Planning</h3>
        <p className="text-muted-foreground mt-2">
          Set spending limits and track your progress throughout the month.
        </p>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Total Budget</h3>
          <p className="text-3xl font-bold text-foreground">{format(totalBudget)}</p>
          <p className="text-sm text-muted-foreground mt-1">Monthly allocation</p>
        </div>
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Spent</h3>
          <p className="text-3xl font-bold metric-negative">{format(totalSpent)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% of budget
          </p>
        </div>
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Remaining</h3>
          <p className="text-3xl font-bold metric-positive">{format(Math.max(0, totalRemaining))}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {totalBudget > 0 ? ((totalRemaining / totalBudget) * 100).toFixed(1) : 0}% remaining
          </p>
        </div>
      </div>

      {/* Budget Categories */}
      <div className="finance-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Budget Categories</h3>
        <div className="space-y-6">
          {budgetsWithSpending.length > 0 ? (
            budgetsWithSpending.map((budget) => (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h4 className="font-medium text-foreground">{budget.category?.name || budget.name}</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBudget(budget)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this budget? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBudget(budget.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(budget.spent)} / {format(budget.amount)}
                  </span>
                </div>
                <Progress 
                  value={budget.percentage} 
                  className="h-3"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-medium ${
                    budget.percentage > 90 ? 'metric-negative' : 
                    budget.percentage > 75 ? 'text-warning' : 'metric-positive'
                  }`}>
                    {budget.percentage.toFixed(1)}% used
                  </span>
                  <span className="text-muted-foreground">
                    {format(Math.max(0, budget.amount - budget.spent))} remaining
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No budgets yet</p>
              <Button onClick={() => setShowBudgetForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Budget
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}