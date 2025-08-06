import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLoans, useCreateLoan, useCreateLoanPayment, useUpdateLoan, useDeleteLoan } from "@/hooks/useLoans";
import { useCurrency } from "@/hooks/useCurrency";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Calendar, TrendingDown, DollarSign, Edit2, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

const Loans = () => {
  const [showLoanForm, setShowLoanForm] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<any>(null);
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrency();

  const { data: loans, isLoading } = useLoans();
  const createLoan = useCreateLoan();
  const updateLoan = useUpdateLoan();
  const deleteLoan = useDeleteLoan();
  const createPayment = useCreateLoanPayment();

  const [loanForm, setLoanForm] = useState({
    name: 'Personal Loan Tele-Binding',
    type: 'personal' as 'personal' | 'home' | 'auto' | 'student' | 'business',
    principal_amount: '541272',
    interest_rate: '19',
    tenure_months: '48',
    start_date: '2025-01-22',
  });

  const [paymentForm, setPaymentForm] = useState({
    loan_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
  });

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLoan) {
      updateLoan.mutate({ 
        id: editingLoan.id,
        name: loanForm.name,
        type: loanForm.type,
        principal_amount: parseFloat(loanForm.principal_amount),
        interest_rate: parseFloat(loanForm.interest_rate),
        tenure_months: parseInt(loanForm.tenure_months),
        start_date: loanForm.start_date,
      }, {
        onSuccess: () => {
          setLoanForm({
            name: '',
            type: 'personal',
            principal_amount: '',
            interest_rate: '',
            tenure_months: '',
            start_date: new Date().toISOString().split('T')[0],
          });
          setShowLoanForm(false);
          setEditingLoan(null);
        },
      });
    } else {
      createLoan.mutate({
        ...loanForm,
        principal_amount: parseFloat(loanForm.principal_amount),
        interest_rate: parseFloat(loanForm.interest_rate),
        tenure_months: parseInt(loanForm.tenure_months),
      }, {
        onSuccess: () => {
          setLoanForm({
            name: '',
            type: 'personal',
            principal_amount: '',
            interest_rate: '',
            tenure_months: '',
            start_date: new Date().toISOString().split('T')[0],
          });
          setShowLoanForm(false);
          setEditingLoan(null);
        },
      });
    }
  };

  const handleEditLoan = (loan: any) => {
    setLoanForm({
      name: loan.name,
      type: loan.type,
      principal_amount: loan.principal_amount.toString(),
      interest_rate: loan.interest_rate.toString(),
      tenure_months: loan.tenure_months.toString(),
      start_date: loan.start_date,
    });
    setEditingLoan(loan);
    setShowLoanForm(true);
  };

  const handleDeleteLoan = (id: string) => {
    deleteLoan.mutate(id);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.loan_id) {
      toast({
        variant: "destructive",
        title: "Loan Required",
        description: "Please select a loan for the payment.",
      });
      return;
    }

    createPayment.mutate({
      ...paymentForm,
      amount: parseFloat(paymentForm.amount),
    }, {
      onSuccess: () => {
        setPaymentForm({
          loan_id: '',
          amount: '',
          payment_date: new Date().toISOString().split('T')[0],
        });
        setShowPaymentForm(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalOwed = loans?.reduce((sum, loan) => sum + loan.remaining_balance, 0) || 0;
  const monthlyPayments = loans?.reduce((sum, loan) => sum + loan.emi_amount, 0) || 0;
  const nextPayment = loans?.sort((a, b) => new Date(a.next_emi_date).getTime() - new Date(b.next_emi_date).getTime())[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
            Loans
          </h1>
          <p className="text-muted-foreground">
            Track your loans and payments
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowPaymentForm(true)}
            variant="outline"
            size="sm"
            disabled={!loans || loans.length === 0}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
          <Button onClick={() => setShowLoanForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Loan
          </Button>
        </div>
      </div>

      {/* Add/Edit Loan Form */}
      {showLoanForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingLoan ? 'Edit Loan' : 'Add New Loan'}</CardTitle>
            <CardDescription>{editingLoan ? 'Update your loan details' : 'Add a loan to track your debt and payments'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoanSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loan-name">Loan Name *</Label>
                  <Input
                    id="loan-name"
                    value={loanForm.name}
                    onChange={(e) => setLoanForm({ ...loanForm, name: e.target.value })}
                    placeholder="e.g., Home Mortgage"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loan-type">Loan Type</Label>
                  <Select
                    value={loanForm.type}
                    onValueChange={(value: any) => setLoanForm({ ...loanForm, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="home">Home/Mortgage</SelectItem>
                      <SelectItem value="auto">Auto/Car</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="principal">Principal Amount *</Label>
                  <Input
                    id="principal"
                    type="number"
                    step="0.01"
                    value={loanForm.principal_amount}
                    onChange={(e) => setLoanForm({ ...loanForm, principal_amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interest">Interest Rate (%) *</Label>
                  <Input
                    id="interest"
                    type="number"
                    step="0.01"
                    value={loanForm.interest_rate}
                    onChange={(e) => setLoanForm({ ...loanForm, interest_rate: e.target.value })}
                    placeholder="5.5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenure">Tenure (Months) *</Label>
                  <Input
                    id="tenure"
                    type="number"
                    value={loanForm.tenure_months}
                    onChange={(e) => setLoanForm({ ...loanForm, tenure_months: e.target.value })}
                    placeholder="360"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={loanForm.start_date}
                  onChange={(e) => setLoanForm({ ...loanForm, start_date: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createLoan.isPending || updateLoan.isPending}>
                  {(createLoan.isPending || updateLoan.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : editingLoan ? (
                    <Edit2 className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {editingLoan ? 'Update Loan' : 'Add Loan'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowLoanForm(false);
                  setEditingLoan(null);
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Record Payment Form */}
      {showPaymentForm && (
        <Card>
          <CardHeader>
            <CardTitle>Record Loan Payment</CardTitle>
            <CardDescription>Record a payment for one of your loans</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Loan *</Label>
                  <Select
                    value={paymentForm.loan_id}
                    onValueChange={(value) => setPaymentForm({ ...paymentForm, loan_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a loan" />
                    </SelectTrigger>
                    <SelectContent>
                      {loans?.map((loan) => (
                        <SelectItem key={loan.id} value={loan.id}>
                          {loan.name} (${loan.emi_amount}/month)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input
                  type="date"
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createPayment.isPending}>
                  {createPayment.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <DollarSign className="h-4 w-4 mr-2" />
                  )}
                  Record Payment
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowPaymentForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalOwed)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Remaining balance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(monthlyPayments)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total EMI
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {nextPayment ? format(new Date(nextPayment.next_emi_date), 'MMM dd') : 'None'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {nextPayment ? nextPayment.name : 'No loans'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Loans List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loans && loans.length > 0 ? (
              loans.map((loan) => {
                const progressPercentage = ((loan.principal_amount - loan.remaining_balance) / loan.principal_amount) * 100;
                
                return (
                  <div key={loan.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{loan.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {loan.type} • {loan.interest_rate}% APR • {loan.tenure_months} months
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right mr-4">
                              <p className="text-2xl font-bold text-red-600">
                                {formatCurrency(loan.remaining_balance)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                of {formatCurrency(loan.principal_amount)} remaining
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditLoan(loan)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Loan</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this loan? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteLoan(loan.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-muted-foreground">
                          {progressPercentage.toFixed(1)}% paid
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <TrendingDown className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{formatCurrency(loan.emi_amount)}</p>
                          <p className="text-sm text-muted-foreground">Monthly EMI</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-medium">{format(new Date(loan.next_emi_date), 'MMM dd, yyyy')}</p>
                          <p className="text-sm text-muted-foreground">Next payment due</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No loans yet</p>
                <Button onClick={() => setShowLoanForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Loan
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Loans;