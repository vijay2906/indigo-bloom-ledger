-- Create households table for shared financial data
CREATE TABLE public.households (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create household members table to track who belongs to which household
CREATE TABLE public.household_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner' or 'member'
  invited_by UUID,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(household_id, user_id)
);

-- Add household_id to existing tables
ALTER TABLE public.accounts ADD COLUMN household_id UUID REFERENCES public.households(id);
ALTER TABLE public.transactions ADD COLUMN household_id UUID REFERENCES public.households(id);
ALTER TABLE public.budgets ADD COLUMN household_id UUID REFERENCES public.households(id);
ALTER TABLE public.goals ADD COLUMN household_id UUID REFERENCES public.households(id);
ALTER TABLE public.goal_contributions ADD COLUMN household_id UUID REFERENCES public.households(id);
ALTER TABLE public.loans ADD COLUMN household_id UUID REFERENCES public.households(id);
ALTER TABLE public.loan_payments ADD COLUMN household_id UUID REFERENCES public.households(id);

-- Enable RLS on new tables
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

-- Function to check if user is member of household
CREATE OR REPLACE FUNCTION public.is_household_member(household_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = household_uuid AND user_id = user_uuid
  );
$$;

-- RLS Policies for households
CREATE POLICY "Users can view households they belong to" 
ON public.households 
FOR SELECT 
USING (
  id IN (
    SELECT household_id FROM public.household_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create households" 
ON public.households 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Household owners can update their household" 
ON public.households 
FOR UPDATE 
USING (
  id IN (
    SELECT household_id FROM public.household_members 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- RLS Policies for household members
CREATE POLICY "Users can view household members for their households" 
ON public.household_members 
FOR SELECT 
USING (
  household_id IN (
    SELECT household_id FROM public.household_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can add members to households they own" 
ON public.household_members 
FOR INSERT 
WITH CHECK (
  household_id IN (
    SELECT household_id FROM public.household_members 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Update existing RLS policies to support household sharing
-- Accounts
DROP POLICY IF EXISTS "Users can view their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can create their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can delete their own accounts" ON public.accounts;

CREATE POLICY "Users can view accounts they own or household accounts" 
ON public.accounts 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (household_id IS NOT NULL AND public.is_household_member(household_id, auth.uid()))
);

CREATE POLICY "Users can create their own accounts or household accounts" 
ON public.accounts 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND (
    household_id IS NULL OR 
    public.is_household_member(household_id, auth.uid())
  )
);

CREATE POLICY "Users can update accounts they own or household accounts" 
ON public.accounts 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  (household_id IS NOT NULL AND public.is_household_member(household_id, auth.uid()))
);

CREATE POLICY "Users can delete accounts they own or household accounts" 
ON public.accounts 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  (household_id IS NOT NULL AND public.is_household_member(household_id, auth.uid()))
);

-- Transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;

CREATE POLICY "Users can view transactions they own or household transactions" 
ON public.transactions 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (household_id IS NOT NULL AND public.is_household_member(household_id, auth.uid()))
);

CREATE POLICY "Users can create their own transactions or household transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND (
    household_id IS NULL OR 
    public.is_household_member(household_id, auth.uid())
  )
);

CREATE POLICY "Users can update transactions they own or household transactions" 
ON public.transactions 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  (household_id IS NOT NULL AND public.is_household_member(household_id, auth.uid()))
);

CREATE POLICY "Users can delete transactions they own or household transactions" 
ON public.transactions 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  (household_id IS NOT NULL AND public.is_household_member(household_id, auth.uid()))
);

-- Trigger to automatically add household_id to transactions when account belongs to household
CREATE OR REPLACE FUNCTION public.set_household_id_from_account()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT household_id INTO NEW.household_id 
  FROM public.accounts 
  WHERE id = NEW.account_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_transaction_household_id
  BEFORE INSERT OR UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_household_id_from_account();

-- Update triggers for timestamps
CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();