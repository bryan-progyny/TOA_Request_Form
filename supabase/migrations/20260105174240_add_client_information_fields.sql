/*
  # Add Client Information Fields

  1. Changes to prospects table
    - Add `union_type` (text, optional) - Type of union for union clients
    - Rename `number_of_employees` conceptually to track medically enrolled employees
    - Add `eligible_employees` (integer, required) - Number of medically enrolled employees
    - Add `eligible_members` (integer, required) - Number of medically enrolled employees + spouses/dependents
    - Add `consultant` (text, optional) - Consultant company
    - Add `channel_partnership` (text, optional) - Channel partnership
    - Add `healthplan_partnership` (text, optional) - Health plan partnership
    - Add `needs_cigna_slides` (boolean, optional) - Whether Cigna branded slides are needed

  2. Migration Strategy
    - Add new columns with appropriate constraints
    - Maintain backward compatibility by keeping number_of_employees
*/

-- Add union type field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'union_type'
  ) THEN
    ALTER TABLE prospects ADD COLUMN union_type text;
  END IF;
END $$;

-- Add eligible employees field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'eligible_employees'
  ) THEN
    ALTER TABLE prospects ADD COLUMN eligible_employees integer CHECK (eligible_employees > 0);
  END IF;
END $$;

-- Add eligible members field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'eligible_members'
  ) THEN
    ALTER TABLE prospects ADD COLUMN eligible_members integer CHECK (eligible_members > 0);
  END IF;
END $$;

-- Add consultant field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'consultant'
  ) THEN
    ALTER TABLE prospects ADD COLUMN consultant text CHECK (consultant IN ('WTW', 'Mercer', 'TPG', 'Others'));
  END IF;
END $$;

-- Add channel partnership field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'channel_partnership'
  ) THEN
    ALTER TABLE prospects ADD COLUMN channel_partnership text CHECK (channel_partnership IN ('CVS', 'Caslight', 'Evernorth', 'CHA', 'Quantum', 'Other'));
  END IF;
END $$;

-- Add healthplan partnership field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'healthplan_partnership'
  ) THEN
    ALTER TABLE prospects ADD COLUMN healthplan_partnership text CHECK (healthplan_partnership IN ('IBX', 'BCBSNC', 'HealthPartners', 'Brighton', 'WebTPA', 'MagniCare', 'Surest', 'Meritain', 'Providence', 'BCBS Alabama', 'Cigna'));
  END IF;
END $$;

-- Add needs cigna slides field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'needs_cigna_slides'
  ) THEN
    ALTER TABLE prospects ADD COLUMN needs_cigna_slides boolean;
  END IF;
END $$;