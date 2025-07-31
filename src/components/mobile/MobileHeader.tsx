import { useState } from "react";
import { 
  DollarSign, 
  Menu, 
  X, 
  Bell, 
  Search,
  LogOut,
  User,
  Settings as SettingsIcon,
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Target,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Budgets", href: "/budgets", icon: PiggyBank },
  { name: "Loans", href: "/loans", icon: CreditCard },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Reports", href: "/reports", icon: TrendingUp },
];

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  showNotifications?: boolean;
  showSearch?: boolean;
}

export function MobileHeader({ 
  title = "MyFinancials", 
  subtitle,
  showNotifications = true,
  showSearch = false 
}: MobileHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Main Header */}
      <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side - Logo and title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground text-sm">{title}</h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {showSearch && (
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                <Search className="h-4 w-4" />
              </Button>
            )}
            {showNotifications && (
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 relative">
                <Bell className="h-4 w-4" />
                {/* Notification dot */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></div>
              </Button>
            )}
            
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <Menu className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-[80vh]">
                <DrawerHeader className="text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <DrawerTitle className="text-lg">MyFinancials</DrawerTitle>
                      <DrawerDescription className="text-sm">
                        {user?.email}
                      </DrawerDescription>
                    </div>
                  </div>
                </DrawerHeader>

                <div className="px-4 pb-6 space-y-6">
                  {/* Navigation Links */}
                  <div className="space-y-2">
                    {navigation.map((item) => {
                      const IconComponent = item.icon;
                      const isActive = location.pathname === item.href;
                      return (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                            isActive
                              ? "bg-primary text-white"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          )}
                          onClick={() => setDrawerOpen(false)}
                        >
                          <IconComponent className="h-5 w-5" />
                          <span className="font-medium">{item.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>

                  {/* Account Section */}
                  <div className="space-y-2 border-t border-border pt-4">
                    <NavLink
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
                      onClick={() => setDrawerOpen(false)}
                    >
                      <SettingsIcon className="h-5 w-5" />
                      <span className="font-medium">Settings</span>
                    </NavLink>
                    
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-200 w-full text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </>
  );
}