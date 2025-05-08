import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import PageWrapper from "../../components/common/PageWrapper";

const FEATURE_OPTIONS = [
  { key: "VIEW_ROOMMATE_PROFILE", label: "View roommate profile" },
  { key: "CONTACT_LISTER", label: "Contact lister (chat)" },
  { key: "POST_AS_AGENT", label: "Post as agent/landlord" },
  { key: "POST_MULTIPLE_ROOMS", label: "Post multiple rooms" }
];

export default function Payments() {
  const [features, setFeatures] = useState([]);
  const [form, setForm] = useState({
    feature_name: "",
    unlock_price: 0,
    is_locked: true,
    duration_type: "days",
    duration_value: 7,
  });
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line
  }, [refresh]);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from("payment_settings").select("*").order("feature_name");
      if (error) throw error;
      setFeatures(data || []);
    } catch (err) {
      setError("Failed to fetch premium features. Please try again.");
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (!form.feature_name.trim()) {
        setError("Feature is required.");
        return;
      }
      const { error } = await supabase.from("payment_settings").insert([form]);
      if (error) throw error;
      setForm({
        feature_name: "",
        unlock_price: 0,
        is_locked: true,
        duration_type: "days",
        duration_value: 7,
      });
      setRefresh(!refresh);
    } catch (err) {
      setError("Failed to add feature. Please try again.");
    }
  };

  const toggleLock = async (id, current) => {
    setError(null);
    try {
      const { error } = await supabase.from("payment_settings").update({ is_locked: !current }).eq("id", id);
      if (error) throw error;
      setRefresh(!refresh);
    } catch (err) {
      setError("Failed to update lock status.");
    }
  };

  const updateField = async (id, field, value) => {
    setError(null);
    try {
      const { error } = await supabase.from("payment_settings").update({ [field]: value }).eq("id", id);
      if (error) throw error;
      setRefresh(!refresh);
    } catch (err) {
      setError("Failed to update feature.");
    }
  };

  // Prevent adding features already in payment_settings
  const usedKeys = features.map(f => f.feature_name);
  const availableOptions = FEATURE_OPTIONS.filter(opt => !usedKeys.includes(opt.key));

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4">💸 Premium Feature Settings</h2>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow max-w-xl mb-6">
        <h3 className="font-semibold mb-2">➕ Add New Premium Feature</h3>
        <select
          value={form.feature_name}
          onChange={e => setForm({ ...form, feature_name: e.target.value })}
          className="border p-2 w-full mb-2"
          required
        >
          <option value="">Select a feature...</option>
          {availableOptions.map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Unlock Price (₦)"
          value={form.unlock_price}
          onChange={(e) => setForm({ ...form, unlock_price: parseInt(e.target.value) })}
          className="border p-2 w-full mb-2"
          required
        />
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            placeholder="Duration"
            value={form.duration_value}
            onChange={(e) => setForm({ ...form, duration_value: parseInt(e.target.value) })}
            className="border p-2 w-1/2"
          />
          <select
            value={form.duration_type}
            onChange={(e) => setForm({ ...form, duration_type: e.target.value })}
            className="border p-2 w-1/2"
          >
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="years">Years</option>
          </select>
        </div>
        <label className="block mb-2">
          <input
            type="checkbox"
            checked={form.is_locked}
            onChange={(e) => setForm({ ...form, is_locked: e.target.checked })}
            className="mr-2"
          />
          Lock this feature?
        </label>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Save Feature
        </button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>

      <div className="bg-white rounded shadow p-4">
        <h3 className="text-lg font-semibold mb-4">⚙️ All Premium Features</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading features...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : features.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No premium features found. Add one above!</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Feature</th>
                <th className="p-2 text-left">Price (₦)</th>
                <th className="p-2 text-left">Duration</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr key={f.id} className="border-b">
                  <td className="p-2">{FEATURE_OPTIONS.find(opt => opt.key === f.feature_name)?.label || f.feature_name}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={f.unlock_price}
                      onChange={(e) => updateField(f.id, "unlock_price", parseInt(e.target.value))}
                      className="border px-2 w-20"
                    />
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={f.duration_value}
                        onChange={(e) => updateField(f.id, "duration_value", parseInt(e.target.value))}
                        className="border px-2 w-16"
                      />
                      <select
                        value={f.duration_type}
                        onChange={(e) => updateField(f.id, "duration_type", e.target.value)}
                        className="border px-2"
                      >
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-2">{f.is_locked ? "🔒 Locked" : "🔓 Free"}</td>
                  <td className="p-2">
                    <button
                      onClick={() => toggleLock(f.id, f.is_locked)}
                      className={`px-3 py-1 rounded text-white text-xs ${
                        f.is_locked ? "bg-yellow-600" : "bg-gray-600"
                      }`}
                    >
                      {f.is_locked ? "Unlock" : "Lock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageWrapper>
  );
} 