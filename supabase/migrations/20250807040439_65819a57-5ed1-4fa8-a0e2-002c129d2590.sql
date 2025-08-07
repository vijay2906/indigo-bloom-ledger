-- Remove duplicate categories, keeping only the first occurrence of each name
DELETE FROM categories c1
WHERE c1.created_at > (
  SELECT MIN(c2.created_at)
  FROM categories c2
  WHERE c2.name = c1.name
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE categories ADD CONSTRAINT categories_name_unique UNIQUE (name);