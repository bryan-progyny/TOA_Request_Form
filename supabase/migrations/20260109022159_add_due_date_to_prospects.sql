/*
  # Add Due Date Field to Prospects

  1. Changes
    - Add `due_date` column to `prospects` table
      - Type: date
      - Optional field (can be null)
      - Represents when the TOA request needs to be completed by

  2. Notes
    - This allows reps to specify when they need the TOA by
    - Field is optional to maintain compatibility with existing data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE prospects ADD COLUMN due_date date;
  END IF;
END $$;