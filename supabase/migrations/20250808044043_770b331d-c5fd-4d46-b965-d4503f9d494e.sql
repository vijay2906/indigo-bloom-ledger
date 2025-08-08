-- First remove all check constraints on loans table
ALTER TABLE loans DROP CONSTRAINT IF EXISTS loans_type_check;

-- Update existing loan types to proper format
UPDATE loans SET type = 'Personal Loan' WHERE type = 'personal' OR type = 'Personal Loan';
UPDATE loans SET type = 'Home Loan' WHERE type = 'home' OR type = 'housing';
UPDATE loans SET type = 'Car Loan' WHERE type = 'car' OR type = 'auto';
UPDATE loans SET type = 'Education Loan' WHERE type = 'education' OR type = 'student';
UPDATE loans SET type = 'Business Loan' WHERE type = 'business';

-- Now add the new constraint
ALTER TABLE loans ADD CONSTRAINT loans_type_check 
CHECK (type IN ('Personal Loan', 'Home Loan', 'Car Loan', 'Education Loan', 'Business Loan', 'Credit Card', 'Vehicle Finance', 'Two Wheeler Loan', 'Gold Loan', 'Other'));