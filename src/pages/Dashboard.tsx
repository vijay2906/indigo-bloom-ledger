import { DollarSign, TrendingUp, TrendingDown, Calendar, CreditCard, Target } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { CustomPieChart } from "@/components/charts/PieChart";
import { CustomBarChart } from "@/components/charts/BarChart";

// Sample data for demo
const expenseData = [
  { name: "Housing", value: 2500, color: "hsl(var(--primary))" },
  { name: "Food", value: 800, color: "hsl(var(--success))" },
  { name: "Transportation", value: 600, color: "hsl(var(--warning))" },
  { name: "Entertainment", value: 400, color: "hsl(var(--destructive))" },
  { name: "Utilities", value: 300, color: "hsl(var(--muted-foreground))" },
];

const monthlyData = [
  { name: "Jan", income: 5000, expenses: 3800 },
  { name: "Feb", income: 5200, expenses: 4100 },
  { name: "Mar", income: 5000, expenses: 3900 },
  { name: "Apr", income: 5300, expenses: 4200 },
  { name: "May", income: 5100, expenses: 3700 },
  { name: "Jun", income: 5400, expenses: 4000 },
];

const upcomingPayments = [
  { name: "Mortgage", amount: "$2,500", date: "Dec 1", type: "housing" },
  { name: "Car Loan", amount: "$485", date: "Dec 3", type: "loan" },
  { name: "Credit Card", amount: "$1,200", date: "Dec 15", type: "credit" },
  { name: "Insurance", amount: "$340", date: "Dec 20", type: "insurance" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's your financial overview for November 2024.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Net Worth"
          value="$85,240"
          change="+$2,340 from last month"
          changeType="positive"
          icon={<DollarSign className="h-6 w-6 text-primary" />}
        />
        <MetricCard
          title="Monthly Income"
          value="$5,400"
          change="+5.2% from last month"
          changeType="positive"
          icon={<TrendingUp className="h-6 w-6 text-success" />}
        />
        <MetricCard
          title="Monthly Expenses"
          value="$4,000"
          change="+2.1% from last month"
          changeType="negative"
          icon={<TrendingDown className="h-6 w-6 text-destructive" />}
        />
        <MetricCard
          title="Savings Rate"
          value="26%"
          change="Same as last month"
          changeType="neutral"
          icon={<Target className="h-6 w-6 text-warning" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomPieChart 
          data={expenseData} 
          title="Expense Breakdown - November 2024"
        />
        <CustomBarChart 
          data={monthlyData} 
          title="Income vs Expenses - Last 6 Months"
        />
      </div>

      {/* Upcoming Payments */}
      <div className="finance-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Upcoming Payments</h3>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-4">
          {upcomingPayments.map((payment, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{payment.name}</p>
                  <p className="text-sm text-muted-foreground">Due {payment.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{payment.amount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="finance-card p-4 hover:bg-accent transition-colors text-left">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <span className="font-medium text-foreground">Add Income</span>
          </div>
        </button>
        <button className="finance-card p-4 hover:bg-accent transition-colors text-left">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
            <span className="font-medium text-foreground">Add Expense</span>
          </div>
        </button>
        <button className="finance-card p-4 hover:bg-accent transition-colors text-left">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium text-foreground">Set Goal</span>
          </div>
        </button>
        <button className="finance-card p-4 hover:bg-accent transition-colors text-left">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-warning" />
            </div>
            <span className="font-medium text-foreground">View Calendar</span>
          </div>
        </button>
      </div>
    </div>
  );
}