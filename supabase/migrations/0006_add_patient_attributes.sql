-- Add missing columns to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS ever_married BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS work_type TEXT DEFAULT 'Private',
ADD COLUMN IF NOT EXISTS residence_type TEXT DEFAULT 'Urban';
