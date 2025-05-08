-- Create or replace the grant_user_access function
CREATE OR REPLACE FUNCTION grant_user_access(
  user_id UUID,
  feature_name TEXT,
  duration INTERVAL
)
RETURNS VOID AS $$
BEGIN
  -- Check if the feature exists
  IF NOT EXISTS (SELECT 1 FROM payment_settings WHERE payment_settings.feature_name = grant_user_access.feature_name) THEN
    RAISE EXCEPTION 'Feature % does not exist', feature_name;
  END IF;

  -- Insert or update the user's access
  INSERT INTO user_payments (
    user_id,
    feature_name,
    paid_at,
    expires_at,
    status
  )
  VALUES (
    user_id,
    feature_name,
    NOW(),
    NOW() + duration,
    'active'
  )
  ON CONFLICT (user_id, feature_name) 
  DO UPDATE SET
    paid_at = NOW(),
    expires_at = NOW() + duration,
    status = 'active',
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 