import { Search, Filter, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import transactionsIcon from "@/assets/transactions-icon.jpg";

const transactions = [
  { id: 1, description: "Salary Deposit", amount: 5400, type: "income", date: "2024-11-01", category: "Salary" },
  { id: 2, description: "Grocery Store", amount: -120, type: "expense", date: "2024-11-02", category: "Food" },
  { id: 3, description: "Gas Station", amount: -65, type: "expense", date: "2024-11-03", category: "Transportation" },
  { id: 4, description: "Coffee Shop", amount: -12, type: "expense", date: "2024-11-04", category: "Entertainment" },
  { id: 5, description: "Freelance Payment", amount: 800, type: "income", date: "2024-11-05", category: "Freelance" },
];

export default function Transactions() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all your financial transactions.
          </p>
        </div>
        <Button className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Module illustration */}
      <div className="finance-card p-8 text-center">
        <img 
          src={transactionsIcon} 
          alt="Transactions" 
          className="w-32 h-24 mx-auto rounded-lg object-cover mb-4"
        />
        <h3 className="text-lg font-semibold text-foreground">Transaction Management</h3>
        <p className="text-muted-foreground mt-2">
          Keep track of all your income and expenses in one place.
        </p>
      </div>

      {/* Filters */}
      <div className="finance-card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search transactions..." 
            className="w-full pl-10"
          />
        </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="finance-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  transaction.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="h-5 w-5 text-success" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">{transaction.category} • {transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'metric-positive' : 'metric-negative'
                }`}>
                  {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}