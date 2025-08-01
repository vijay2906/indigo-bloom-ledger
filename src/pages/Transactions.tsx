import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from "@/hooks/useTransactions";
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from "@/hooks/useAccounts";
import { useNotifications } from "@/hooks/useNotifications";
import { useCategories } from "@/hooks/useCategories";
import { useCurrency } from "@/hooks/useCurrency";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Loader2, Search, Filter, Edit2, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/currency";
import { FloatingActionButton } from "@/components/mobile/FloatingActionButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useVoiceTransactionParser } from "@/hooks/useVoiceTransactionParser";
import { RecurringTransactionForm } from "@/components/RecurringTransactionForm";
import { BillReminderForm } from "@/components/BillReminderForm";
import { useReceiptScanning } from "@/hooks/useReceiptScanning";
import { Camera } from "lucide-react";

const Transactions = () => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const { data: transactions, isLoading } = useTransactions();
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const { format: formatCurrencyValue } = useCurrency();
  
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();
  const { sendTransactionNotification } = useNotifications();
  const { parseTransactionFromText } = useVoiceTransactionParser();
  const { scanReceipt, saveReceiptData, isProcessing } = useReceiptScanning();

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

  const handleVoiceTranscription = async (text: string) => {
    try {
      // Parse the transcribed text to extract transaction details
      const parsedData = await parseTransactionFromText(text);
      
      // Update form with parsed data
      setTransactionForm(prev => ({
        ...prev,
        amount: parsedData.amount ? parsedData.amount.toString() : prev.amount,
        description: parsedData.description || prev.description,
        type: parsedData.type || prev.type,
      }));
      
      // Auto-select category if it matches
      if (parsedData.category && categories) {
        const matchingCategory = categories.find(cat => 
          cat.name.toLowerCase() === parsedData.category?.toLowerCase() && 
          cat.type === (parsedData.type || transactionForm.type)
        );
        if (matchingCategory) {
          setTransactionForm(prev => ({ ...prev, category_id: matchingCategory.id }));
        }
      }
      
      toast({
        title: "Voice input processed",
        description: "Transaction details extracted from voice",
      });
    } catch (error) {
      console.error('Error processing voice input:', error);
    }
  };

  const handleReceiptScan = async () => {
    const receiptData = await scanReceipt();
    if (receiptData) {
      // Auto-fill form with receipt data
      setTransactionForm(prev => ({
        ...prev,
        amount: receiptData.total_amount?.toString() || prev.amount,
        description: receiptData.merchant_name || prev.description,
        date: receiptData.transaction_date || prev.date,
      }));
    }
  };

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
    
    if (editingTransaction) {
      updateTransaction.mutate({ id: editingTransaction.id, ...transactionForm, amount: parseFloat(transactionForm.amount) }, {
        onSuccess: (updatedTransaction) => {
          // Send notification
          sendTransactionNotification('updated', updatedTransaction as any, user?.email, user?.user_metadata?.full_name || 'User');
          
          setTransactionForm({
            account_id: '',
            category_id: '',
            amount: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
          });
          setShowTransactionForm(false);
          setEditingTransaction(null);
        },
      });
    } else {
      createTransaction.mutate({ ...transactionForm, amount: parseFloat(transactionForm.amount) }, {
        onSuccess: (newTransaction) => {
          // Send notification
          sendTransactionNotification('created', newTransaction as any, user?.email, user?.user_metadata?.full_name || 'User');
          
          setTransactionForm({
            account_id: '',
            category_id: '',
            amount: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
          });
          setShowTransactionForm(false);
          setEditingTransaction(null);
        },
      });
    }
  };

  const handleEditTransaction = (transaction: any) => {
    setTransactionForm({
      account_id: transaction.account_id,
      category_id: transaction.category_id,
      amount: transaction.amount.toString(),
      description: transaction.description,
      date: transaction.date,
      type: transaction.type,
    });
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleDeleteTransaction = (transaction: any) => {
    deleteTransaction.mutate(transaction.id, {
      onSuccess: () => {
        // Send notification
        sendTransactionNotification('deleted', transaction, user?.email, user?.user_metadata?.full_name || 'User');
      },
    });
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAccount) {
      updateAccount.mutate({
        id: editingAccount.id,
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
          setEditingAccount(null);
        },
      });
    } else {
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
    }
  };

  const handleEditAccount = (account: any) => {
    setAccountForm({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      currency: account.currency,
    });
    setEditingAccount(account);
    setShowAccountForm(true);
  };

  const handleDeleteAccount = (id: string) => {
    deleteAccount.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 to-secondary/30">
      {/* Custom FAB for Transactions page */}
      <div className="block sm:hidden">
        <FloatingActionButton 
          onAddTransaction={() => setShowTransactionForm(true)}
          onAddAccount={() => setShowAccountForm(true)}
        />
      </div>
      {/* Mobile App Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Transactions</h1>
              <p className="text-sm text-muted-foreground">Track your money</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAccountForm(true)}
              variant="outline"
              size="sm"
              className="rounded-full w-8 h-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => setShowTransactionForm(true)}
              size="sm"
              className="gradient-primary rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 sm:px-6">
        
        {/* Feature Buttons - Desktop Only */}
        {!isMobile && (
          <div className="flex flex-wrap gap-4 mb-6">
            <Button onClick={() => setShowTransactionForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
            <Button variant="outline" onClick={() => setShowAccountForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
            <RecurringTransactionForm />
            <BillReminderForm />
          </div>
        )}

      {/* Add Account Form */}
      {showAccountForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</CardTitle>
            <CardDescription>{editingAccount ? 'Update your account details' : 'Add a bank account, credit card, or cash account'}</CardDescription>
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
                <Button type="submit" disabled={createAccount.isPending || updateAccount.isPending}>
                  {(createAccount.isPending || updateAccount.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : editingAccount ? (
                    <Edit2 className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {editingAccount ? 'Update Account' : 'Add Account'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowAccountForm(false);
                  setEditingAccount(null);
                  setAccountForm({
                    name: '',
                    type: 'checking',
                    balance: '',
                    currency: 'USD',
                  });
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Transaction Form */}
      {showTransactionForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</CardTitle>
            <CardDescription>{editingTransaction ? 'Update your transaction details' : 'Record your income or expense'}</CardDescription>
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
                <div className="flex gap-2">
                  <Input
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                    placeholder="e.g., Grocery shopping or use voice"
                    required
                    className="flex-1"
                  />
                  <VoiceRecorder
                    onTranscription={handleVoiceTranscription}
                    isRecording={isRecording}
                    setIsRecording={setIsRecording}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={(createTransaction.isPending || updateTransaction.isPending) || !accounts || accounts.length === 0}
                >
                  {(createTransaction.isPending || updateTransaction.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : editingTransaction ? (
                    <Edit2 className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowTransactionForm(false);
                  setEditingTransaction(null);
                }}>
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
          <Card key={account.id} className="relative group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
                  <CardDescription className="capitalize">{account.type}</CardDescription>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEditAccount(account)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{account.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteAccount(account.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
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
                <div 
                  key={transaction.id} 
                  className={cn(
                    "p-4 border rounded-lg transition-all duration-200",
                    isMobile ? "active:bg-accent/50 cursor-pointer" : "hover:bg-accent/30"
                  )}
                  onClick={isMobile ? () => handleEditTransaction(transaction) : undefined}
                >
                  {/* Mobile Layout */}
                  {isMobile ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
                          style={{ backgroundColor: transaction.category?.color || '#8884d8' }}
                        >
                          {transaction.category?.name?.charAt(0) || 'T'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {transaction.category?.name} • {transaction.account?.name}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`font-semibold text-sm ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrencyValue(Math.abs(Number(transaction.amount)))}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.date), 'MMM dd, yyyy')}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {transaction.type}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    /* Desktop Layout */
                    <div className="flex items-center justify-between">
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
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrencyValue(Math.abs(Number(transaction.amount)))}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {transaction.type}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTransaction(transaction)}
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
                                <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this transaction? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTransaction(transaction)}
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
                  )}
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
    </div>
  );
};

export default Transactions;