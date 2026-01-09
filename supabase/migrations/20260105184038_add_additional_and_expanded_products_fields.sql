/*
  # Add Additional and Expanded Products Fields

  1. Additional Section Fields
    - `dollar_max_column` (boolean, optional) - Whether to show Dollar Max column for comparison
    - `competing_against` (text[], optional) - Array of competitors (up to 2 selections)
    - `adoption_surrogacy_estimates` (boolean, optional) - Whether to show adoption and surrogacy estimates
    - `adoption_coverage` (numeric, optional) - Dollar amount for adoption coverage
    - `adoption_frequency` (text, optional) - Per lifetime or per child
    - `surrogacy_coverage` (numeric, optional) - Dollar amount for surrogacy coverage
    - `surrogacy_frequency` (text, optional) - Per lifetime or per child

  2. Expanded Products Section Fields
    - `female_employees_40_60` (integer, optional) - Number of female employees, spouses, domestic partners age 40-60
    - `live_births_12mo_expanded` (integer, optional) - Number of live births in most recent 12 months
    - `subscribers_dependents_under_12` (integer, optional) - Number of subscribers with dependents 12 and under

  3. General Fields
    - `notes` (text, optional) - Free text notes field

  4. Migration Strategy
    - Add all columns as nullable since they're optional
    - Add check constraints where appropriate
*/

-- Additional section fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'dollar_max_column'
  ) THEN
    ALTER TABLE prospects ADD COLUMN dollar_max_column boolean;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'competing_against'
  ) THEN
    ALTER TABLE prospects ADD COLUMN competing_against text[];
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'adoption_surrogacy_estimates'
  ) THEN
    ALTER TABLE prospects ADD COLUMN adoption_surrogacy_estimates boolean;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'adoption_coverage'
  ) THEN
    ALTER TABLE prospects ADD COLUMN adoption_coverage numeric(12, 2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'adoption_frequency'
  ) THEN
    ALTER TABLE prospects ADD COLUMN adoption_frequency text CHECK (adoption_frequency IN ('Per lifetime', 'Per child'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'surrogacy_coverage'
  ) THEN
    ALTER TABLE prospects ADD COLUMN surrogacy_coverage numeric(12, 2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'surrogacy_frequency'
  ) THEN
    ALTER TABLE prospects ADD COLUMN surrogacy_frequency text CHECK (surrogacy_frequency IN ('Per lifetime', 'Per child'));
  END IF;
END $$;

-- Expanded products section fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'female_employees_40_60'
  ) THEN
    ALTER TABLE prospects ADD COLUMN female_employees_40_60 integer;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'live_births_12mo_expanded'
  ) THEN
    ALTER TABLE prospects ADD COLUMN live_births_12mo_expanded integer;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'subscribers_dependents_under_12'
  ) THEN
    ALTER TABLE prospects ADD COLUMN subscribers_dependents_under_12 integer;
  END IF;
END $$;

-- General notes field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'notes'
  ) THEN
    ALTER TABLE prospects ADD COLUMN notes text;
  END IF;
END $$;