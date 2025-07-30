-- Fix: Populate email field for existing users by joining with auth.users
-- First, let's check what's in the profiles table
SELECT p.*, au.email as auth_email 
FROM public.profiles p 
LEFT JOIN auth.users au ON p.user_id = au.id;

-- Update profiles with email from auth.users
UPDATE public.profiles 
SET email = au.email
FROM auth.users au 
WHERE profiles.user_id = au.id AND profiles.email IS NULL;