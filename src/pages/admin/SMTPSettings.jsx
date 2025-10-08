import React, { useState, useEffect } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import FormInput from "../../components/common/FormInput";
import Alert from "../../components/common/Alert";
import LoadingButton from "../../components/common/LoadingButton";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import adminConfig from "../../config/adminConfig";
import config from "../../config/api.js";

export default function SMTPSettings() {
  const [settings, setSettings] = useState({
    host: "",
    port: 587,
    username: "",
    password: "",
    from_email: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.smtpSettings), {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSettings(data.settings || {});
      } else {
        console.error("Error fetching SMTP settings:", data.error);
        setError("Failed to load SMTP settings: " + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error("Error fetching SMTP settings:", err);
      setError("Failed to load SMTP settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.smtpSettings), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("SMTP settings saved successfully!");
      } else {
        console.error("Error saving SMTP settings:", data.error);
        setError("Failed to save SMTP settings: " + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error("Error saving SMTP settings:", err);
      setError("Failed to save SMTP settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <LoadingSpinner size="md" message="Loading SMTP settings..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">📧 SMTP Settings</h2>
        </div>

        <Alert type="error" message={error} />
        <Alert type="success" message={success} />

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <FormInput
              label="SMTP Host"
              type="text"
              value={settings.host}
              onChange={(e) => setSettings({ ...settings, host: e.target.value })}
              placeholder={`e.g., ${adminConfig.getSMTPExamples().host}`}
              required
            />

            <FormInput
              label="SMTP Port"
              type="number"
              value={settings.port}
              onChange={(e) => setSettings({ ...settings, port: e.target.value })}
              placeholder="e.g., 587"
              required
            />

            <FormInput
              label="Username"
              type="text"
              value={settings.username}
              onChange={(e) => setSettings({ ...settings, username: e.target.value })}
              placeholder="SMTP username"
              required
            />

            <FormInput
              label="Password"
              type="password"
              value={settings.password}
              onChange={(e) => setSettings({ ...settings, password: e.target.value })}
              placeholder="SMTP password"
              required
            />

            <FormInput
              label="From Email"
              type="email"
              value={settings.from_email}
              onChange={(e) => setSettings({ ...settings, from_email: e.target.value })}
              placeholder={`e.g., ${adminConfig.getSMTPExamples().fromEmail}`}
              required
            />

            <div className="flex justify-end">
              <LoadingButton
                type="submit"
                loading={saving}
                loadingText="Saving..."
                variant="primary"
                className="px-4 py-2"
              >
                Save Settings
              </LoadingButton>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-6">
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Send Test Email</h3>
            <FormInput
              label="Recipient Email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <div className="flex justify-end">
              <LoadingButton
                type="button"
                disabled={!testEmail}
                loading={testing}
                loadingText="Sending..."
                variant="success"
                className="px-4 py-2"
                onClick={async () => {
                  setError("");
                  setSuccess("");
                  setTesting(true);
                  try {
                    const res = await fetch(config.getUrl(config.endpoints.admin.smtpTest), {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ email: testEmail })
                    });
                    const ct = res.headers.get('content-type') || '';
                    const txt = await res.text();
                    const data = ct.includes('application/json') ? (() => { try { return JSON.parse(txt); } catch { return {}; } })() : {};
                    if (res.ok && data.success) {
                      setSuccess(data.message || 'Test email sent.');
                    } else {
                      setError(data.error || txt || 'Failed to send test email');
                    }
                  } catch (e) {
                    setError(e.message || 'Network error');
                  } finally {
                    setTesting(false);
                  }
                }}
              >
                Send Test Email
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
} 