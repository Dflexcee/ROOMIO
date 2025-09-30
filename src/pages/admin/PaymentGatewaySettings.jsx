import React, { useEffect, useState } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import config from "../../config/api.js";

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
    
    // Mock payment gateway settings
    const mockSettings = {
      provider: "Paystack",
      public_key: "pk_test_1234567890abcdef",
      secret_key: "sk_test_1234567890abcdef",
      webhook_secret: "whsec_1234567890abcdef"
    };
    setForm(mockSettings);
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
    
    // Mock save functionality
    setSuccess("Settings saved successfully!");
    setSaving(false);
  };

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Payment Gateway Settings</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
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
    </PageWrapper>
  );
} 