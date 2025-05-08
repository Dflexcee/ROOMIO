-- Create payment_settings table
CREATE TABLE IF NOT EXISTS payment_settings (
    id BIGSERIAL PRIMARY KEY,
    feature_name TEXT NOT NULL UNIQUE,
    unlock_price INTEGER NOT NULL DEFAULT 0,
    is_locked BOOLEAN NOT NULL DEFAULT true,
    duration_type TEXT NOT NULL DEFAULT 'days',
    duration_value INTEGER NOT NULL DEFAULT 7,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_payments table
CREATE TABLE IF NOT EXISTS user_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL REFERENCES payment_settings(feature_name) ON DELETE RESTRICT,
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disabled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_settings_feature_name ON payment_settings(feature_name);
CREATE INDEX IF NOT EXISTS idx_user_payments_user_id ON user_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payments_feature_name ON user_payments(feature_name);
CREATE INDEX IF NOT EXISTS idx_user_payments_status ON user_payments(status);

-- Create a view for payment details with user information
CREATE OR REPLACE VIEW payment_details AS
SELECT 
    up.id as payment_id,
    up.user_id,
    u.email,
    u.phone,
    u.full_name,
    up.feature_name,
    ps.unlock_price,
    up.paid_at,
    up.expires_at,
    up.status,
    ps.duration_type,
    ps.duration_value,
    CASE 
        WHEN up.status = 'active' AND up.expires_at > NOW() THEN true
        ELSE false
    END as is_active
FROM user_payments up
JOIN auth.users u ON up.user_id = u.id
JOIN payment_settings ps ON up.feature_name = ps.feature_name;

-- Add RLS (Row Level Security) policies for payment_settings
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins and managers to manage payment settings
CREATE POLICY "Allow admins and managers to manage payment settings"
    ON payment_settings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'manager')
        )
    );

-- Create policy to allow all authenticated users to view payment settings
CREATE POLICY "Allow authenticated users to view payment settings"
    ON payment_settings
    FOR SELECT
    TO authenticated
    USING (true);

-- Add RLS policies for user_payments
ALTER TABLE user_payments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own payments
CREATE POLICY "Users can view their own payments"
    ON user_payments
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Create policy to allow admins and managers to view all payments
CREATE POLICY "Admins and managers can view all payments"
    ON user_payments
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'manager')
        )
    );

-- Create policy to allow admins and managers to manage all payments
CREATE POLICY "Admins and managers can manage all payments"
    ON user_payments
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'manager')
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_payment_settings_updated_at
    BEFORE UPDATE ON payment_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_payments_updated_at
    BEFORE UPDATE ON user_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to check if a user has access to a feature
CREATE OR REPLACE FUNCTION check_feature_access(user_id UUID, feature_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_payments
        WHERE user_payments.user_id = check_feature_access.user_id
        AND user_payments.feature_name = check_feature_access.feature_name
        AND user_payments.status = 'active'
        AND user_payments.expires_at > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's active features
CREATE OR REPLACE FUNCTION get_user_active_features(user_id UUID)
RETURNS TABLE (
    feature_name TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.feature_name,
        up.paid_at,
        up.expires_at,
        EXTRACT(DAY FROM (up.expires_at - NOW()))::INTEGER as days_remaining
    FROM user_payments up
    WHERE up.user_id = get_user_active_features.user_id
    AND up.status = 'active'
    AND up.expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
