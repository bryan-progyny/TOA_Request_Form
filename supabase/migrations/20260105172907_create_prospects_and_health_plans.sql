/*
  # Create Prospects and Health Plans Tables

  1. New Tables
    - `prospects`
      - `id` (uuid, primary key)
      - `prospect_name` (text, required) - Name of the prospect/client
      - `prospect_industry` (text, required) - Industry of the prospect
      - `number_of_employees` (integer, required) - Total number of employees
      - `jira_ticket_id` (text, optional) - ID of created Jira ticket
      - `created_at` (timestamptz) - When the record was created
      - `created_by` (uuid, optional) - User who created the record
    
    - `health_plans`
      - `id` (uuid, primary key)
      - `prospect_id` (uuid, foreign key) - References prospects table
      - `health_plan_name` (text, required) - Name of the health plan
      - `deductible_individual` (decimal, required) - Individual deductible amount
      - `deductible_family` (decimal, required) - Family deductible amount
      - `deductible_type` (text, required) - Either 'embedded' or 'aggregate'
      - `oop_individual` (decimal, required) - Out of pocket individual amount
      - `oop_family` (decimal, required) - Out of pocket family amount
      - `oop_type` (text, required) - Either 'embedded' or 'aggregate'
      - `coinsurance_individual` (decimal, required) - Individual coinsurance percentage
      - `coinsurance_family` (decimal, required) - Family coinsurance percentage
      - `employee_distribution` (decimal, required) - Number or percentage of employees
      - `employee_distribution_type` (text, required) - Either 'number' or 'percentage'
      - `has_copays` (boolean, required) - Whether plan includes copays
      - `copay_type` (text, optional) - Type of copay if applicable
      - `created_at` (timestamptz) - When the record was created

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to insert and read their own data
    - Add policies for authenticated users to read all data (for analysis team)
*/

-- Create prospects table
CREATE TABLE IF NOT EXISTS prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_name text NOT NULL,
  prospect_industry text NOT NULL,
  number_of_employees integer NOT NULL CHECK (number_of_employees > 0),
  jira_ticket_id text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create health_plans table
CREATE TABLE IF NOT EXISTS health_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  health_plan_name text NOT NULL,
  deductible_individual decimal(10,2) NOT NULL CHECK (deductible_individual >= 0),
  deductible_family decimal(10,2) NOT NULL CHECK (deductible_family >= 0),
  deductible_type text NOT NULL CHECK (deductible_type IN ('embedded', 'aggregate')),
  oop_individual decimal(10,2) NOT NULL CHECK (oop_individual >= 0),
  oop_family decimal(10,2) NOT NULL CHECK (oop_family >= 0),
  oop_type text NOT NULL CHECK (oop_type IN ('embedded', 'aggregate')),
  coinsurance_individual decimal(5,2) NOT NULL CHECK (coinsurance_individual >= 0 AND coinsurance_individual <= 100),
  coinsurance_family decimal(5,2) NOT NULL CHECK (coinsurance_family >= 0 AND coinsurance_family <= 100),
  employee_distribution decimal(10,2) NOT NULL CHECK (employee_distribution > 0),
  employee_distribution_type text NOT NULL CHECK (employee_distribution_type IN ('number', 'percentage')),
  has_copays boolean NOT NULL DEFAULT false,
  copay_type text CHECK (copay_type IN ('Medical and Rx', 'Medical only', 'Rx Only', 'Surest plan', 'Other')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_plans ENABLE ROW LEVEL SECURITY;

-- Prospects policies
CREATE POLICY "Authenticated users can insert prospects"
  ON prospects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all prospects"
  ON prospects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update prospects they created"
  ON prospects FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Health plans policies
CREATE POLICY "Authenticated users can insert health plans"
  ON health_plans FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all health plans"
  ON health_plans FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_health_plans_prospect_id ON health_plans(prospect_id);
CREATE INDEX IF NOT EXISTS idx_prospects_created_at ON prospects(created_at DESC);