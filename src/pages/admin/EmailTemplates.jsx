import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import PageWrapper from "../../components/common/PageWrapper";
import EditTemplateModal from "../../components/admin/EditTemplateModal";

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
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError("Failed to load templates: " + error.message);
    else setTemplates(data);
  };

  const sendTestEmail = async (template) => {
    if (!testEmail) {
      alert("Please enter a test email address");
      return;
    }

    setSendingTest(true);
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmail,
          templateKey: template.key,
          variables: {
            user_name: "Test User",
            room_link: "https://example.com/room/123",
            listing_title: "Test Listing",
            interested_user_name: "Interested User",
            interested_user_email: "interested@example.com",
            interested_user_phone: "+1234567890"
          }
        }
      });

      if (error) throw error;
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