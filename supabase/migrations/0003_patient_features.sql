-- Patient-Oriented Features Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- MEDICAL RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL CHECK (record_type IN ('report', 'lab_result', 'scan', 'prescription', 'other')),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT, -- URL to uploaded file (PDF, image)
    file_type TEXT, -- 'pdf', 'image', etc.
    file_size INTEGER, -- Size in bytes
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    record_date DATE, -- Date when the record was created (not upload date)
    verified_by UUID REFERENCES doctors(id) ON DELETE SET NULL,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'needs_review')),
    doctor_notes TEXT, -- Notes from verifying doctor
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HEALTH METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS health_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('blood_pressure', 'blood_sugar', 'weight', 'bmi', 'heart_rate', 'temperature', 'other')),
    value DECIMAL(10, 2),
    unit TEXT, -- 'mmHg', 'mg/dL', 'kg', 'bpm', '°C', etc.
    notes TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HEALTH LOGS TABLE (for habits, symptoms, medications)
-- ============================================
CREATE TABLE IF NOT EXISTS health_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    log_type TEXT NOT NULL CHECK (log_type IN ('symptom', 'medication', 'habit', 'exercise', 'diet', 'sleep', 'stress', 'other')),
    title TEXT NOT NULL,
    description TEXT,
    value TEXT, -- For medications: dosage, frequency; for habits: description
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TIME, -- Optional time of day
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOCTOR VERIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('verified', 'rejected', 'needs_more_info')),
    notes TEXT,
    requested_info TEXT, -- If status is 'needs_more_info', what info is needed
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(medical_record_id, doctor_id) -- One verification per doctor per record
);

-- ============================================
-- HEALTH RECOMMENDATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS health_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('diet', 'exercise', 'sleep', 'hydration', 'stress_management', 'medication', 'lifestyle', 'warning')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT, -- For diet: 'breakfast', 'lunch', 'dinner', 'snack'; for exercise: 'cardio', 'strength', etc.
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES doctors(id) ON DELETE SET NULL, -- NULL means system-generated
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOCTOR LOCATIONS TABLE (for finding doctors/hospitals)
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    hospital_name TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    country TEXT DEFAULT 'India',
    postal_code TEXT,
    latitude DECIMAL(10, 8), -- For geolocation
    longitude DECIMAL(11, 8), -- For geolocation
    phone TEXT,
    email TEXT,
    specialties TEXT[], -- Array of specialties this location handles
    is_primary BOOLEAN DEFAULT FALSE, -- Primary location for the doctor
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PATIENT-DOCTOR RELATIONSHIPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patient_doctor_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    relationship_type TEXT DEFAULT 'current' CHECK (relationship_type IN ('current', 'past', 'consultation')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    notes TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(patient_id, doctor_id, relationship_type) -- Prevent duplicates
);

