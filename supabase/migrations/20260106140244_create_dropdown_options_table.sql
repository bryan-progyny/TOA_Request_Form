/*
  # Create dropdown options table

  1. New Tables
    - `dropdown_options`
      - `id` (uuid, primary key) - Unique identifier
      - `option_type` (text) - Type of dropdown (e.g., 'prospect_name', 'union_type')
      - `value` (text) - The actual option value
      - `display_order` (integer) - Order to display options
      - `created_at` (timestamptz) - When the option was created
      - `updated_at` (timestamptz) - When the option was last updated

  2. Security
    - Enable RLS on `dropdown_options` table
    - Add policy for authenticated users to read options
    - Add policy for authenticated users to insert/update/delete options

  3. Indexes
    - Index on option_type for faster lookups
    - Unique constraint on (option_type, value) to prevent duplicates
*/

CREATE TABLE IF NOT EXISTS dropdown_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  option_type text NOT NULL,
  value text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_option UNIQUE (option_type, value)
);

CREATE INDEX IF NOT EXISTS idx_dropdown_options_type ON dropdown_options(option_type);

ALTER TABLE dropdown_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read dropdown options"
  ON dropdown_options
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert dropdown options"
  ON dropdown_options
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update dropdown options"
  ON dropdown_options
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete dropdown options"
  ON dropdown_options
  FOR DELETE
  TO authenticated
  USING (true);