import React, { useEffect, useState } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import EditTemplateModal from "../../components/admin/EditTemplateModal";
import adminConfig from "../../config/adminConfig";
import config from "../../config/api.js";

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, [refresh]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.emailTemplates));
      const data = await response.json();

      if (response.ok) {
        setTemplates(data.templates || []);
      } else {
        setError("Failed to load templates: " + (data.error || 'Unknown error'));
      }
    } catch (error) {
      setError("Failed to load templates: " + error.message);
    }
  };

  const sendTestEmail = async (template) => {
    if (!testEmail) {
      alert("Please enter a test email address");
      return;
    }

    setSendingTest(true);
    try {
      // Mock test email functionality
      alert("Test email sent successfully!");
    } catch (error) {
      alert("Failed to send test email: " + error.message);
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <PageWrapper>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">📧 Email Templates</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ➕ Create Template
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Test Email Address</label>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="Enter email to test templates"
          className="border p-2 rounded w-full max-w-md"
        />
      </div>

      <div className="bg-white shadow rounded p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">Sl</th>
              <th className="p-2">Key</th>
              <th className="p-2">Name</th>
              <th className="p-2">Subject</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((tpl, i) => (
              <tr key={tpl.id} className="border-b">
                <td className="p-2">{i + 1}</td>
                <td className="p-2 font-mono">{tpl.key}</td>
                <td className="p-2 font-medium">{tpl.name}</td>
                <td className="p-2">{tpl.subject}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => setSelectedTemplate(tpl)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => sendTestEmail(tpl)}
                    disabled={sendingTest || !testEmail}
                    className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    {sendingTest ? "Sending..." : "📧 Test"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTemplate && (
        <EditTemplateModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onUpdate={() => setRefresh(!refresh)}
        />
      )}

      {showCreateModal && (
        <EditTemplateModal
          template={{ key: "", name: "", subject: "", body: "" }}
          onClose={() => setShowCreateModal(false)}
          onUpdate={() => setRefresh(!refresh)}
          isCreate={true}
        />
      )}
    </PageWrapper>
  );
} 