-- ============================================
-- INDEXES for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_verified_by ON medical_records(verified_by);
CREATE INDEX IF NOT EXISTS idx_medical_records_status ON medical_records(verification_status);
CREATE INDEX IF NOT EXISTS idx_medical_records_created_at ON medical_records(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_health_metrics_patient_id ON health_metrics(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_type ON health_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_health_metrics_recorded_at ON health_metrics(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_health_logs_patient_id ON health_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_logs_type ON health_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_health_logs_date ON health_logs(date DESC);

CREATE INDEX IF NOT EXISTS idx_doctor_verifications_record_id ON doctor_verifications(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_doctor_verifications_doctor_id ON doctor_verifications(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_verifications_status ON doctor_verifications(status);

CREATE INDEX IF NOT EXISTS idx_health_recommendations_patient_id ON health_recommendations(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_recommendations_type ON health_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_health_recommendations_active ON health_recommendations(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_doctor_locations_doctor_id ON doctor_locations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_locations_city ON doctor_locations(city);
CREATE INDEX IF NOT EXISTS idx_doctor_locations_specialties ON doctor_locations USING GIN(specialties);

CREATE INDEX IF NOT EXISTS idx_patient_doctor_relationships_patient_id ON patient_doctor_relationships(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_doctor_relationships_doctor_id ON patient_doctor_relationships(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_doctor_relationships_status ON patient_doctor_relationships(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_doctor_relationships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Patients can view their own medical records" ON medical_records;
DROP POLICY IF EXISTS "Patients can insert their own medical records" ON medical_records;
DROP POLICY IF EXISTS "Patients can update their own medical records" ON medical_records;
DROP POLICY IF EXISTS "Patients can delete their own medical records" ON medical_records;
DROP POLICY IF EXISTS "Doctors can view medical records of their patients" ON medical_records;
DROP POLICY IF EXISTS "Patients can manage their own health metrics" ON health_metrics;
DROP POLICY IF EXISTS "Doctors can view health metrics of their patients" ON health_metrics;
DROP POLICY IF EXISTS "Patients can manage their own health logs" ON health_logs;
DROP POLICY IF EXISTS "Doctors can view health logs of their patients" ON health_logs;
DROP POLICY IF EXISTS "Doctors can manage verifications" ON doctor_verifications;
DROP POLICY IF EXISTS "Patients can view verifications of their records" ON doctor_verifications;
DROP POLICY IF EXISTS "Patients can view their own recommendations" ON health_recommendations;
DROP POLICY IF EXISTS "Doctors can manage recommendations for their patients" ON health_recommendations;
DROP POLICY IF EXISTS "Anyone can view doctor locations" ON doctor_locations;
DROP POLICY IF EXISTS "Doctors can manage their own locations" ON doctor_locations;
DROP POLICY IF EXISTS "Patients can view their doctor relationships" ON patient_doctor_relationships;
DROP POLICY IF EXISTS "Doctors can view their patient relationships" ON patient_doctor_relationships;

-- Medical Records Policies
CREATE POLICY "Patients can view their own medical records"
    ON medical_records FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patients WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Patients can insert their own medical records"
    ON medical_records FOR INSERT
    WITH CHECK (
        patient_id IN (
            SELECT id FROM patients WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Patients can update their own medical records"
    ON medical_records FOR UPDATE
    USING (
        patient_id IN (
            SELECT id FROM patients WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Patients can delete their own medical records"
    ON medical_records FOR DELETE
    USING (
        patient_id IN (
            SELECT id FROM patients WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can view medical records of their patients"
    ON medical_records FOR SELECT
    USING (
        verified_by IN (
            SELECT id FROM doctors WHERE auth_id = auth.uid()
        )
        OR
        patient_id IN (
            SELECT patient_id FROM patient_doctor_relationships 
            WHERE doctor_id IN (SELECT id FROM doctors WHERE auth_id = auth.uid())
            AND status = 'active'
        )
    );

-- Health Metrics Policies
CREATE POLICY "Patients can manage their own health metrics"
    ON health_metrics FOR ALL
    USING (
        patient_id IN (
            SELECT id FROM patients WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can view health metrics of their patients"
    ON health_metrics FOR SELECT
    USING (
        patient_id IN (
            SELECT patient_id FROM patient_doctor_relationships 
            WHERE doctor_id IN (SELECT id FROM doctors WHERE auth_id = auth.uid())
            AND status = 'active'
        )
    );

-- Health Logs Policies
CREATE POLICY "Patients can manage their own health logs"
    ON health_logs FOR ALL
    USING (
        patient_id IN (
            SELECT id FROM patients WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can view health logs of their patients"
    ON health_logs FOR SELECT
    USING (
        patient_id IN (
            SELECT patient_id FROM patient_doctor_relationships 
            WHERE doctor_id IN (SELECT id FROM doctors WHERE auth_id = auth.uid())
            AND status = 'active'
        )
    );

-- Doctor Verifications Policies
CREATE POLICY "Doctors can manage verifications"
    ON doctor_verifications FOR ALL
    USING (
        doctor_id IN (
            SELECT id FROM doctors WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Patients can view verifications of their records"
    ON doctor_verifications FOR SELECT
    USING (
        medical_record_id IN (
            SELECT id FROM medical_records 
            WHERE patient_id IN (SELECT id FROM patients WHERE auth_id = auth.uid())
        )
    );

-- Health Recommendations Policies
CREATE POLICY "Patients can view their own recommendations"
    ON health_recommendations FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patients WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can manage recommendations for their patients"
    ON health_recommendations FOR ALL
    USING (
        created_by IN (
            SELECT id FROM doctors WHERE auth_id = auth.uid()
        )
        OR
        patient_id IN (
            SELECT patient_id FROM patient_doctor_relationships 
            WHERE doctor_id IN (SELECT id FROM doctors WHERE auth_id = auth.uid())
            AND status = 'active'
        )
    );

-- Doctor Locations Policies (public read, doctor write)
CREATE POLICY "Anyone can view doctor locations"
    ON doctor_locations FOR SELECT
    USING (TRUE);

CREATE POLICY "Doctors can manage their own locations"
    ON doctor_locations FOR ALL
    USING (
        doctor_id IN (
            SELECT id FROM doctors WHERE auth_id = auth.uid()
        )
    );

-- Patient-Doctor Relationships Policies
CREATE POLICY "Patients can view their doctor relationships"
    ON patient_doctor_relationships FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patients WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can view their patient relationships"
    ON patient_doctor_relationships FOR SELECT
    USING (
        doctor_id IN (
            SELECT id FROM doctors WHERE auth_id = auth.uid()
        )
    );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to calculate distance between two coordinates (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL,
    lon1 DECIMAL,
    lat2 DECIMAL,
    lon2 DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
    RETURN (
        6371 * acos(
            cos(radians(lat1)) * 
            cos(radians(lat2)) * 
            cos(radians(lon2) - radians(lon1)) + 
            sin(radians(lat1)) * 
            sin(radians(lat2))
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist (for idempotency)
DROP TRIGGER IF EXISTS update_medical_records_updated_at ON medical_records;
DROP TRIGGER IF EXISTS update_health_logs_updated_at ON health_logs;
DROP TRIGGER IF EXISTS update_doctor_verifications_updated_at ON doctor_verifications;
DROP TRIGGER IF EXISTS update_health_recommendations_updated_at ON health_recommendations;
DROP TRIGGER IF EXISTS update_doctor_locations_updated_at ON doctor_locations;
DROP TRIGGER IF EXISTS update_patient_doctor_relationships_updated_at ON patient_doctor_relationships;

-- Triggers for updated_at
CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON medical_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_logs_updated_at
    BEFORE UPDATE ON health_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_verifications_updated_at
    BEFORE UPDATE ON doctor_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_recommendations_updated_at
    BEFORE UPDATE ON health_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_locations_updated_at
    BEFORE UPDATE ON doctor_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_doctor_relationships_updated_at
    BEFORE UPDATE ON patient_doctor_relationships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS for documentation
-- ============================================
COMMENT ON TABLE medical_records IS 'Patient medical records including reports, lab results, scans, etc.';
COMMENT ON TABLE health_metrics IS 'Patient health metrics like BP, blood sugar, weight, etc.';
COMMENT ON TABLE health_logs IS 'Patient health logs for symptoms, medications, habits, etc.';
COMMENT ON TABLE doctor_verifications IS 'Doctor verifications and comments on patient medical records';
COMMENT ON TABLE health_recommendations IS 'Health recommendations for patients (diet, exercise, lifestyle, etc.)';
COMMENT ON TABLE doctor_locations IS 'Doctor and hospital locations for finding nearby healthcare providers';
COMMENT ON TABLE patient_doctor_relationships IS 'Relationships between patients and doctors';

