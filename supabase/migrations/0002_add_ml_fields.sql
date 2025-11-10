-- Add ML prediction required fields to patients table
-- Run this in Supabase SQL Editor if columns don't exist

-- Add ever_married column (boolean)
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS ever_married BOOLEAN DEFAULT TRUE;

-- Add work_type column (text)
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS work_type TEXT DEFAULT 'Private';

-- Add residence_type column (text)
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS residence_type TEXT DEFAULT 'Urban';

-- Add comments for documentation
COMMENT ON COLUMN patients.ever_married IS 'Whether patient has ever been married (required for ML predictions)';
COMMENT ON COLUMN patients.work_type IS 'Work type: Private, Self-employed, Govt_job, children, Never_worked (required for ML predictions)';
COMMENT ON COLUMN patients.residence_type IS 'Residence type: Urban or Rural (required for ML predictions)';

