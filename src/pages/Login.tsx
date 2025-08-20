import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from '@supabase/supabase-js';
import { DollarSign, Loader2 } from "lucide-react";
import financeLoginBg from "@/assets/finance-login-bg.jpg";

const Login = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Redirect authenticated users to dashboard
        if (session?.user) {
          navigate('/');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Redirect if already authenticated
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign In Error",
          description: error.message,
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative gradient-hero"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${financeLoginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background overlay for better visual effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/30 backdrop-blur-sm"></div>
      
      <Card className="w-full max-w-md finance-card-glass relative z-10 animate-fade-in-up">
        <CardHeader className="text-center pb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-primary flex items-center justify-center icon-glow animate-pulse-glow">
            <DollarSign className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary text-glow">Welcome Back</CardTitle>
          <CardDescription className="text-base mt-2">
            Sign in to your MyFinancials account and manage your wealth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="mobile-spacing">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="h-12 rounded-xl border-border/30 bg-card/50 backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-12 rounded-xl border-border/30 bg-card/50 backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl gradient-primary hover:shadow-[var(--shadow-glow)] transition-all duration-300 font-semibold text-lg animate-float"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="font-semibold text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;