import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTransactions, useCreateTransaction } from "@/hooks/useTransactions";
import { useAccounts, useCreateAccount } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/currency";

const Transactions = () => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const { toast } = useToast();

  const { data: transactions, isLoading } = useTransactions();
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  
  const createTransaction = useCreateTransaction();
  const createAccount = useCreateAccount();

  const [transactionForm, setTransactionForm] = useState({
    account_id: '',
    category_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'income' | 'expense',
  });

  const [accountForm, setAccountForm] = useState({
    name: '',
    type: 'checking' as 'checking' | 'savings' | 'credit' | 'cash' | 'investment',
    balance: '',
    currency: 'USD',
  });

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!transactionForm.account_id) {
      toast({
        variant: "destructive",
        title: "Account Required",
        description: "Please select an account or create one first.",
      });
      return;
    }
    
    if (!transactionForm.category_id) {
      toast({
        variant: "destructive", 
        title: "Category Required",
        description: "Please select a category.",
      });
      return;
    }
    
    createTransaction.mutate({
      ...transactionForm,
      amount: parseFloat(transactionForm.amount),
    }, {
      onSuccess: () => {
        setTransactionForm({
          account_id: '',
          category_id: '',
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          type: 'expense',
        });
        setShowTransactionForm(false);
      },
    });
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAccount.mutate({
      ...accountForm,
      balance: parseFloat(accountForm.balance) || 0,
    }, {
      onSuccess: () => {
        setAccountForm({
          name: '',
          type: 'checking',
          balance: '',
          currency: 'USD',
        });
        setShowAccountForm(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
            Transactions
          </h1>
          <p className="text-muted-foreground">
            Track your income and expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAccountForm(true)}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
          <Button onClick={() => setShowTransactionForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Add Account Form */}
      {showAccountForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Account</CardTitle>
            <CardDescription>Add a bank account, credit card, or cash account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account-name">Account Name *</Label>
                  <Input
                    id="account-name"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    placeholder="e.g., Chase Checking"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-type">Account Type</Label>
                  <Select
                    value={accountForm.type}
                    onValueChange={(value: any) => setAccountForm({ ...accountForm, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="credit">Credit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account-balance">Initial Balance</Label>
                  <Input
                    id="account-balance"
                    type="number"
                    step="0.01"
                    value={accountForm.balance}
                    onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-currency">Currency</Label>
                  <Select
                    value={accountForm.currency}
                    onValueChange={(value) => setAccountForm({ ...accountForm, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createAccount.isPending}>
                  {createAccount.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Account
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAccountForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Add Transaction Form */}
      {showTransactionForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Transaction</CardTitle>
            <CardDescription>Record your income or expense</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={transactionForm.type}
                    onValueChange={(value: any) => setTransactionForm({ ...transactionForm, type: value, category_id: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Account *</Label>
                  <Select
                    value={transactionForm.account_id}
                    onValueChange={(value) => setTransactionForm({ ...transactionForm, account_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts && accounts.length > 0 ? (
                        accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} ({account.type})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">
                          No accounts - Create one first
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={transactionForm.category_id}
                    onValueChange={(value) => setTransactionForm({ ...transactionForm, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(transactionForm.type === 'income' ? 
                        categories?.filter(c => c.type === 'income') : 
                        categories?.filter(c => c.type === 'expense')
                      )?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={transactionForm.date}
                    onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Input
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                  placeholder="e.g., Grocery shopping"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={createTransaction.isPending || !accounts || accounts.length === 0}
                >
                  {createTransaction.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Transaction
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowTransactionForm(false)}>
                  Cancel
                </Button>
                {(!accounts || accounts.length === 0) && (
                  <p className="text-sm text-muted-foreground ml-2 self-center">
                    Create an account first to add transactions
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Accounts Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {accounts?.map((account) => (
          <Card key={account.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
              <CardDescription className="capitalize">{account.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(Number(account.balance), account.currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {account.currency}
              </p>
            </CardContent>
          </Card>
        ))}
        
        {(!accounts || accounts.length === 0) && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-sm text-muted-foreground mb-2">No accounts yet</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAccountForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Account
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: transaction.category?.color || '#8884d8' }}
                    >
                      {transaction.category?.name?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category?.name} • {transaction.account?.name} • {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(Number(transaction.amount)), 'USD')}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No transactions yet</p>
                {accounts && accounts.length > 0 ? (
                  <Button onClick={() => setShowTransactionForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Transaction
                  </Button>
                ) : (
                  <Button onClick={() => setShowAccountForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create an Account First
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;