/*
  # Add rush_reason field to prospects table

  1. Changes
    - Adds `rush_reason` column to `prospects` table to store the reason when the due date is changed from the standard 5-day SLA
  
  2. Details
    - Column is nullable (text type)
    - Only populated when the user changes the due date from the default calculated date
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'rush_reason'
  ) THEN
    ALTER TABLE prospects ADD COLUMN rush_reason text;
  END IF;
END $$;