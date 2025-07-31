import { useState } from "react";
import { Plus, Receipt, PiggyBank, Target, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

const quickActions = [
  { 
    name: "Add Transaction", 
    icon: Receipt, 
    action: "transaction",
    color: "bg-primary"
  },
  { 
    name: "Create Budget", 
    icon: PiggyBank, 
    action: "budget",
    color: "bg-success"
  },
  { 
    name: "Set Goal", 
    icon: Target, 
    action: "goal",
    color: "bg-warning"
  },
  { 
    name: "Add Account", 
    icon: CreditCard, 
    action: "account",
    color: "bg-secondary"
  },
];

export function FloatingActionButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  if (!isMobile) return null;

  const handleActionClick = (action: string) => {
    setIsExpanded(false);
    
    switch (action) {
      case "transaction":
        navigate("/transactions");
        break;
      case "budget":
        navigate("/budgets");
        break;
      case "goal":
        navigate("/goals");
        break;
      case "account":
        navigate("/settings");
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
                className="flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-xs font-medium bg-card/90 backdrop-blur-sm px-3 py-2 rounded-full border border-border/50 text-foreground whitespace-nowrap">
                  {item.name}
                </span>
                <Button
                  size="sm"
                  className={cn(
                    "w-12 h-12 rounded-full shadow-lg",
                    item.color,
                    "text-white hover:scale-110 transition-transform duration-200"
                  )}
                  onClick={() => handleActionClick(item.action)}
                >
                  <IconComponent className="h-5 w-5" />
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
          "w-14 h-14 rounded-full shadow-xl gradient-primary",
          "text-white hover:scale-110 transition-all duration-200",
          isExpanded && "rotate-45"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}