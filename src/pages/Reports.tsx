import { Download, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomBarChart } from "@/components/charts/BarChart";
import { CustomPieChart } from "@/components/charts/PieChart";
import { useCurrency } from "@/hooks/useCurrency";
import reportsIcon from "@/assets/reports-icon.jpg";

const yearlyData = [
  { name: "Jan", income: 5000, expenses: 3800 },
  { name: "Feb", income: 5200, expenses: 4100 },
  { name: "Mar", income: 5000, expenses: 3900 },
  { name: "Apr", income: 5300, expenses: 4200 },
  { name: "May", income: 5100, expenses: 3700 },
  { name: "Jun", income: 5400, expenses: 4000 },
  { name: "Jul", income: 5200, expenses: 3850 },
  { name: "Aug", income: 5300, expenses: 4050 },
  { name: "Sep", income: 5100, expenses: 3900 },
  { name: "Oct", income: 5400, expenses: 4100 },
  { name: "Nov", income: 5500, expenses: 4000 },
  { name: "Dec", income: 5600, expenses: 4200 },
];

const categoryData = [
  { name: "Housing", value: 30000, color: "hsl(var(--primary))" },
  { name: "Food", value: 9600, color: "hsl(var(--success))" },
  { name: "Transportation", value: 7200, color: "hsl(var(--warning))" },
  { name: "Entertainment", value: 4800, color: "hsl(var(--destructive))" },
  { name: "Utilities", value: 3600, color: "hsl(var(--muted-foreground))" },
];

export default function Reports() {
  const { format } = useCurrency();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Analyze your financial data with detailed reports and insights.
          </p>
        </div>
        <Button className="gradient-primary">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Module illustration */}
      <div className="finance-card p-8 text-center">
        <img 
          src={reportsIcon} 
          alt="Reports" 
          className="w-32 h-24 mx-auto rounded-lg object-cover mb-4"
        />
        <h3 className="text-lg font-semibold text-foreground">Financial Analytics</h3>
        <p className="text-muted-foreground mt-2">
          Get insights into your spending patterns and financial trends.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">YTD Income</h3>
          <p className="text-3xl font-bold metric-positive">$62,500</p>
          <p className="text-sm metric-positive mt-1">+8.5% vs last year</p>
        </div>
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">YTD Expenses</h3>
          <p className="text-3xl font-bold metric-negative">$46,800</p>
          <p className="text-sm metric-negative mt-1">+3.2% vs last year</p>
        </div>
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Net Savings</h3>
          <p className="text-3xl font-bold metric-positive">$15,700</p>
          <p className="text-sm metric-positive mt-1">+25.1% vs last year</p>
        </div>
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Savings Rate</h3>
          <p className="text-3xl font-bold text-primary">25.1%</p>
          <p className="text-sm metric-positive mt-1">+4.2% vs last year</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomBarChart 
          data={yearlyData} 
          title="Income vs Expenses - 2024"
        />
        <CustomPieChart 
          data={categoryData} 
          title="Annual Expense Breakdown"
        />
      </div>

      {/* Monthly Insights */}
      <div className="finance-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-3">Top Spending Categories</h4>
            <div className="space-y-3">
              {categoryData.slice(0, 3).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-foreground">{category.name}</span>
                  <span className="font-medium metric-negative">
                    {format(category.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-3">Key Metrics</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground">Average Monthly Income</span>
                <span className="font-medium metric-positive">$5,208</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground">Average Monthly Expenses</span>
                <span className="font-medium metric-negative">$3,900</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground">Average Monthly Savings</span>
                <span className="font-medium metric-positive">$1,308</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}