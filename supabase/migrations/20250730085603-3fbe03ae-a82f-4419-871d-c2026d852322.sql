-- Create profiles for existing users, but handle the user_settings trigger issue
-- First disable the trigger temporarily
DROP TRIGGER IF EXISTS trigger_new_user_settings ON public.profiles;

-- Insert profiles for existing users
INSERT INTO public.profiles (user_id, first_name, last_name, email)
SELECT 
  id,
  raw_user_meta_data ->> 'first_name',
  raw_user_meta_data ->> 'last_name',
  email
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles WHERE user_id IS NOT NULL);

-- Recreate the trigger
CREATE TRIGGER trigger_new_user_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_settings();