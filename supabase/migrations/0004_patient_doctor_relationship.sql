-- 0004_patient_doctor_relationship.sql

-- Create junction table for Many-to-Many relationship
CREATE TABLE IF NOT EXISTS patient_doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(patient_id, doctor_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_patient_doctors_patient_id ON patient_doctors(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_doctors_doctor_id ON patient_doctors(doctor_id);

-- Add RLS policies (Optional but good practice)
ALTER TABLE patient_doctors ENABLE ROW LEVEL SECURITY;

-- Policy: Patients can see their own relationships
CREATE POLICY "Patients can view their own doctor connections"
    ON patient_doctors FOR SELECT
    USING (
        auth.uid() IN (
            SELECT auth_id FROM patients WHERE id = patient_doctors.patient_id
        )
    );

-- Policy: Patients can insert their own relationships
CREATE POLICY "Patients can add doctors"
    ON patient_doctors FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT auth_id FROM patients WHERE id = patient_doctors.patient_id
        )
    );

-- Policy: Patients can delete their own relationships
CREATE POLICY "Patients can remove doctors"
    ON patient_doctors FOR DELETE
    USING (
        auth.uid() IN (
            SELECT auth_id FROM patients WHERE id = patient_doctors.patient_id
        )
    );

-- Policy: Doctors can view relationships where they are the doctor
CREATE POLICY "Doctors can view their patient connections"
    ON patient_doctors FOR SELECT
    USING (
        auth.uid() IN (
            SELECT auth_id FROM doctors WHERE id = patient_doctors.doctor_id
        )
    );
