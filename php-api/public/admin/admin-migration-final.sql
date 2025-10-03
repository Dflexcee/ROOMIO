-- Adds per-type verification flags to users table if missing
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS verified_for_rooms TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verified_for_listings TINYINT(1) NOT NULL DEFAULT 0;


