import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import PageWrapper from "../components/common/PageWrapper";
import DarkModeToggle from "../components/common/DarkModeToggle";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import config from "../config/api.js";
import BannerAd from "../components/ads/BannerAd";
import PopupAd from "../components/ads/PopupAd";

export default function ScamBoard() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(config.getUrl(config.endpoints.scamAlerts.list));
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/signup-login");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(config.getUrl(config.endpoints.scamAlerts.create), {
        method: "POST",
        headers: config.getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          user_id: user.id
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setForm({ title: "", description: "" });
        fetchAlerts(); // Refresh the list
      } else {
        alert(data.error || "Failed to submit alert");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <div className="flex justify-center pt-4">
        <DarkModeToggle />
      </div>
      <Navbar />
      <BannerAd position="top" />
      <PopupAd />
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">⚠️ Scam Alert Board</h1>
          
          {/* Submit Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Report a Scam</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Scam Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <textarea
                placeholder="Describe the scam details..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={4}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Alert"}
              </button>
            </form>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                  {alert.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{alert.description}</p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Reported by: {alert.user_email} • {new Date(alert.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}