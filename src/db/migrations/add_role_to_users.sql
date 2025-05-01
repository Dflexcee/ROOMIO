-- Add role column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Create an index on the role column for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add constraint to limit role values
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('user', 'admin', 'manager')); 