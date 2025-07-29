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
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 to-secondary/30">
      {/* Mobile App Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Budgets</h1>
              <p className="text-sm text-muted-foreground">Track your spending</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowBudgetForm(true)} 
            size="sm"
            className="gradient-primary rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 sm:px-6">

        {/* Add/Edit Budget Form */}
        {showBudgetForm && (
          <Card className="mx-auto max-w-2xl shadow-xl border-0 gradient-card">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
                {editingBudget ? <Edit2 className="h-8 w-8 text-white" /> : <Plus className="h-8 w-8 text-white" />}
              </div>
              <CardTitle className="text-2xl">{editingBudget ? 'Edit Budget' : 'Create Budget'}</CardTitle>
              <CardDescription className="text-base">{editingBudget ? 'Update your budget details' : 'Set spending limits for a category'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleBudgetSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="budget-name" className="text-sm font-medium">Budget Name *</Label>
                    <Input
                      id="budget-name"
                      value={budgetForm.name}
                      onChange={(e) => setBudgetForm({ ...budgetForm, name: e.target.value })}
                      placeholder="e.g., Monthly Groceries"
                      required
                      className="h-12 rounded-xl border-2 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="budget-category" className="text-sm font-medium">Category *</Label>
                    <Select
                      value={budgetForm.category_id}
                      onValueChange={(value) => setBudgetForm({ ...budgetForm, category_id: value })}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-2 focus:border-primary">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {categories?.filter(c => c.type === 'expense').map((category) => (
                          <SelectItem key={category.id} value={category.id} className="rounded-lg">
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="budget-amount" className="text-sm font-medium">Budget Amount *</Label>
                    <Input
                      id="budget-amount"
                      type="number"
                      step="0.01"
                      value={budgetForm.amount}
                      onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
                      placeholder="0.00"
                      required
                      className="h-12 rounded-xl border-2 focus:border-primary text-lg font-medium"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="budget-period" className="text-sm font-medium">Period</Label>
                    <Select
                      value={budgetForm.period}
                      onValueChange={(value: any) => setBudgetForm({ ...budgetForm, period: value })}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-2 focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="weekly" className="rounded-lg">Weekly</SelectItem>
                        <SelectItem value="monthly" className="rounded-lg">Monthly</SelectItem>
                        <SelectItem value="yearly" className="rounded-lg">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="start-date" className="text-sm font-medium">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={budgetForm.start_date}
                      onChange={(e) => setBudgetForm({ ...budgetForm, start_date: e.target.value })}
                      required
                      className="h-12 rounded-xl border-2 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="end-date" className="text-sm font-medium">End Date (Optional)</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={budgetForm.end_date}
                      onChange={(e) => setBudgetForm({ ...budgetForm, end_date: e.target.value })}
                      className="h-12 rounded-xl border-2 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={createBudget.isPending || updateBudget.isPending}
                    className="h-12 rounded-xl gradient-primary text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex-1"
                  >
                    {(createBudget.isPending || updateBudget.isPending) ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : editingBudget ? (
                      <Edit2 className="h-5 w-5 mr-2" />
                    ) : (
                      <Plus className="h-5 w-5 mr-2" />
                    )}
                    {editingBudget ? 'Update Budget' : 'Create Budget'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowBudgetForm(false);
                      setEditingBudget(null);
                    }}
                    className="h-12 rounded-xl border-2 font-medium flex-1 sm:flex-none sm:px-8"
                  >
                    Cancel
                  </Button>
                </div>
            </form>
          </CardContent>
        </Card>
      )}

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="finance-card p-6 gradient-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Target className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">Total Budget</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">{format(totalBudget)}</p>
            <p className="text-sm text-muted-foreground mt-1">Monthly allocation</p>
          </div>
          
          <div className="finance-card p-6 gradient-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-destructive flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">Spent</h3>
            </div>
            <p className="text-2xl font-bold metric-negative">{format(totalSpent)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% of budget
            </p>
          </div>
          
          <div className="finance-card p-6 gradient-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-success flex items-center justify-center">
                <Target className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">Remaining</h3>
            </div>
            <p className="text-2xl font-bold metric-positive">{format(Math.max(0, totalRemaining))}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {totalBudget > 0 ? ((totalRemaining / totalBudget) * 100).toFixed(1) : 0}% remaining
            </p>
          </div>
        </div>


        {/* Budget Categories */}
        <div className="space-y-4">
          {budgetsWithSpending.length > 0 ? (
            budgetsWithSpending.map((budget) => (
              <div key={budget.id} className="finance-card p-6 gradient-card hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{budget.category?.name || budget.name}</h4>
                      <p className="text-sm text-muted-foreground">{budget.period} budget</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditBudget(budget)}
                      className="rounded-full w-8 h-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-full w-8 h-8 p-0">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this budget? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteBudget(budget.id)}
                            className="bg-destructive hover:bg-destructive/90 rounded-xl"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{format(budget.spent)}</span>
                    <span className="text-sm text-muted-foreground">of {format(budget.amount)}</span>
                  </div>
                  
                  <div className="relative">
                    <Progress 
                      value={budget.percentage} 
                      className="h-2 rounded-full"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      budget.percentage > 90 ? 'bg-destructive-light text-destructive' : 
                      budget.percentage > 75 ? 'bg-warning-light text-warning' : 'bg-success-light text-success'
                    }`}>
                      {budget.percentage.toFixed(1)}% used
                    </span>
                    <span className="text-sm font-medium text-success">
                      {format(Math.max(0, budget.amount - budget.spent))} left
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="finance-card p-12 text-center gradient-card">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No budgets yet</h3>
              <p className="text-muted-foreground mb-6">Start managing your finances by creating your first budget</p>
              <Button 
                onClick={() => setShowBudgetForm(true)}
                className="gradient-primary rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Budget
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}