/*
  # Allow Anonymous Access to All Tables

  1. Changes
    - Drop all existing restrictive RLS policies
    - Create new permissive policies that allow public access to:
      - prospects table (SELECT, INSERT, UPDATE, DELETE)
      - health_plans table (SELECT, INSERT, UPDATE, DELETE)
      - dropdown_options table (already has public SELECT, adding others)
  
  2. Security Note
    - This allows anyone with the URL to access and modify data
    - RLS remains enabled but policies are permissive
    - Suitable for development or internal use cases
*/

-- Drop existing restrictive policies on prospects
DROP POLICY IF EXISTS "Authenticated users can view all prospects" ON prospects;
DROP POLICY IF EXISTS "Authenticated users can insert prospects" ON prospects;
DROP POLICY IF EXISTS "Users can update prospects they created" ON prospects;

-- Drop existing restrictive policies on health_plans
DROP POLICY IF EXISTS "Authenticated users can view all health plans" ON health_plans;
DROP POLICY IF EXISTS "Authenticated users can insert health plans" ON health_plans;

-- Drop existing policies on dropdown_options
DROP POLICY IF EXISTS "Anyone can read dropdown options" ON dropdown_options;
DROP POLICY IF EXISTS "Authenticated users can insert dropdown options" ON dropdown_options;
DROP POLICY IF EXISTS "Authenticated users can update dropdown options" ON dropdown_options;
DROP POLICY IF EXISTS "Authenticated users can delete dropdown options" ON dropdown_options;

-- Create permissive policies for prospects table
CREATE POLICY "Anyone can view prospects"
  ON prospects FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert prospects"
  ON prospects FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update prospects"
  ON prospects FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete prospects"
  ON prospects FOR DELETE
  TO public
  USING (true);

-- Create permissive policies for health_plans table
CREATE POLICY "Anyone can view health plans"
  ON health_plans FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert health plans"
  ON health_plans FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update health plans"
  ON health_plans FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete health plans"
  ON health_plans FOR DELETE
  TO public
  USING (true);

-- Create permissive policies for dropdown_options table
CREATE POLICY "Anyone can view dropdown options"
  ON dropdown_options FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert dropdown options"
  ON dropdown_options FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update dropdown options"
  ON dropdown_options FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete dropdown options"
  ON dropdown_options FOR DELETE
  TO public
  USING (true);
