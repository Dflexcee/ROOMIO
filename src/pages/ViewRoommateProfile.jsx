import { useState } from "react";
import { isFeatureLockedForUser } from "../utils/checkFeatureAccess";
import PaywallPrompt from "../components/common/PaywallPrompt";

export default function ViewRoommateProfile({ user }) {
  const [showPaywall, setShowPaywall] = useState(false);

  const handleViewMoreProfile = async () => {
    const locked = await isFeatureLockedForUser(user.id, "VIEW_ROOMMATE_PROFILE");
    if (locked) {
      setShowPaywall(true);
      return;
    }
    // Show extended profile details
  };

  return (
    <div>
      <button onClick={handleViewMoreProfile}>View More Profile</button>
      {showPaywall && (
        <PaywallPrompt
          userId={user.id}
          feature="VIEW_ROOMMATE_PROFILE"
          onClose={() => setShowPaywall(false)}
        />
      )}
    </div>
  );
} 