-- Update existing accounts to be shared with household
-- Your accounts need household_id set so your wife can see them

UPDATE accounts 
SET household_id = (
  SELECT h.id 
  FROM households h 
  JOIN household_members hm ON h.id = hm.household_id 
  WHERE hm.user_id = accounts.user_id 
  AND hm.role = 'owner'
  LIMIT 1
)
WHERE household_id IS NULL 
AND user_id = '0164feb7-bb80-455e-bc2f-88db9c062ff1';