-- Fix the issue by creating profiles without triggering user_settings conflicts
-- First, create profiles for existing users without the trigger
-- Then handle user_settings separately

-- Temporarily drop the trigger that creates user_settings
DROP TRIGGER IF EXISTS trigger_new_user_settings ON public.profiles;

-- Create profiles for existing users (this should work now)
INSERT INTO public.profiles (user_id, first_name, last_name, email)
SELECT 
  id,
  raw_user_meta_data ->> 'first_name',
  raw_user_meta_data ->> 'last_name',
  email
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles WHERE user_id IS NOT NULL);

-- Create user_settings for users who don't have them (with ON CONFLICT)
INSERT INTO public.user_settings (user_id)
SELECT user_id FROM public.profiles
WHERE user_id NOT IN (SELECT user_id FROM public.user_settings)
ON CONFLICT (user_id) DO NOTHING;

-- Recreate the trigger with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER trigger_new_user_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_settings();