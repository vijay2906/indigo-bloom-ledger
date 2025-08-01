import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Receipt, 
  PiggyBank, 
  Target,
  TrendingUp,
  CreditCard,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  DollarSign
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { BottomNavigation } from "@/components/mobile/BottomNavigation";
import { FloatingActionButton } from "@/components/mobile/FloatingActionButton";
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
  const navigate = useNavigate();
  const { user, session, loading, signOut } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
  }, [session, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/10 to-secondary/20">
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="min-h-screen">
          <MobileHeader />
          <main className="pb-20">
            <Outlet />
          </main>
          <BottomNavigation />
          <FloatingActionButton />
        </div>
      ) : (
        // Desktop Layout (existing)
        <>
          {/* Desktop Sidebar */}
          <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-card/95 backdrop-blur-xl border-r border-border/50 p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-foreground">MyFinancials</span>
              </div>
              <ThemeToggle />
            </div>
            
            <nav className="space-y-2">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white shadow-lg'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
            
            <div className="absolute bottom-6 left-6 right-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-border/50">
                <p className="text-sm font-medium text-foreground">Welcome back!</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full mt-4 rounded-xl"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:ml-64">
            <main className="min-h-screen">
              <Outlet />
            </main>
          </div>
        </>
      )}
    </div>
  );
}