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
import { Plus, Loader2, Search, Filter } from "lucide-react";
import { format } from "date-fns";

const Transactions = () => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);

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

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        <Button onClick={() => setShowTransactionForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Add Transaction Form */}
      {showTransactionForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={transactionForm.type}
                    onValueChange={(value: any) => setTransactionForm({ ...transactionForm, type: value })}
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
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                  placeholder="e.g., Grocery shopping"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createTransaction.isPending}>
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
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
                        {transaction.category?.name} • {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${Math.abs(Number(transaction.amount)).toLocaleString()}
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
                <Button onClick={() => setShowTransactionForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Transaction
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;