-- Temporarily disable RLS on households table to test
ALTER TABLE public.households DISABLE ROW LEVEL SECURITY;

-- Check if RLS is now disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'households';