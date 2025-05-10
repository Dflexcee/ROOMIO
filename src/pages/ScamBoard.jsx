import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import PageWrapper from "../components/common/PageWrapper";
import DarkModeToggle from "../components/common/DarkModeToggle";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";

export default function ScamBoard() {
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchScams();
    supabase.auth.getUser().then(async ({ data }) => {
      const { user } = data;
      if (user) setUserId(user.id);
    });
    // eslint-disable-next-line
  }, []);

  const fetchScams = async () => {
    const { data } = await supabase
      .from("scam_alerts")
      .select("*, users(full_name)")
      .order("created_at", { ascending: false })
      .limit(10);
    setAlerts(data || []);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !userId) return;
    setLoading(true);
    const { error } = await supabase.from("scam_alerts").insert([
      { ...form, reported_by: userId },
    ]);
    if (!error) {
      fetchScams();
      setForm({ title: "", description: "" });
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="absolute top-6 right-8"><DarkModeToggle /></div>
        <div className="absolute top-6 left-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow font-semibold transition"
          >
            ← Go Back to Dashboard
          </button>
        </div>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors px-4">
          <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-yellow-200 dark:border-gray-800 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-red-700 dark:text-yellow-400 drop-shadow-sm transition-all duration-300 text-center">⚠️ Scam Alert Board</h2>

            <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded mb-6 text-yellow-900 dark:text-yellow-100">
              <p className="text-sm">
                💡 Help protect others! If you encounter any housing scam or suspicious agent, report it here.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-8 border border-yellow-200 dark:border-yellow-800">
              <h3 className="font-semibold mb-2 text-sm text-red-700 dark:text-yellow-400">📝 Submit New Scam Alert</h3>
              <input
                type="text"
                placeholder="Title"
                className="border p-2 w-full mb-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <textarea
                rows={3}
                placeholder="Describe the scam (location, agent name, what happened)"
                className="border p-2 w-full mb-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-red-600 dark:bg-yellow-700 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-yellow-800 w-full font-semibold"
              >
                {loading ? "Posting..." : "Submit Alert"}
              </button>
            </div>

            <h3 className="text-lg font-bold mb-3 text-red-700 dark:text-yellow-400">🚨 Recent Alerts</h3>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-white dark:bg-gray-800 border-l-4 border-red-500 dark:border-yellow-500 p-4 shadow rounded">
                  <h4 className="font-semibold text-red-700 dark:text-yellow-400">{alert.title}</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">{alert.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Reported by: {alert.users?.full_name || "Anonymous"} • {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
} 