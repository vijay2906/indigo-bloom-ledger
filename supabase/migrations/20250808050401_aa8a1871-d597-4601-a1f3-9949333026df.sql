-- Check what the current constraint allows
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'loan_payments_status_check';

-- Drop the existing constraint if it exists
ALTER TABLE loan_payments DROP CONSTRAINT IF EXISTS loan_payments_status_check;

-- Add the correct constraint that allows 'completed', 'pending', 'failed' statuses
ALTER TABLE loan_payments ADD CONSTRAINT loan_payments_status_check 
CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'));