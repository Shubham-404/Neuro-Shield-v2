-- NeuroShield Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DOCTORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    specialization TEXT,
    license_number TEXT,
    hospital TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PATIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    age INTEGER,
    gender TEXT,
    medical_history TEXT,
    blood_group TEXT,
    hypertension BOOLEAN DEFAULT FALSE,
    heart_disease BOOLEAN DEFAULT FALSE,
    avg_glucose_level DECIMAL(10, 2),
    bmi DECIMAL(5, 2),
    smoking_status TEXT DEFAULT 'Unknown',
    medications TEXT,
    created_by UUID REFERENCES doctors(id) ON DELETE SET NULL,
    past_doctor_ids UUID[] DEFAULT ARRAY[]::UUID[],
    latest_risk_level TEXT,
    nihss_total INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADMINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PREDICTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    prediction INTEGER, -- 0 or 1
    probability DECIMAL(5, 4), -- 0.0000 to 1.0000
    risk_level TEXT CHECK (risk_level IN ('Low', 'Moderate', 'High')),
    key_factors JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEDICATION SUGGESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medication_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    suggested_by UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    suggestion TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_doctors_auth_id ON doctors(auth_id);
CREATE INDEX IF NOT EXISTS idx_patients_auth_id ON patients(auth_id);
CREATE INDEX IF NOT EXISTS idx_patients_created_by ON patients(created_by);
CREATE INDEX IF NOT EXISTS idx_patients_past_doctor_ids ON patients USING GIN(past_doctor_ids);
CREATE INDEX IF NOT EXISTS idx_admins_auth_id ON admins(auth_id);
CREATE INDEX IF NOT EXISTS idx_predictions_patient_id ON predictions(patient_id);
CREATE INDEX IF NOT EXISTS idx_predictions_doctor_id ON predictions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medication_suggestions_patient_id ON medication_suggestions(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_suggestions_status ON medication_suggestions(status);

-- ============================================
-- TRIGGER FUNCTION: Handle new user signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    user_name TEXT;
    user_email TEXT;
    user_metadata JSONB;
BEGIN
    -- Get user metadata
    user_metadata := NEW.raw_user_meta_data;
    user_role := COALESCE(user_metadata->>'role', 'patient');
    user_name := COALESCE(user_metadata->>'name', split_part(NEW.email, '@', 1));
    user_email := NEW.email;

    -- Insert into appropriate table based on role
    IF user_role = 'doctor' THEN
        INSERT INTO public.doctors (
            auth_id,
            full_name,
            email,
            specialization,
            license_number,
            hospital
        ) VALUES (
            NEW.id,
            user_name,
            user_email,
            user_metadata->>'specialization',
            user_metadata->>'license_number',
            user_metadata->>'hospital'
        );
    ELSIF user_role = 'patient' THEN
        INSERT INTO public.patients (
            auth_id,
            name,
            email,
            medical_history,
            blood_group
        ) VALUES (
            NEW.id,
            user_name,
            user_email,
            user_metadata->>'medical_history',
            user_metadata->>'blood_group'
        );
    ELSIF user_role = 'admin' THEN
        INSERT INTO public.admins (
            auth_id,
            name,
            email
        ) VALUES (
            NEW.id,
            user_name,
            user_email
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Automatically create profile on user signup
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS: Auto-update updated_at
-- ============================================
CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON doctors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_suggestions_updated_at
    BEFORE UPDATE ON medication_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Optional
-- ============================================
-- Enable RLS if needed (currently disabled as per spec)
-- ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE medication_suggestions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- GRANTS (if using service role)
-- ============================================
-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

