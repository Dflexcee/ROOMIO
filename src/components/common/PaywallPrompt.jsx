import { useEffect, useState } from "react";
import config from "../../config/api";

export default function PaywallPrompt({ userId, feature, onClose }) {
  const [featureInfo, setFeatureInfo] = useState(null);

  useEffect(() => {
    fetchFeatureInfo();
    // eslint-disable-next-line
  }, [feature]);

  const fetchFeatureInfo = async () => {
    try {
      const response = await fetch(config.getUrl(config.endpoints.payments.settings), {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const featureData = data.settings?.find(s => s.feature_name === feature);
        if (featureData) setFeatureInfo(featureData);
      }
    } catch (error) {
      console.error('Error fetching feature info:', error);
    }
  };

  const handlePayNow = () => {
    // Placeholder for payment integration
    alert("Redirecting to payment...");
  };

  if (!featureInfo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-lg text-center">
        <h2 className="text-xl font-bold mb-3">🔒 Premium Feature</h2>
        <p className="text-sm text-gray-700 mb-4">
          The feature <strong>{featureInfo.feature_name}</strong> is locked.
        </p>
        <p className="text-lg font-semibold text-blue-700 mb-4">
          Unlock it for ₦{featureInfo.unlock_price} / {featureInfo.duration_value} {featureInfo.duration_type}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handlePayNow}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Pay Now
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 