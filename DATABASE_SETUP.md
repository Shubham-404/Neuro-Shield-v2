# Database Setup Guide

## Overview

This guide explains how to set up the NeuroShield database schema with automatic user profile creation using Supabase triggers.

## What Was Created

### 1. Database Schema (`supabase/migrations/0001_init_schema.sql`)

Complete SQL migration file that creates:
- **doctors** table - Stores doctor profiles
- **patients** table - Stores patient profiles  
- **admins** table - Stores admin profiles
- **predictions** table - Stores AI prediction results
- **medication_suggestions** table - Stores medication recommendations

### 2. Automatic Trigger System

A PostgreSQL trigger function (`handle_new_user()`) that:
- Automatically fires when a new user signs up in `auth.users`
- Reads the `role` from `raw_user_meta_data`
- Inserts the user into the appropriate table:
  - `role = 'doctor'` → `doctors` table
  - `role = 'patient'` → `patients` table
  - `role = 'admin'` → `admins` table

### 3. Fixed Select Component

Updated `client-react/src/components/ui/select.jsx` to work properly with React state management.

## Setup Instructions

### Step 1: Run the Migration

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/0001_init_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)

### Step 2: Verify Tables

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - `doctors`
   - `patients`
   - `admins`
   - `predictions`
   - `medication_suggestions`

### Step 3: Test the Trigger

1. Sign up a new user via your app with `role: 'doctor'`
2. Check the `doctors` table - you should see a new record
3. The `auth_id` should match the user's ID from `auth.users`

## How It Works

### Signup Flow

```
User Signs Up
    ↓
Backend receives: { name, email, password, role, ...extra }
    ↓
Backend calls: supabase.auth.signUp({ email, password, data: { name, role, ...extra } })
    ↓
Supabase creates user in auth.users
    ↓
Trigger fires: handle_new_user()
    ↓
Trigger reads: raw_user_meta_data.role
    ↓
Trigger inserts into appropriate table:
    - If role = 'doctor' → doctors table
    - If role = 'patient' → patients table
    - If role = 'admin' → admins table
```

### What Gets Stored

**For Doctors:**
- `auth_id` (links to auth.users.id)
- `full_name` (from `name` in metadata)
- `email`
- `specialization` (from metadata)
- `license_number` (from metadata)
- `hospital` (from metadata)

**For Patients:**
- `auth_id` (links to auth.users.id)
- `name` (from `name` in metadata)
- `email`
- `medical_history` (from metadata)
- `blood_group` (from metadata)

**For Admins:**
- `auth_id` (links to auth.users.id)
- `name` (from `name` in metadata)
- `email`

## Code Changes Made

### ✅ Backend (No changes needed!)

The backend code in `controllers/user.controller.js` already:
- Passes `role` and extra fields to `raw_user_meta_data`
- The trigger automatically handles profile creation

### ✅ Frontend Changes

1. **Fixed Select Component** (`client-react/src/components/ui/select.jsx`)
   - Now properly handles state and click events
   - Works with React hooks

2. **Updated RegisterPage** (`client-react/src/pages/auth/RegisterPage.jsx`)
   - Ensures role is properly passed to backend
   - Fixed Select component usage

## Troubleshooting

### Trigger Not Firing?

1. **Check if trigger exists:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. **Check if function exists:**
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```

3. **Check user metadata:**
   ```sql
   SELECT id, email, raw_user_meta_data->>'role' as role
   FROM auth.users
   ORDER BY created_at DESC
   LIMIT 5;
   ```

4. **Check Supabase Logs:**
   - Go to **Logs** → **Postgres Logs** in Supabase Dashboard
   - Look for any errors related to the trigger

### Profile Not Created?

1. Verify the user's `raw_user_meta_data` contains a `role` field
2. Check that the role is one of: `'doctor'`, `'patient'`, `'admin'`
3. Verify the trigger is attached to `auth.users` table

### Manual Profile Creation (if needed)

If a user was created before the trigger was set up, you can manually create their profile:

```sql
-- For a doctor
INSERT INTO doctors (auth_id, full_name, email, specialization)
VALUES (
  'user-uuid-here',
  'Dr. John Doe',
  'john@example.com',
  'Neurology'
);

-- For a patient
INSERT INTO patients (auth_id, name, email)
VALUES (
  'user-uuid-here',
  'Jane Doe',
  'jane@example.com'
);
```

## Testing Queries

### View All Users and Their Profiles

```sql
SELECT 
    u.id as auth_id,
    u.email,
    u.raw_user_meta_data->>'role' as role,
    u.created_at as user_created_at,
    CASE 
        WHEN u.raw_user_meta_data->>'role' = 'doctor' THEN d.id::text
        WHEN u.raw_user_meta_data->>'role' = 'patient' THEN p.id::text
        WHEN u.raw_user_meta_data->>'role' = 'admin' THEN a.id::text
    END as profile_id,
    CASE 
        WHEN u.raw_user_meta_data->>'role' = 'doctor' THEN d.full_name
        WHEN u.raw_user_meta_data->>'role' = 'patient' THEN p.name
        WHEN u.raw_user_meta_data->>'role' = 'admin' THEN a.name
    END as profile_name
FROM auth.users u
LEFT JOIN doctors d ON d.auth_id = u.id
LEFT JOIN patients p ON p.auth_id = u.id
LEFT JOIN admins a ON a.auth_id = u.id
ORDER BY u.created_at DESC;
```

### Check Recent Signups

```sql
SELECT 
    u.email,
    u.raw_user_meta_data->>'role' as role,
    CASE 
        WHEN d.id IS NOT NULL THEN 'Doctor profile exists'
        WHEN p.id IS NOT NULL THEN 'Patient profile exists'
        WHEN a.id IS NOT NULL THEN 'Admin profile exists'
        ELSE 'No profile found!'
    END as status
FROM auth.users u
LEFT JOIN doctors d ON d.auth_id = u.id
LEFT JOIN patients p ON p.auth_id = u.id
LEFT JOIN admins a ON a.auth_id = u.id
WHERE u.created_at > NOW() - INTERVAL '1 day'
ORDER BY u.created_at DESC;
```

## Next Steps

1. ✅ Run the migration in Supabase
2. ✅ Test signup with different roles
3. ✅ Verify profiles are created automatically
4. ✅ Test login to ensure profiles are fetched correctly

## Support

If you encounter any issues:
1. Check Supabase logs for errors
2. Verify the trigger is properly installed
3. Ensure user metadata contains the `role` field
4. Check that the role value is valid (`'doctor'`, `'patient'`, or `'admin'`)

