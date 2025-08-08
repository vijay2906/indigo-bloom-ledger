-- Drop the existing constraint
ALTER TABLE loans DROP CONSTRAINT IF EXISTS loans_type_check;

-- Add constraint that matches the form values
ALTER TABLE loans ADD CONSTRAINT loans_type_check 
CHECK (type IN ('personal', 'home', 'auto', 'student', 'business', 'Personal Loan', 'Home Loan', 'Car Loan', 'Education Loan', 'Business Loan', 'Credit Card', 'Vehicle Finance', 'Two Wheeler Loan', 'Gold Loan', 'Other'));