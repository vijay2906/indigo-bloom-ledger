import { Plus, Target, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import goalsIcon from "@/assets/goals-icon.jpg";

const goals = [
  {
    name: "Emergency Fund",
    targetAmount: 15000,
    currentAmount: 8500,
    deadline: "Dec 2025",
    category: "Safety Net",
    monthlyContribution: 500
  },
  {
    name: "Vacation to Europe",
    targetAmount: 5000,
    currentAmount: 2800,
    deadline: "Jun 2025",
    category: "Travel",
    monthlyContribution: 400
  },
  {
    name: "New Car Down Payment",
    targetAmount: 10000,
    currentAmount: 6200,
    deadline: "Mar 2025",
    category: "Transportation",
    monthlyContribution: 800
  },
  {
    name: "Home Renovation",
    targetAmount: 25000,
    currentAmount: 12000,
    deadline: "Sep 2025",
    category: "Home",
    monthlyContribution: 1200
  }
];

export default function Goals() {
  const totalGoals = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalMonthly = goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Savings Goals</h1>
          <p className="text-muted-foreground mt-1">
            Set and track your savings goals to achieve your financial dreams.
          </p>
        </div>
        <Button className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Module illustration */}
      <div className="finance-card p-8 text-center">
        <img 
          src={goalsIcon} 
          alt="Savings Goals" 
          className="w-32 h-24 mx-auto rounded-lg object-cover mb-4"
        />
        <h3 className="text-lg font-semibold text-foreground">Goal Achievement</h3>
        <p className="text-muted-foreground mt-2">
          Turn your financial dreams into achievable, trackable goals.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Total Goals</h3>
          <p className="text-3xl font-bold text-foreground">${totalGoals.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">Target amount</p>
        </div>
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Total Saved</h3>
          <p className="text-3xl font-bold metric-positive">${totalSaved.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {((totalSaved / totalGoals) * 100).toFixed(1)}% complete
          </p>
        </div>
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Monthly Savings</h3>
          <p className="text-3xl font-bold text-primary">${totalMonthly.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">Total contributions</p>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal, index) => (
          <div key={index} className="finance-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{goal.name}</h3>
                <p className="text-muted-foreground">{goal.category} • Target: {goal.deadline}</p>
              </div>
              <div className="mt-2 lg:mt-0 text-left lg:text-right">
                <p className="text-2xl font-bold text-foreground">
                  ${goal.currentAmount.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  of ${goal.targetAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-muted-foreground">
                  {((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}% complete
                </span>
              </div>
              <Progress 
                value={(goal.currentAmount / goal.targetAmount) * 100} 
                className="h-3"
              />
            </div>

            {/* Goal details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-medium text-foreground">${goal.monthlyContribution}</p>
                  <p className="text-sm text-muted-foreground">Monthly contribution</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    ${(goal.targetAmount - goal.currentAmount).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Remaining to save</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}