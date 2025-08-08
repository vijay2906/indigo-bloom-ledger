-- Check current constraint and see what loan types are allowed
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'loans'::regclass AND conname = 'loans_type_check';

-- Drop the existing constraint if it exists
ALTER TABLE loans DROP CONSTRAINT IF EXISTS loans_type_check;

-- Add updated constraint with more loan types
ALTER TABLE loans ADD CONSTRAINT loans_type_check 
CHECK (type IN ('Personal Loan', 'Home Loan', 'Car Loan', 'Education Loan', 'Business Loan', 'Credit Card', 'Vehicle Finance', 'Two Wheeler Loan', 'Gold Loan', 'Other'));