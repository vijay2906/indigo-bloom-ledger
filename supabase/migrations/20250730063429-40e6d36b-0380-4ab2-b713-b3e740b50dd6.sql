-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.is_household_member(household_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = household_uuid AND user_id = user_uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.set_household_id_from_account()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  SELECT household_id INTO NEW.household_id 
  FROM public.accounts 
  WHERE id = NEW.account_id;
  
  RETURN NEW;
END;
$$;