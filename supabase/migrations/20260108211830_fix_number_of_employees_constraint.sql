/*
  # Fix number_of_employees constraint
  
  1. Changes
    - Make `number_of_employees` nullable since we're now using `eligible_employees` instead
    - This allows the edge function to insert records without providing number_of_employees
  
  2. Notes
    - The field is kept for backward compatibility but is no longer required
    - New submissions use `eligible_employees` and `eligible_members` instead
*/

-- Make number_of_employees nullable
DO $$
BEGIN
  -- First, drop the NOT NULL constraint
  ALTER TABLE prospects ALTER COLUMN number_of_employees DROP NOT NULL;
END $$;
