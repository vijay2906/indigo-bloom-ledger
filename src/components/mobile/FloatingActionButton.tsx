import { useState } from "react";
import { Plus, Receipt, PiggyBank, Target, CreditCard, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useLocation } from "react-router-dom";

interface FloatingActionButtonProps {
  onAddTransaction?: () => void;
  onAddAccount?: () => void;
  onScanReceipt?: () => void;
}

const quickActions = [
  { 
    name: "Add Transaction", 
    icon: Receipt, 
    action: "transaction",
    color: "gradient-primary"
  },
  { 
    name: "Scan Receipt", 
    icon: Camera, 
    action: "camera",
    color: "gradient-destructive"
  },
  { 
    name: "Create Budget", 
    icon: PiggyBank, 
    action: "budget",
    color: "gradient-success"
  },
  { 
    name: "Set Goal", 
    icon: Target, 
    action: "goal",
    color: "gradient-warning"
  },
];

export function FloatingActionButton({ onAddTransaction, onAddAccount, onScanReceipt }: FloatingActionButtonProps = {}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnTransactionsPage = location.pathname === '/transactions';

  if (!isMobile) return null;

  const handleActionClick = (action: string) => {
    setIsExpanded(false);
    
    switch (action) {
      case "transaction":
        if (isOnTransactionsPage && onAddTransaction) {
          onAddTransaction();
        } else {
          navigate("/transactions");
        }
        break;
      case "camera":
        if (isOnTransactionsPage && onScanReceipt) {
          onScanReceipt();
        } else {
          navigate("/transactions");
        }
        break;
      case "budget":
        navigate("/budgets");
        break;
      case "goal":
        navigate("/goals");
        break;
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {/* Quick action buttons */}
      {isExpanded && (
        <div className="flex flex-col gap-3 mb-4">
          {quickActions.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.name}
                className="flex items-center gap-4 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="text-sm font-semibold finance-card-glass px-4 py-2 rounded-2xl border border-border/20 text-foreground whitespace-nowrap shadow-md">
                  {item.name}
                </span>
                <Button
                  size="sm"
                  className={cn(
                    "w-14 h-14 rounded-3xl shadow-[var(--shadow-elevated)] border-2 border-white/20",
                    item.color,
                    "text-white hover:scale-110 transition-all duration-300 icon-glow backdrop-blur-xl"
                  )}
                  onClick={() => {
                    // Add haptic feedback for mobile
                    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
                      navigator.vibrate(75);
                    }
                    handleActionClick(item.action);
                  }}
                >
                  <IconComponent className="h-6 w-6" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <Button
        size="lg"
        className={cn(
          "w-16 h-16 rounded-3xl shadow-[var(--shadow-glow)] gradient-primary animate-float",
          "text-white hover:scale-110 transition-all duration-300 border-4 border-white/20",
          "icon-glow backdrop-blur-xl",
          isExpanded && "rotate-45 scale-110"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}