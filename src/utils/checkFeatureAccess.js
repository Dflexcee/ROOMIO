import { supabase } from "../supabase";

export const isFeatureLockedForUser = async (userId, feature) => {
  // 1. Check if feature is locked
  const { data: featureInfo } = await supabase
    .from("payment_settings")
    .select("*")
    .eq("feature_name", feature)
    .single();

  if (!featureInfo || !featureInfo.is_locked) {
    return false; // No lock = feature is free
  }

  // 2. Check if user has paid + access still valid
  const { data: access } = await supabase
    .from("user_payments")
    .select("*")
    .eq("user_id", userId)
    .eq("feature_name", feature)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  return !access; // true = access denied = show paywall
}; 