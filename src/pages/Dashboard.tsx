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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your financial overview.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Net Worth"
          value={formatCurrency(netWorth)}
          change={netWorth > 0 ? "+12% from last month" : "Start tracking your finances"}
          changeType={netWorth > 0 ? "positive" : "neutral"}
          icon={<DollarSign className="h-6 w-6 text-primary" />}
        />
        <MetricCard
          title="Monthly Income"
          value={formatCurrency(monthlyIncome)}
          change="Income this month"
          changeType="positive"
          icon={<TrendingUp className="h-6 w-6 text-success" />}
        />
        <MetricCard
          title="Monthly Expenses"
          value={formatCurrency(monthlyExpenses)}
          change="Expenses this month"
          changeType="negative"
          icon={<TrendingDown className="h-6 w-6 text-destructive" />}
        />
        <MetricCard
          title="Total Balance"
          value={formatCurrency(totalBalance)}
          change="Across all accounts"
          changeType="neutral"
          icon={<CreditCard className="h-6 w-6 text-warning" />}
        />
      </div>

      {/* Charts and Data */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>Income vs Expenses this month</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={monthlyData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Breakdown of your spending</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart data={expenseData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Info */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Transactions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest financial activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: transaction.category?.color || '#8884d8' }}
                      >
                        {transaction.category?.name?.charAt(0) || 'T'}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category?.name} • {format(new Date(transaction.date), 'MMM dd')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(Number(transaction.amount)))}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {transaction.account?.name}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No recent transactions. Start by adding your first transaction!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Payments
            </CardTitle>
            <CardDescription>EMIs and scheduled payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingPayments.length > 0 ? (
                upcomingPayments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{payment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payment.next_emi_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <p className="font-medium text-sm">
                      {formatCurrency(Number(payment.emi_amount))}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No upcoming payments
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;