import { supabase } from "../supabase";

/**
 * Grants a user access to a premium feature for the correct duration, based on payment_settings.
 * @param {string} userId - The user's UUID
 * @param {string} featureName - The feature key (e.g. 'CONTACT_LISTER')
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const grantUserAccess = async (userId, featureName) => {
  // 1. Get feature config from payment_settings
  const { data: setting, error: settingError } = await supabase
    .from("payment_settings")
    .select("duration_value, duration_type")
    .eq("feature_name", featureName)
    .single();

  if (settingError || !setting) {
    return { success: false, error: settingError || "Feature not found" };
  }

  const value = Number(setting.duration_value);
  const type = setting.duration_type;

  // Calculate interval in days
  const intervalDays = {
    days: value,
    weeks: value * 7,
    months: value * 30,
    years: value * 365,
  }[type] || 7;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000).toISOString();

  // 2. Insert into user_payments
  const { error } = await supabase.from("user_payments").insert([
    {
      user_id: userId,
      feature_name: featureName,
      paid_at: now.toISOString(),
      expires_at: expiresAt,
      status: "active",
    },
  ]);

  return { success: !error, error };
}; 