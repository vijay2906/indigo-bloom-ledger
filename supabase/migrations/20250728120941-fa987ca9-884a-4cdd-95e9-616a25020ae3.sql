-- Update default currency from USD to INR in accounts table
ALTER TABLE public.accounts ALTER COLUMN currency SET DEFAULT 'INR';

-- Update default currency from USD to INR in user_settings table
ALTER TABLE public.user_settings ALTER COLUMN currency SET DEFAULT 'INR';

-- Update existing records to use INR instead of USD
UPDATE public.accounts SET currency = 'INR' WHERE currency = 'USD';
UPDATE public.user_settings SET currency = 'INR' WHERE currency = 'USD';