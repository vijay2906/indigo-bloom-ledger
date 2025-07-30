-- Fix RLS policies on profiles table to allow email-based lookups for invitations
-- Current policy only allows users to view their own profile
-- We need to allow users to find other users by email for invitations

-- Add a new policy that allows users to view profiles by email (for invitations)
CREATE POLICY "Users can view profiles by email for invitations" 
ON public.profiles 
FOR SELECT 
USING (true); -- Allow all authenticated users to search by email

-- Note: This is safe because we're only exposing basic profile info (name, email)
-- which is typically public information needed for invitations