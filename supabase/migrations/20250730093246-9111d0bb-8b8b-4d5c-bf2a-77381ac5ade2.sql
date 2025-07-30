-- Update existing transactions to be shared with household
-- First, get the household ID for the user
UPDATE transactions 
SET household_id = (
  SELECT h.id 
  FROM households h 
  JOIN household_members hm ON h.id = hm.household_id 
  WHERE hm.user_id = transactions.user_id 
  AND hm.role = 'owner'
  LIMIT 1
)
WHERE household_id IS NULL 
AND user_id = '0164feb7-bb80-455e-bc2f-88db9c062ff1';