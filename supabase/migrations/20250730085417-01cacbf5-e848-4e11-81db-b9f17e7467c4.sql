-- Create profiles for existing users manually
INSERT INTO public.profiles (user_id, first_name, last_name, email)
SELECT 
  id,
  raw_user_meta_data ->> 'first_name',
  raw_user_meta_data ->> 'last_name',
  email
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles);