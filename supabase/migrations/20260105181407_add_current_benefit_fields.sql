/*
  # Add Current Benefit Fields

  1. Changes to prospects table
    - Add `current_fertility_benefit` (text, optional) - Type of fertility benefit currently offered
    - Add `fertility_administrator` (text, optional) - Who administers the fertility benefit

  2. Migration Strategy
    - Add new columns with appropriate constraints for dropdown values
*/

-- Add current fertility benefit field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'current_fertility_benefit'
  ) THEN
    ALTER TABLE prospects ADD COLUMN current_fertility_benefit text CHECK (current_fertility_benefit IN ('Standard benefits', 'non-standard benefit (cycle)', 'fully insured', 'No benefit'));
  END IF;
END $$;

-- Add fertility administrator field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'fertility_administrator'
  ) THEN
    ALTER TABLE prospects ADD COLUMN fertility_administrator text CHECK (fertility_administrator IN ('Carrot', 'Kindbody', 'Ovia', 'WIN', 'Maven', 'Carrier', 'Other'));
  END IF;
END $$;