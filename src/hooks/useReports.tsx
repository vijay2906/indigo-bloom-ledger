import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTransactions } from "./useTransactions";
import { useMemo } from "react";

export const useReports = () => {
  const { data: transactions = [] } = useTransactions();

  // Calculate YTD data
  const reportData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentYearTransactions = transactions.filter(
      (t) => new Date(t.date).getFullYear() === currentYear
    );

    // Calculate totals
    const totalIncome = currentYearTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = currentYearTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Monthly data for charts
    const monthlyData = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const monthTransactions = currentYearTransactions.filter(
        (t) => new Date(t.date).getMonth() + 1 === month
      );

      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expenses = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        name: new Date(currentYear, index, 1).toLocaleDateString('en', { month: 'short' }),
        income,
        expenses,
      };
    });

    // Category breakdown (expenses only)
    const categoryMap = new Map();
    currentYearTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const categoryName = t.category?.name || 'Uncategorized';
        const current = categoryMap.get(categoryName) || 0;
        categoryMap.set(categoryName, current + Number(t.amount));
      });

    const categoryData = Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: `hsl(${(index * 60) % 360}, 70%, 50%)`,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categories

    // Previous year data for comparison
    const lastYear = currentYear - 1;
    const lastYearTransactions = transactions.filter(
      (t) => new Date(t.date).getFullYear() === lastYear
    );

    const lastYearIncome = lastYearTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const lastYearExpenses = lastYearTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const lastYearSavings = lastYearIncome - lastYearExpenses;

    // Calculate growth percentages
    const incomeGrowth = lastYearIncome > 0 ? ((totalIncome - lastYearIncome) / lastYearIncome) * 100 : 0;
    const expenseGrowth = lastYearExpenses > 0 ? ((totalExpenses - lastYearExpenses) / lastYearExpenses) * 100 : 0;
    const savingsGrowth = lastYearSavings > 0 ? ((netSavings - lastYearSavings) / lastYearSavings) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      monthlyData,
      categoryData,
      incomeGrowth,
      expenseGrowth,
      savingsGrowth,
      averageMonthlyIncome: totalIncome / 12,
      averageMonthlyExpenses: totalExpenses / 12,
      averageMonthlySavings: netSavings / 12,
    };
  }, [transactions]);

  return reportData;
};