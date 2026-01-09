/*
  # Add New Benefit Fields

  1. Changes to prospects table
    - Add `scenarios_count` (integer, optional) - Number of scenarios to show (1 or 2)
    - Add `rx_coverage_type` (text, optional) - How Rx will be covered ("Prog Rx" or "No Prog Rx")
    - Add `egg_freezing_coverage` (text, optional) - Elective egg freezing coverage option
    - Add `fertility_pepm` (decimal, optional) - Fertility PEPM cost
    - Add `fertility_case_rate` (decimal, optional) - Fertility case rate cost
    - Add `implementation_fee` (decimal, optional) - Implementation fee amount

  2. Migration Strategy
    - Add new columns with appropriate constraints
    - Support decimal values for monetary fields
*/

-- Add scenarios count field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'scenarios_count'
  ) THEN
    ALTER TABLE prospects ADD COLUMN scenarios_count integer CHECK (scenarios_count IN (1, 2));
  END IF;
END $$;

-- Add Rx coverage type field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'rx_coverage_type'
  ) THEN
    ALTER TABLE prospects ADD COLUMN rx_coverage_type text CHECK (rx_coverage_type IN ('Prog Rx', 'No Prog Rx'));
  END IF;
END $$;

-- Add egg freezing coverage field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'egg_freezing_coverage'
  ) THEN
    ALTER TABLE prospects ADD COLUMN egg_freezing_coverage text CHECK (egg_freezing_coverage IN ('Yes (included in the employer cost)', 'Yes (spiked out from the employer cost)', 'No'));
  END IF;
END $$;

-- Add fertility PEPM field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'fertility_pepm'
  ) THEN
    ALTER TABLE prospects ADD COLUMN fertility_pepm decimal(10,2) CHECK (fertility_pepm >= 0);
  END IF;
END $$;

-- Add fertility case rate field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'fertility_case_rate'
  ) THEN
    ALTER TABLE prospects ADD COLUMN fertility_case_rate decimal(10,2) CHECK (fertility_case_rate >= 0);
  END IF;
END $$;

-- Add implementation fee field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'implementation_fee'
  ) THEN
    ALTER TABLE prospects ADD COLUMN implementation_fee decimal(10,2) CHECK (implementation_fee >= 0);
  END IF;
END $$;