import { Plus, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import budgetsIcon from "@/assets/budgets-icon.jpg";

const budgets = [
  { category: "Housing", budgeted: 2500, spent: 2500, percentage: 100, color: "hsl(var(--primary))" },
  { category: "Food", budgeted: 800, spent: 620, percentage: 77.5, color: "hsl(var(--success))" },
  { category: "Transportation", budgeted: 600, spent: 480, percentage: 80, color: "hsl(var(--warning))" },
  { category: "Entertainment", budgeted: 400, spent: 320, percentage: 80, color: "hsl(var(--destructive))" },
  { category: "Utilities", budgeted: 300, spent: 280, percentage: 93.3, color: "hsl(var(--muted-foreground))" },
];

export default function Budgets() {
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
          {budgets.map((budget, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">{budget.category}</h4>
                <span className="text-sm text-muted-foreground">
                  ${budget.spent.toLocaleString()} / ${budget.budgeted.toLocaleString()}
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
                  ${(budget.budgeted - budget.spent).toLocaleString()} remaining
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}