import { Plus, Target, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBudgets } from "@/hooks/useBudgets";
import { useCurrency } from "@/hooks/useCurrency";
import { useTransactions } from "@/hooks/useTransactions";
import budgetsIcon from "@/assets/budgets-icon.jpg";

export default function Budgets() {
  const { data: budgets = [], isLoading } = useBudgets();
  const { data: transactions = [] } = useTransactions();
  const { format } = useCurrency();

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

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-96"><p className="text-muted-foreground">Loading budgets...</p></div>;
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
        <Button className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Budget
        </Button>
      </div>

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
          <p className="text-3xl font-bold text-foreground">$4,600</p>
          <p className="text-sm text-muted-foreground mt-1">Monthly allocation</p>
        </div>
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Spent</h3>
          <p className="text-3xl font-bold metric-negative">$4,200</p>
          <p className="text-sm text-muted-foreground mt-1">91.3% of budget</p>
        </div>
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Remaining</h3>
          <p className="text-3xl font-bold metric-positive">$400</p>
          <p className="text-sm text-muted-foreground mt-1">8.7% remaining</p>
        </div>
      </div>

      {/* Budget Categories */}
      <div className="finance-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Budget Categories</h3>
        <div className="space-y-6">
          {budgetsWithSpending.map((budget, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">{budget.category?.name || budget.name}</h4>
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
          ))}
        </div>
      </div>
    </div>
  );
}