import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('is_active', true);

      if (accountsError) {
        console.error('Accounts error:', accountsError);
      }

      // Get recent transactions
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(name, icon, color, type),
          account:accounts(name, type)
        `)
        .order('date', { ascending: false })
        .limit(5);

      // Get current month transactions
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      console.log('Current month range:', currentMonthStart.toISOString().split('T')[0], 'to', currentMonthEnd.toISOString().split('T')[0]);

      const { data: currentMonthTransactions } = await supabase
        .from('transactions')
        .select('amount, type')
        .gte('date', currentMonthStart.toISOString().split('T')[0])
        .lte('date', currentMonthEnd.toISOString().split('T')[0]);

      console.log('Current month transactions:', currentMonthTransactions);

      // Get last month transactions
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      console.log('Last month range:', lastMonthStart.toISOString().split('T')[0], 'to', lastMonthEnd.toISOString().split('T')[0]);

      const { data: lastMonthTransactions } = await supabase
        .from('transactions')
        .select('amount, type')
        .gte('date', lastMonthStart.toISOString().split('T')[0])
        .lte('date', lastMonthEnd.toISOString().split('T')[0]);

      console.log('Last month transactions:', lastMonthTransactions);

      // Get upcoming loan payments
      const { data: upcomingPayments } = await supabase
        .from('loans')
        .select('name, emi_amount, next_emi_date')
        .eq('is_active', true)
        .gte('next_emi_date', new Date().toISOString().split('T')[0])
        .order('next_emi_date')
        .limit(3);

      // Get active loans for net worth calculation
      const { data: activeLoans } = await supabase
        .from('loans')
        .select('remaining_balance')
        .eq('is_active', true);

      // Calculate totals
      const totalBalance = accounts?.reduce((sum, account) => sum + Number(account.balance), 0) || 0;
      const totalLoanBalance = activeLoans?.reduce((sum, loan) => sum + Number(loan.remaining_balance), 0) || 0;
      
      const currentMonthIncome = currentMonthTransactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      
      const currentMonthExpenses = currentMonthTransactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const lastMonthIncome = lastMonthTransactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      
      const lastMonthExpenses = lastMonthTransactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      // Net Worth = Total Assets - Total Liabilities
      const netWorth = totalBalance - totalLoanBalance;

      console.log('Dashboard calculations:', {
        currentMonthIncome,
        currentMonthExpenses,
        lastMonthIncome,
        lastMonthExpenses,
        totalBalance,
        totalLoanBalance,
        netWorth
      });

      return {
        totalBalance,
        currentMonthIncome,
        currentMonthExpenses,
        lastMonthIncome,
        lastMonthExpenses,
        netWorth,
        recentTransactions: recentTransactions || [],
        upcomingPayments: upcomingPayments || [],
        accounts: accounts || [],
      };
    },
  });
};