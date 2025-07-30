-- Fix the morning transactions by setting the correct household_id
-- Get your household ID first and update all your null household_id transactions

UPDATE transactions 
SET household_id = 'be369c4e-095f-4b52-bb2a-51a43de4eac8'  -- Your household ID
WHERE user_id = '0164feb7-bb80-455e-bc2f-88db9c062ff1' 
AND household_id IS NULL;