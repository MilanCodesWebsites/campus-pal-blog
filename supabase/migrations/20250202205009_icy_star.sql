/*
  # Disable Email Confirmation Requirement

  1. Changes
    - Set default value for email_confirmed_at to current timestamp for new users
    - Update existing users to have confirmed email status
  
  Note: This ensures all users (new and existing) have confirmed email status
*/

-- Set email_confirmed_at default for new users
ALTER TABLE auth.users
ALTER COLUMN email_confirmed_at
SET DEFAULT NOW();

-- Update existing users to have confirmed emails
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;