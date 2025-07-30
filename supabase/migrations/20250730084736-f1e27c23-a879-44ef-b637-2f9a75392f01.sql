-- Add email field to profiles table to enable email-based user lookup
ALTER TABLE public.profiles ADD COLUMN email text;

-- Update the existing handle_new_user function to also copy the email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Update existing profiles to include email (for existing users)
UPDATE public.profiles 
SET email = auth.email() 
WHERE email IS NULL;