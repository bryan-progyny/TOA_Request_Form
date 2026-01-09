/*
  # Add Smart Cycles Options Fields

  1. New Benefit Section Fields
    - `smart_cycles_option_1` (text, optional) - Number of smart cycles for option 1
      Values: '1', '1+1', '2', '2+1', '3', '4', 'unlimited'
    - `smart_cycles_option_2` (text, optional) - Number of smart cycles for option 2
      Values: '1', '1+1', '2', '2+1', '3', '4', 'unlimited'

  2. Business Logic
    - Option 1 appears when scenarios_count is 1 or 2
    - Option 2 only appears when scenarios_count is 2
    - Both fields are optional and nullable

  3. Migration Strategy
    - Add columns with CHECK constraints to ensure valid values
    - Use IF NOT EXISTS to make migration idempotent
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'smart_cycles_option_1'
  ) THEN
    ALTER TABLE prospects ADD COLUMN smart_cycles_option_1 text CHECK (smart_cycles_option_1 IN ('1', '1+1', '2', '2+1', '3', '4', 'unlimited'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'smart_cycles_option_2'
  ) THEN
    ALTER TABLE prospects ADD COLUMN smart_cycles_option_2 text CHECK (smart_cycles_option_2 IN ('1', '1+1', '2', '2+1', '3', '4', 'unlimited'));
  END IF;
END $$;