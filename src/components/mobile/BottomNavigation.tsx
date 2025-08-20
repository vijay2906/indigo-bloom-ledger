import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Receipt, 
  PiggyBank, 
  Target,
  Settings,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const bottomNavItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Budgets", href: "/budgets", icon: PiggyBank },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function BottomNavigation() {
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t border-border/20">
      <div className="gradient-glass">
        <div className="grid grid-cols-5 h-18 px-2 py-3">
          {bottomNavItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 text-xs font-semibold transition-all duration-300 rounded-2xl p-2",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-2xl transition-all duration-300 relative",
                  isActive 
                    ? "gradient-primary text-white shadow-[var(--shadow-glow)] animate-pulse-glow scale-110" 
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:scale-105"
                )}>
                  <IconComponent className="h-5 w-5" />
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl animate-ping bg-primary/20"></div>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors duration-300",
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                )}>
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}