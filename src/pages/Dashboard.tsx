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
    currentMonthIncome = 0,
    currentMonthExpenses = 0,
    lastMonthIncome = 0,
    lastMonthExpenses = 0,
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
    { name: 'This Month', income: currentMonthIncome, expenses: currentMonthExpenses },
    { name: 'Last Month', income: lastMonthIncome, expenses: lastMonthExpenses },
  ];

  return (
    <div className="min-h-screen gradient-hero mobile-safe">
      <div className="px-4 py-6 mobile-spacing sm:px-6">

        {/* Enhanced Metrics Cards Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          
          <div className="finance-card mobile-card animate-fade-in-up [animation-delay:100ms]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl gradient-success flex items-center justify-center animate-pulse-glow">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mobile-text">Income</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold metric-positive">{formatCurrency(currentMonthIncome)}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">This month</p>
          </div>
          
          <div className="finance-card mobile-card animate-fade-in-up [animation-delay:200ms]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl gradient-destructive flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mobile-text">Expenses</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold metric-negative">{formatCurrency(currentMonthExpenses)}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">This month</p>
          </div>

          <div className="finance-card mobile-card animate-fade-in-up [animation-delay:300ms]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl gradient-success flex items-center justify-center opacity-80">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mobile-text">Income</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold metric-positive">{formatCurrency(lastMonthIncome)}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Last month</p>
          </div>
          
          <div className="finance-card mobile-card animate-fade-in-up [animation-delay:400ms]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl gradient-destructive flex items-center justify-center opacity-80">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mobile-text">Expenses</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold metric-negative">{formatCurrency(lastMonthExpenses)}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Last month</p>
          </div>
          
          <div className="finance-card mobile-card animate-fade-in-up [animation-delay:500ms]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl gradient-warning flex items-center justify-center animate-float">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mobile-text">Balance</h3>
            </div>
            <p className={`text-xl sm:text-2xl font-bold ${totalBalance >= 0 ? 'metric-positive' : 'metric-negative'}`}>
              {totalBalance >= 0 ? formatCurrency(totalBalance) : `-${formatCurrency(Math.abs(totalBalance))}`}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">All accounts</p>
          </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <div className="finance-card mobile-card animate-slide-in-right">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center icon-glow">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Monthly Comparison</h3>
                <p className="mobile-text text-muted-foreground">Current vs Previous month</p>
              </div>
            </div>
            <BarChart data={monthlyData} />
          </div>

          <div className="finance-card mobile-card animate-slide-in-right [animation-delay:200ms]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl gradient-warning flex items-center justify-center animate-pulse-glow">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Expense Categories</h3>
                <p className="mobile-text text-muted-foreground">Breakdown of your spending</p>
              </div>
            </div>
            <PieChart data={expenseData} />
          </div>
        </div>

        {/* Enhanced Activity Section */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 finance-card mobile-card">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center icon-glow">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Recent Transactions</h3>
                <p className="mobile-text text-muted-foreground">Latest financial activity</p>
              </div>
            </div>
            <div className="mobile-spacing">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction, index) => (
                  <div key={transaction.id} className={`finance-card-glass mobile-card animate-fade-in-up [animation-delay:${index * 50}ms]`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-semibold shadow-lg"
                          style={{ backgroundColor: transaction.category?.color || '#8884d8' }}
                        >
                          {transaction.category?.name?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground mobile-text">{transaction.description}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {transaction.category?.name} • {format(new Date(transaction.date), 'MMM dd')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold mobile-text ${
                          transaction.type === 'income' ? 'metric-positive' : 'metric-negative'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(Number(transaction.amount)))}
                        </p>
                        <Badge variant="secondary" className="text-xs rounded-full mt-1">
                          {transaction.account?.name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-3xl bg-muted mx-auto mb-6 flex items-center justify-center animate-float">
                    <CreditCard className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-semibold text-muted-foreground mb-2">No recent transactions</p>
                  <p className="mobile-text text-muted-foreground">Start by adding your first transaction!</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Payments */}
          <div className="finance-card mobile-card">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl gradient-warning flex items-center justify-center animate-pulse-glow">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Upcoming</h3>
                <p className="mobile-text text-muted-foreground">Scheduled payments</p>
              </div>
            </div>
            <div className="mobile-spacing">
              {upcomingPayments.length > 0 ? (
                upcomingPayments.map((payment, index) => (
                  <div key={index} className={`finance-card-glass mobile-card animate-fade-in-up [animation-delay:${index * 100}ms]`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground mobile-text">{payment.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(payment.next_emi_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold mobile-text text-foreground">
                          {formatCurrency(Number(payment.emi_amount))}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-3xl bg-muted mx-auto mb-4 flex items-center justify-center animate-float">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-muted-foreground mb-2">No upcoming payments</p>
                  <p className="text-xs text-muted-foreground">Your payment schedule is clear</p>
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