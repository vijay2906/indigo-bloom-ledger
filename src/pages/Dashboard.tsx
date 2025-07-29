import { MetricCard } from "@/components/MetricCard";
import { CustomPieChart as PieChart } from "@/components/charts/PieChart";
import { CustomBarChart as BarChart } from "@/components/charts/BarChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardData } from "@/hooks/useDashboard";
import { useCurrency } from "@/hooks/useCurrency";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";

const Dashboard = () => {
  const { data: dashboardData, isLoading, error } = useDashboardData();
  const { format: formatCurrency } = useCurrency();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-muted-foreground">Error loading dashboard data</p>
      </div>
    );
  }

  const {
    totalBalance = 0,
    monthlyIncome = 0,
    monthlyExpenses = 0,
    netWorth = 0,
    recentTransactions = [],
    upcomingPayments = [],
    accounts = [],
  } = dashboardData || {};

  // Prepare data for charts
  const expenseData = recentTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const categoryName = transaction.category?.name || 'Other';
      const existing = acc.find(item => item.name === categoryName);
      if (existing) {
        existing.value += Number(transaction.amount);
      } else {
        acc.push({
          name: categoryName,
          value: Number(transaction.amount),
          color: transaction.category?.color || '#8884d8',
        });
      }
      return acc;
    }, [] as Array<{ name: string; value: number; color: string }>);

  const monthlyData = [
    { name: 'Monthly', income: monthlyIncome, expenses: monthlyExpenses },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 to-secondary/30">
      {/* Mobile App Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Your financial overview</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 sm:px-6">

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="finance-card p-6 gradient-card hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">Net Worth</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(netWorth)}</p>
            <p className="text-sm text-muted-foreground mt-1">{netWorth > 0 ? "+12% from last month" : "Start tracking your finances"}</p>
          </div>
          
          <div className="finance-card p-6 gradient-card hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-success flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">Income</h3>
            </div>
            <p className="text-2xl font-bold metric-positive">{formatCurrency(monthlyIncome)}</p>
            <p className="text-sm text-muted-foreground mt-1">This month</p>
          </div>
          
          <div className="finance-card p-6 gradient-card hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-destructive flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">Expenses</h3>
            </div>
            <p className="text-2xl font-bold metric-negative">{formatCurrency(monthlyExpenses)}</p>
            <p className="text-sm text-muted-foreground mt-1">This month</p>
          </div>
          
          <div className="finance-card p-6 gradient-card hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-warning flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">Balance</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalBalance)}</p>
            <p className="text-sm text-muted-foreground mt-1">All accounts</p>
          </div>
        </div>

        {/* Charts and Data */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="finance-card p-6 gradient-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Monthly Overview</h3>
                <p className="text-sm text-muted-foreground">Income vs Expenses this month</p>
              </div>
            </div>
            <BarChart data={monthlyData} />
          </div>

          <div className="finance-card p-6 gradient-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-warning flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Expense Categories</h3>
                <p className="text-sm text-muted-foreground">Breakdown of your spending</p>
              </div>
            </div>
            <PieChart data={expenseData} />
          </div>
        </div>

        {/* Recent Activity and Quick Info */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Recent Transactions */}
          <div className="md:col-span-2 finance-card p-6 gradient-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Recent Transactions</h3>
                <p className="text-sm text-muted-foreground">Latest financial activity</p>
              </div>
            </div>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: transaction.category?.color || '#8884d8' }}
                      >
                        {transaction.category?.name?.charAt(0) || 'T'}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category?.name} • {format(new Date(transaction.date), 'MMM dd')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'metric-positive' : 'metric-negative'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(Number(transaction.amount)))}
                      </p>
                      <Badge variant="secondary" className="text-xs rounded-full">
                        {transaction.account?.name}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No recent transactions</p>
                  <p className="text-sm text-muted-foreground">Start by adding your first transaction!</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Payments */}
          <div className="finance-card p-6 gradient-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-warning flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Upcoming</h3>
                <p className="text-sm text-muted-foreground">Scheduled payments</p>
              </div>
            </div>
            <div className="space-y-4">
              {upcomingPayments.length > 0 ? (
                upcomingPayments.map((payment, index) => (
                  <div key={index} className="p-4 rounded-xl bg-background/50 border border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground text-sm">{payment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payment.next_emi_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <p className="font-semibold text-sm text-foreground">
                        {formatCurrency(Number(payment.emi_amount))}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No upcoming payments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;