-- Check current policies on households table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'households';

-- Drop all existing policies on households
DROP POLICY IF EXISTS "Authenticated users can create households" ON public.households;
DROP POLICY IF EXISTS "Users can create households" ON public.households;

-- Create a simple policy that allows any authenticated user to create households
CREATE POLICY "Allow authenticated users to create households" 
ON public.households 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Test the auth context
SELECT auth.uid() as user_id, auth.role() as user_role;