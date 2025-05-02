-- Drop existing table if it exists
DROP TABLE IF EXISTS rooms CASCADE;

-- Create rooms table
CREATE TABLE rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    rent DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
    user_id UUID REFERENCES users(id),
    images TEXT[],
    amenities JSONB DEFAULT '{}',
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for faster queries
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_user_id ON rooms(user_id);
CREATE INDEX idx_rooms_posted_at ON rooms(posted_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Policy for admins and managers to see all rooms
CREATE POLICY "Admins and managers can see all rooms" ON rooms
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'manager')
        )
    );

-- Policy for admins and managers to update room status
CREATE POLICY "Admins and managers can update room status" ON rooms
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'manager')
        )
    );

-- Add some sample data
INSERT INTO rooms (title, description, location, rent, status, user_id)
SELECT 
    'Sample Room ' || i,
    'This is a sample room description ' || i,
    'Sample Location ' || i,
    (random() * 1000 + 500)::decimal(10,2),
    'pending',
    (SELECT id FROM users LIMIT 1)
FROM generate_series(1, 5) i; 