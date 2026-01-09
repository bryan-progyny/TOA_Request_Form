/*
  # Add Conditional Current Benefit Fields

  1. New Fields for Standard Benefit / Fully Insured
    - `combined_medical_rx_benefit` (boolean, optional) - Whether prospect has combined medical/Rx benefit
    - `current_fertility_medical_limit` (numeric, optional) - Current fertility medical dollar limit
    - `medical_ltm_type` (text, optional) - Medical limit type: 'Lifetime' or 'Annual'
    - `current_fertility_rx_limit` (numeric, optional) - Current fertility Rx dollar limit
    - `rx_ltm_type` (text, optional) - Rx limit type: 'Lifetime' or 'Annual'

  2. New Fields for Non-Standard Benefit (Cycle)
    - `medical_benefit_details` (text, optional) - Free text for medical benefit details
    - `rx_benefit_details` (text, optional) - Free text for Rx benefit details

  3. Common Fields (All benefit types except "No benefit")
    - `current_elective_egg_freezing` (text, optional) - Yes/No/Unsure for egg freezing
    - `live_births_12mo` (integer, optional) - Number of live births in last 12 months
    - `current_benefit_pepm` (numeric, optional) - Current benefit PEPM cost
    - `current_benefit_case_fee` (numeric, optional) - Current benefit case fee

  4. Field for No Benefit
    - `include_no_benefit_column` (boolean, optional) - Include no benefit column in TOA

  5. Migration Strategy
    - Add all columns as nullable since they're conditional
    - Add check constraints where appropriate
*/

-- Standard Benefit / Fully Insured fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'combined_medical_rx_benefit'
  ) THEN
    ALTER TABLE prospects ADD COLUMN combined_medical_rx_benefit boolean;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'current_fertility_medical_limit'
  ) THEN
    ALTER TABLE prospects ADD COLUMN current_fertility_medical_limit numeric(12, 2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'medical_ltm_type'
  ) THEN
    ALTER TABLE prospects ADD COLUMN medical_ltm_type text CHECK (medical_ltm_type IN ('Lifetime', 'Annual'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'current_fertility_rx_limit'
  ) THEN
    ALTER TABLE prospects ADD COLUMN current_fertility_rx_limit numeric(12, 2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'rx_ltm_type'
  ) THEN
    ALTER TABLE prospects ADD COLUMN rx_ltm_type text CHECK (rx_ltm_type IN ('Lifetime', 'Annual'));
  END IF;
END $$;

-- Non-Standard Benefit fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'medical_benefit_details'
  ) THEN
    ALTER TABLE prospects ADD COLUMN medical_benefit_details text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'rx_benefit_details'
  ) THEN
    ALTER TABLE prospects ADD COLUMN rx_benefit_details text;
  END IF;
END $$;

-- Common fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'current_elective_egg_freezing'
  ) THEN
    ALTER TABLE prospects ADD COLUMN current_elective_egg_freezing text CHECK (current_elective_egg_freezing IN ('Yes', 'No', 'Unsure'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'live_births_12mo'
  ) THEN
    ALTER TABLE prospects ADD COLUMN live_births_12mo integer;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'current_benefit_pepm'
  ) THEN
    ALTER TABLE prospects ADD COLUMN current_benefit_pepm numeric(12, 2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'current_benefit_case_fee'
  ) THEN
    ALTER TABLE prospects ADD COLUMN current_benefit_case_fee numeric(12, 2);
  END IF;
END $$;

-- No Benefit field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'include_no_benefit_column'
  ) THEN
    ALTER TABLE prospects ADD COLUMN include_no_benefit_column boolean;
  END IF;
END $$;