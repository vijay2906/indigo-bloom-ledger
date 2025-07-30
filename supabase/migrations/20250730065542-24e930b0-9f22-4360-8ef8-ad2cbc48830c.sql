-- Fix infinite recursion in household_members RLS policies
-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view household members for their households" ON household_members;
DROP POLICY IF EXISTS "Users can add members to households they own" ON household_members;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_households(user_uuid uuid)
RETURNS TABLE(household_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT hm.household_id
  FROM public.household_members hm
  WHERE hm.user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.get_user_owned_households(user_uuid uuid)
RETURNS TABLE(household_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT hm.household_id
  FROM public.household_members hm
  WHERE hm.user_id = user_uuid AND hm.role = 'owner';
$$;

-- Create new policies using the security definer functions
CREATE POLICY "Users can view household members for their households"
ON household_members
FOR SELECT
USING (household_id IN (SELECT public.get_user_households(auth.uid())));

CREATE POLICY "Users can add members to households they own"
ON household_members
FOR INSERT
WITH CHECK (household_id IN (SELECT public.get_user_owned_households(auth.uid())));