/*
  # Add Hash Key for Joining Tables

  1. Changes
    - Add `hash_key` column to `prospects` table
      - Text field that will store a unique hash value
      - Generated automatically on insert
      - Indexed for fast joins
    
    - Add `hash_key` column to `health_plans` table
      - Text field that matches the prospect's hash_key
      - Allows joining the two tables without foreign key dependency
      - Indexed for fast joins
  
  2. Purpose
    - Enables joining TOA inputs (prospects) with health plan data using a shared hash
    - Provides flexibility for data relationships
    - Maintains data integrity while allowing looser coupling
  
  3. Implementation Notes
    - Existing records will get a hash generated from their UUID
    - New records will generate hash on insert via trigger
    - Both columns are indexed for optimal join performance
*/

-- Add hash_key column to prospects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prospects' AND column_name = 'hash_key'
  ) THEN
    ALTER TABLE prospects ADD COLUMN hash_key text;
  END IF;
END $$;

-- Add hash_key column to health_plans table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'health_plans' AND column_name = 'hash_key'
  ) THEN
    ALTER TABLE health_plans ADD COLUMN hash_key text;
  END IF;
END $$;

-- Create function to generate hash key from UUID and timestamp
CREATE OR REPLACE FUNCTION generate_hash_key()
RETURNS text AS $$
BEGIN
  RETURN encode(digest(gen_random_uuid()::text || now()::text, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Update existing prospects with hash keys (derived from their UUID)
UPDATE prospects 
SET hash_key = encode(digest(id::text, 'sha256'), 'hex')
WHERE hash_key IS NULL;

-- Update existing health_plans with hash keys matching their prospect
UPDATE health_plans hp
SET hash_key = p.hash_key
FROM prospects p
WHERE hp.prospect_id = p.id AND hp.hash_key IS NULL;

-- Make hash_key required and unique for prospects
ALTER TABLE prospects ALTER COLUMN hash_key SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_prospects_hash_key ON prospects(hash_key);

-- Make hash_key required for health_plans (but not unique, multiple plans can share same hash)
ALTER TABLE health_plans ALTER COLUMN hash_key SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_health_plans_hash_key ON health_plans(hash_key);

-- Create trigger to auto-generate hash_key for new prospects
CREATE OR REPLACE FUNCTION set_prospect_hash_key()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.hash_key IS NULL THEN
    NEW.hash_key := generate_hash_key();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_prospect_hash_key ON prospects;
CREATE TRIGGER trigger_set_prospect_hash_key
  BEFORE INSERT ON prospects
  FOR EACH ROW
  EXECUTE FUNCTION set_prospect_hash_key();

-- Create trigger to copy hash_key from prospect to health_plan
CREATE OR REPLACE FUNCTION set_health_plan_hash_key()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.hash_key IS NULL AND NEW.prospect_id IS NOT NULL THEN
    SELECT hash_key INTO NEW.hash_key 
    FROM prospects 
    WHERE id = NEW.prospect_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_health_plan_hash_key ON health_plans;
CREATE TRIGGER trigger_set_health_plan_hash_key
  BEFORE INSERT ON health_plans
  FOR EACH ROW
  EXECUTE FUNCTION set_health_plan_hash_key();