import { supabase } from "../supabase";

export const isFeatureLocked = async (featureName, userId) => {
  const { data: lock } = await supabase
    .from("payment_settings")
    .select("*")
    .eq("feature_name", featureName)
    .single();

  if (!lock?.is_locked) return false;

  const { data: userAccess } = await supabase
    .from("user_payments")
    .select("*")
    .eq("feature_name", featureName)
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  return !userAccess; // true means show paywall
}; 