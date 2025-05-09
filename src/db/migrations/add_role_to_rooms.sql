-- Add role column to rooms table if it doesn't exist
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS role text DEFAULT 'tenant';

-- Create an index on the role column for faster queries
CREATE INDEX IF NOT EXISTS idx_rooms_role ON rooms(role);

-- Add constraint to limit role values
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_role_check;
ALTER TABLE rooms ADD CONSTRAINT rooms_role_check 
  CHECK (role IN ('tenant', 'agent', 'landlord')); 