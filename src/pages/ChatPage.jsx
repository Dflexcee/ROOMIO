import { useState } from "react";
import { isFeatureLockedForUser } from "../utils/checkFeatureAccess";
import PaywallPrompt from "../components/common/PaywallPrompt";

export default function ChatPage({ user }) {
  const [showPaywall, setShowPaywall] = useState(false);

  const handleChatAccess = async () => {
    const locked = await isFeatureLockedForUser(user.id, "CONTACT_LISTER");
    if (locked) {
      setShowPaywall(true);
      return;
    }
    // Open chat view here
  };

  return (
    <div>
      <button onClick={handleChatAccess}>Open Chat</button>
      {showPaywall && (
        <PaywallPrompt
          userId={user.id}
          feature="CONTACT_LISTER"
          onClose={() => setShowPaywall(false)}
        />
      )}
    </div>
  );
} 