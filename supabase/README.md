# Supabase Database Setup

## Quick Start

1. **Go to your Supabase Dashboard**
   - Navigate to SQL Editor
   - Create a new query

2. **Run the Migration**
   - Copy the entire contents of `migrations/0001_init_schema.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute

3. **Verify Tables Created**
   - Go to Table Editor in Supabase
   - You should see: `doctors`, `patients`, `admins`, `predictions`, `medication_suggestions`

## How It Works

### Automatic Profile Creation

When a new user signs up via Supabase Auth:

1. User is created in `auth.users` table
2. The `handle_new_user()` trigger function automatically:
   - Reads the `role` from `raw_user_meta_data`
   - Inserts the user into the appropriate table:
     - `role = 'doctor'` → inserts into `doctors` table
     - `role = 'patient'` → inserts into `patients` table
     - `role = 'admin'` → inserts into `admins` table

### What Gets Stored

**For Doctors:**
- `full_name` (from `name` in metadata)
- `email`
- `specialization` (from metadata)
- `license_number` (from metadata)
- `hospital` (from metadata)

**For Patients:**
- `name` (from `name` in metadata)
- `email`
- `medical_history` (from metadata)
- `blood_group` (from metadata)

**For Admins:**
- `name` (from `name` in metadata)
- `email`

## Testing the Trigger

1. Sign up a new user via your app with `role: 'doctor'`
2. Check the `doctors` table - you should see a new record with `auth_id` matching the user's ID
3. The same works for `patients` and `admins`

## Troubleshooting

If the trigger doesn't fire:
- Check that the function `handle_new_user()` exists
- Check that the trigger `on_auth_user_created` is attached to `auth.users`
- Verify the user's `raw_user_meta_data` contains a `role` field
- Check Supabase logs for any errors

## Manual Testing Query

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check if function exists
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';

-- View recent users and their roles
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'role' as role,
    CASE 
        WHEN u.raw_user_meta_data->>'role' = 'doctor' THEN d.id
        WHEN u.raw_user_meta_data->>'role' = 'patient' THEN p.id
        WHEN u.raw_user_meta_data->>'role' = 'admin' THEN a.id
    END as profile_id
FROM auth.users u
LEFT JOIN doctors d ON d.auth_id = u.id
LEFT JOIN patients p ON p.auth_id = u.id
LEFT JOIN admins a ON a.auth_id = u.id
ORDER BY u.created_at DESC
LIMIT 10;
```

