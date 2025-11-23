-- Create patient_recommendations table
CREATE TABLE IF NOT EXISTS patient_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    recommendations JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_patient_recommendations_patient_id ON patient_recommendations(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_recommendations_created_at ON patient_recommendations(created_at DESC);

-- RLS (Optional but good practice)
ALTER TABLE patient_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own recommendations"
    ON patient_recommendations FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patients WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Patients can insert their own recommendations"
    ON patient_recommendations FOR INSERT
    WITH CHECK (
        patient_id IN (
            SELECT id FROM patients WHERE auth_id = auth.uid()
        )
    );
