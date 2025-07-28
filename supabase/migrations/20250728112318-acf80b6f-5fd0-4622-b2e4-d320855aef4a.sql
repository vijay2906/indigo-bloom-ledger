-- Create comprehensive database schema for MyFinancials app

-- Categories for transactions and budgets
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.categories (name, icon, color, type) VALUES
  ('Salary', 'DollarSign', '#10B981', 'income'),
  ('Freelance', 'Briefcase', '#3B82F6', 'income'),
  ('Investment', 'TrendingUp', '#8B5CF6', 'income'),
  ('Food & Dining', 'Utensils', '#EF4444', 'expense'),
  ('Transportation', 'Car', '#F59E0B', 'expense'),
  ('Shopping', 'ShoppingBag', '#EC4899', 'expense'),
  ('Entertainment', 'Film', '#6366F1', 'expense'),
  ('Bills & Utilities', 'Receipt', '#DC2626', 'expense'),
  ('Healthcare', 'Heart', '#059669', 'expense'),
  ('Education', 'BookOpen', '#7C3AED', 'expense');

-- Accounts (bank accounts, wallets, etc.)
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'credit', 'cash', 'investment')),
  balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Transactions
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Budgets
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Loans and EMIs
CREATE TABLE public.loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('home', 'car', 'personal', 'education', 'business', 'other')),
  principal_amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  tenure_months INTEGER NOT NULL,
  emi_amount DECIMAL(15,2) NOT NULL,
  start_date DATE NOT NULL,
  next_emi_date DATE NOT NULL,
  remaining_balance DECIMAL(15,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Loan payments (EMI tracking)
CREATE TABLE public.loan_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  principal_component DECIMAL(15,2) NOT NULL,
  interest_component DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'overdue')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Savings Goals
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  target_date DATE,
  category TEXT CHECK (category IN ('emergency', 'vacation', 'car', 'house', 'education', 'retirement', 'other')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Goal contributions
CREATE TABLE public.goal_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User preferences and settings
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  currency TEXT NOT NULL DEFAULT 'USD',
  date_format TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
  first_day_of_week INTEGER NOT NULL DEFAULT 0 CHECK (first_day_of_week >= 0 AND first_day_of_week <= 6),
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  budget_alerts BOOLEAN NOT NULL DEFAULT true,
  bill_reminders BOOLEAN NOT NULL DEFAULT true,
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read, no write for users)
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

-- RLS Policies for accounts
CREATE POLICY "Users can view their own accounts" 
ON public.accounts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts" 
ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" 
ON public.accounts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts" 
ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
ON public.transactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for budgets
CREATE POLICY "Users can view their own budgets" 
ON public.budgets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budgets" 
ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" 
ON public.budgets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" 
ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for loans
CREATE POLICY "Users can view their own loans" 
ON public.loans FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own loans" 
ON public.loans FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loans" 
ON public.loans FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loans" 
ON public.loans FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for loan payments
CREATE POLICY "Users can view their own loan payments" 
ON public.loan_payments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own loan payments" 
ON public.loan_payments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loan payments" 
ON public.loan_payments FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for goals
CREATE POLICY "Users can view their own goals" 
ON public.goals FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.goals FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for goal contributions
CREATE POLICY "Users can view their own goal contributions" 
ON public.goal_contributions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goal contributions" 
ON public.goal_contributions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user settings
CREATE POLICY "Users can view their own settings" 
ON public.user_settings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" 
ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Triggers for updated_at timestamps
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create user settings on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Trigger to create user settings when profile is created
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_settings();