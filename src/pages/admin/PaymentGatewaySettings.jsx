import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";

export default function PaymentGatewaySettings() {
  const [form, setForm] = useState({
    provider: "",
    public_key: "",
    secret_key: "",
    webhook_secret: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    const { data, error } = await supabase
      .from("payment_gateway_settings")
      .select("*")
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') setError("Failed to load settings");
    if (data) setForm(data);
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    // Upsert (insert or update)
    const { error } = await supabase
      .from("payment_gateway_settings")
      .upsert([form], { onConflict: "id" });
    if (error) setError("Failed to save settings");
    else setSuccess("Settings saved successfully!");
    setSaving(false);
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Payment Gateway Settings</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
          {error && <div className="bg-red-100 text-red-700 p-2 mb-2 rounded">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-2 mb-2 rounded">{success}</div>}
          <div>
            <label className="block font-medium mb-1">Provider</label>
            <input
              type="text"
              name="provider"
              value={form.provider}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              placeholder="e.g. Paystack, Stripe"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Public Key</label>
            <input
              type="text"
              name="public_key"
              value={form.public_key}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Secret Key</label>
            <input
              type="text"
              name="secret_key"
              value={form.secret_key}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Webhook Secret</label>
            <input
              type="text"
              name="webhook_secret"
              value={form.webhook_secret}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      )}
    </div>
  );
} 