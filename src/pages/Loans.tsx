import { Plus, Calendar, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import loansIcon from "@/assets/loans-icon.jpg";

const loans = [
  {
    name: "Home Mortgage",
    totalAmount: 350000,
    remainingBalance: 285000,
    monthlyPayment: 2500,
    interestRate: 3.5,
    nextPayment: "Dec 1, 2024",
    term: "30 years"
  },
  {
    name: "Car Loan",
    totalAmount: 25000,
    remainingBalance: 18500,
    monthlyPayment: 485,
    interestRate: 4.2,
    nextPayment: "Dec 3, 2024",
    term: "5 years"
  },
  {
    name: "Student Loan",
    totalAmount: 45000,
    remainingBalance: 32000,
    monthlyPayment: 320,
    interestRate: 5.8,
    nextPayment: "Dec 15, 2024",
    term: "10 years"
  }
];

export default function Loans() {
  const totalOwed = loans.reduce((sum, loan) => sum + loan.remainingBalance, 0);
  const monthlyPayments = loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Loans</h1>
          <p className="text-muted-foreground mt-1">
            Track your loans, payments, and progress toward being debt-free.
          </p>
        </div>
        <Button className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Loan
        </Button>
      </div>

      {/* Module illustration */}
      <div className="finance-card p-8 text-center">
        <img 
          src={loansIcon} 
          alt="Loans" 
          className="w-32 h-24 mx-auto rounded-lg object-cover mb-4"
        />
        <h3 className="text-lg font-semibold text-foreground">Loan Management</h3>
        <p className="text-muted-foreground mt-2">
          Monitor your debt and track your journey to financial freedom.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Total Debt</h3>
          <p className="text-3xl font-bold metric-negative">${totalOwed.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">Remaining balance</p>
        </div>
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Monthly Payments</h3>
          <p className="text-3xl font-bold text-foreground">${monthlyPayments.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">Total due each month</p>
        </div>
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Next Payment</h3>
          <p className="text-3xl font-bold text-warning">Dec 1</p>
          <p className="text-sm text-muted-foreground mt-1">Mortgage due</p>
        </div>
      </div>

      {/* Loan Details */}
      <div className="space-y-4">
        {loans.map((loan, index) => (
          <div key={index} className="finance-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{loan.name}</h3>
                <p className="text-muted-foreground">{loan.interestRate}% APR • {loan.term}</p>
              </div>
              <div className="mt-2 lg:mt-0 text-left lg:text-right">
                <p className="text-2xl font-bold metric-negative">
                  ${loan.remainingBalance.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  of ${loan.totalAmount.toLocaleString()} remaining
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-muted-foreground">
                  {((loan.totalAmount - loan.remainingBalance) / loan.totalAmount * 100).toFixed(1)}% paid
                </span>
              </div>
              <Progress 
                value={(loan.totalAmount - loan.remainingBalance) / loan.totalAmount * 100} 
                className="h-3"
              />
            </div>

            {/* Payment info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">${loan.monthlyPayment}</p>
                  <p className="text-sm text-muted-foreground">Monthly payment</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{loan.nextPayment}</p>
                  <p className="text-sm text-muted-foreground">Next payment due</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}