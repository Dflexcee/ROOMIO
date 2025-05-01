import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import PageWrapper from "../../components/common/PageWrapper";

export default function SMTPSettings() {
  const [form, setForm] = useState({
    host: "",
    port: "",
    username: "",
    password: "",
    sender_name: "",
    sender_email: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase.from("smtp_settings").select("*").limit(1).single();
    if (!error && data) setForm(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("smtp_settings")
      .upsert([form], { onConflict: "id" });
    if (error) alert("Failed to save settings.");
    else alert("SMTP settings saved successfully.");
    setLoading(false);
  };

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4">SMTP Settings</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-2xl">
        <input
          type="text"
          placeholder="SMTP Host (e.g., smtp.gmail.com)"
          value={form.host}
          onChange={(e) => setForm({ ...form, host: e.target.value })}
          className="border p-2 mb-3 w-full"
          required
        />
        <input
          type="number"
          placeholder="Port (e.g., 465)"
          value={form.port}
          onChange={(e) => setForm({ ...form, port: e.target.value })}
          className="border p-2 mb-3 w-full"
          required
        />
        <input
          type="text"
          placeholder="SMTP Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="border p-2 mb-3 w-full"
          required
        />
        <input
          type="password"
          placeholder="SMTP Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border p-2 mb-3 w-full"
          required
        />
        <input
          type="text"
          placeholder="Sender Name"
          value={form.sender_name}
          onChange={(e) => setForm({ ...form, sender_name: e.target.value })}
          className="border p-2 mb-3 w-full"
          required
        />
        <input
          type="email"
          placeholder="Sender Email"
          value={form.sender_email}
          onChange={(e) => setForm({ ...form, sender_email: e.target.value })}
          className="border p-2 mb-4 w-full"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </PageWrapper>
  );
} 