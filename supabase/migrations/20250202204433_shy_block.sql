/*
  # Disable Email Confirmation

  1. Changes
    - Disable email confirmation requirement for authentication
    - Allow users to sign in immediately after registration
*/

-- Disable email confirmation requirement
ALTER TABLE auth.users
ALTER COLUMN email_confirmed_at
SET DEFAULT NOW();