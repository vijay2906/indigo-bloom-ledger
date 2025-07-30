-- Complete fix: Drop all triggers and create profiles manually
-- Remove the problematic trigger entirely
DROP TRIGGER IF EXISTS trigger_new_user_settings ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_new_user_settings();

-- Create profiles for existing users directly without any triggers
INSERT INTO public.profiles (user_id, first_name, last_name, email)
SELECT 
  au.id,
  au.raw_user_meta_data ->> 'first_name',
  au.raw_user_meta_data ->> 'last_name',
  au.email
FROM auth.users au
WHERE au.id NOT IN (SELECT COALESCE(p.user_id, '00000000-0000-0000-0000-000000000000'::uuid) FROM public.profiles p);