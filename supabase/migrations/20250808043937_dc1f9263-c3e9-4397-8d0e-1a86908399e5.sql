-- Update existing loan types to match new constraint
UPDATE loans SET type = 'Personal Loan' WHERE type = 'personal';

-- Drop the existing constraint if it exists  
ALTER TABLE loans DROP CONSTRAINT IF EXISTS loans_type_check;

-- Add updated constraint with more loan types
ALTER TABLE loans ADD CONSTRAINT loans_type_check 
CHECK (type IN ('Personal Loan', 'Home Loan', 'Car Loan', 'Education Loan', 'Business Loan', 'Credit Card', 'Vehicle Finance', 'Two Wheeler Loan', 'Gold Loan', 'Other'));