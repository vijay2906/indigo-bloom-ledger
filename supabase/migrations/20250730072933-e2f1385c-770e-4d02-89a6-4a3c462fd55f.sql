-- First check what auth.uid() returns in the database context
DO $$
BEGIN
  RAISE NOTICE 'Current auth.uid(): %', auth.uid();
END $$;

-- Drop the existing policy that's causing issues
DROP POLICY IF EXISTS "Users can create households" ON public.households;

-- Create a new policy that's more permissive for testing
CREATE POLICY "Authenticated users can create households" 
ON public.households 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Check if the user has an active session
-- This will help us understand the auth context
SELECT 
  auth.uid() as user_id,
  auth.role() as user_role,
  auth.jwt() ->> 'email' as email;