import config from "../config/api";

export const isFeatureLockedForUser = async (userId, feature) => {
  try {
    // 1. Check if feature is locked
    const response = await fetch(config.getUrl(config.endpoints.payments.settings), {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    const featureInfo = data.settings?.find(s => s.feature_name === feature);
    
    if (!featureInfo || !featureInfo.is_locked) {
      return false; // No lock = feature is free
    }

    // 2. Check if user has paid + access still valid
    const accessResponse = await fetch(config.getUrl(config.endpoints.payments.checkAccess), {
      method: 'POST',
      headers: config.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ userId, feature })
    });
    
    if (!accessResponse.ok) return true;
    
    const accessData = await accessResponse.json();
    return !accessData.hasAccess; // true = access denied = show paywall
  } catch (error) {
    console.error('Error checking feature access:', error);
    return true; // Default to locked on error
  }
}; 