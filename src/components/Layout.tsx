import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Receipt, 
  PiggyBank, 
  Target,
  TrendingUp,
  CreditCard,
  Settings,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Budgets", href: "/budgets", icon: PiggyBank },
  { name: "Loans", href: "/loans", icon: CreditCard },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Reports", href: "/reports", icon: TrendingUp },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden bg-card border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
            MyFinancials
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-card border-b border-border/50">
          <nav className="px-4 py-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}

      <div className="lg:flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow pt-5 bg-card border-r border-border/50 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-6">
              <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                MyFinancials
              </h1>
            </div>
            <div className="mt-8 flex-grow flex flex-col">
              <nav className="flex-1 px-4 space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-5 w-5 transition-colors",
                          isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {item.name}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}