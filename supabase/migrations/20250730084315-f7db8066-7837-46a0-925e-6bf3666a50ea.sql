-- Fix the household creation issue by allowing the creator to be added as owner
-- Update the RLS policy for household_members to allow creators to add themselves as owners

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can add members to households they own" ON public.household_members;

-- Create a new policy that allows:
-- 1. Household owners to add members to their households (existing functionality)
-- 2. Users to add themselves as owners when creating a household
CREATE POLICY "Users can add members to households they own or add themselves as owner" 
ON public.household_members 
FOR INSERT 
WITH CHECK (
  -- Allow if user is adding themselves as owner to any household
  (auth.uid() = user_id AND role = 'owner')
  OR
  -- Allow if user owns the household (existing functionality)
  (household_id IN (SELECT get_user_owned_households(auth.uid())))
);