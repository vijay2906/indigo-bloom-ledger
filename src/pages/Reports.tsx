import { Download, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomBarChart } from "@/components/charts/BarChart";
import { CustomPieChart } from "@/components/charts/PieChart";
import { useCurrency } from "@/hooks/useCurrency";
import { useReports } from "@/hooks/useReports";
import reportsIcon from "@/assets/reports-icon.jpg";

export default function Reports() {
  const { format } = useCurrency();
  const reportData = useReports();
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 to-secondary/30">
      {/* Mobile App Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Reports</h1>
              <p className="text-sm text-muted-foreground">Financial insights</p>
            </div>
          </div>
          <Button 
            size="sm"
            className="gradient-primary rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 sm:px-6">

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
          <p className="text-3xl font-bold metric-positive">{format(reportData.totalIncome)}</p>
          <p className="text-sm metric-positive mt-1">
            {reportData.incomeGrowth >= 0 ? '+' : ''}{reportData.incomeGrowth.toFixed(1)}% vs last year
          </p>
        </div>
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">YTD Expenses</h3>
          <p className="text-3xl font-bold metric-negative">{format(reportData.totalExpenses)}</p>
          <p className="text-sm metric-negative mt-1">
            {reportData.expenseGrowth >= 0 ? '+' : ''}{reportData.expenseGrowth.toFixed(1)}% vs last year
          </p>
        </div>
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Net Savings</h3>
          <p className={`text-3xl font-bold ${reportData.netSavings >= 0 ? 'metric-positive' : 'metric-negative'}`}>
            {reportData.netSavings >= 0 ? format(reportData.netSavings) : `-${format(Math.abs(reportData.netSavings))}`}
          </p>
          <p className="text-sm metric-positive mt-1">
            {reportData.savingsGrowth >= 0 ? '+' : ''}{reportData.savingsGrowth.toFixed(1)}% vs last year
          </p>
        </div>
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Savings Rate</h3>
          <p className="text-3xl font-bold text-primary">{reportData.savingsRate.toFixed(1)}%</p>
          <p className="text-sm metric-positive mt-1">of total income</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomBarChart 
          data={reportData.monthlyData} 
          title="Income vs Expenses - 2024"
        />
        <CustomPieChart 
          data={reportData.categoryData} 
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
              {reportData.categoryData.slice(0, 3).map((category, index) => (
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
                <span className="font-medium metric-positive">{format(reportData.averageMonthlyIncome)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground">Average Monthly Expenses</span>
                <span className="font-medium metric-negative">{format(reportData.averageMonthlyExpenses)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground">Average Monthly Savings</span>
                <span className="font-medium metric-positive">{format(reportData.averageMonthlySavings)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}