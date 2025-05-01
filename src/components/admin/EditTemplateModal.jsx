import React, { useState } from "react";
import { supabase } from "../../supabase";

const TEMPLATE_VARIABLES = {
  REGISTRATION_SUCCESS: {
    description: "Registration Success Email",
    variables: {
      user_name: "Name of the registered user",
      verification_link: "Link to verify email address"
    }
  },
  LISTING_INTEREST: {
    description: "Notification to landlord/agent when someone shows interest in their listing",
    variables: {
      listing_title: "Title of the listing",
      listing_link: "Link to the listing",
      interested_user_name: "Name of the interested user",
      interested_user_email: "Email of the interested user",
      interested_user_phone: "Phone number of the interested user",
      message: "Optional message from the interested user"
    }
  }
};

export default function EditTemplateModal({ template, onClose, onUpdate, isCreate = false }) {
  const [form, setForm] = useState({
    key: template.key || "",
    name: template.name || "",
    subject: template.subject || "",
    body: template.body || ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      if (isCreate) {
        const { error } = await supabase
          .from("email_templates")
          .insert([form]);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("email_templates")
          .update(form)
          .eq("id", template.id);
        
        if (error) throw error;
      }
      
      onUpdate();
      onClose();
    } catch (error) {
      alert("Failed to save template: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTemplateVariables = () => {
    if (!form.key) return null;
    return TEMPLATE_VARIABLES[form.key] || {
      description: "General Email Template",
      variables: {
        user_name: "Name of the user",
        room_link: "Link to the room/listing",
        listing_title: "Title of the listing",
        listing_link: "Link to the listing"
      }
    };
  };

  const templateInfo = getTemplateVariables();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-2xl p-6 rounded shadow">
        <h3 className="text-xl font-bold mb-4">
          {isCreate ? "Create New Template" : `Edit: ${template.name}`}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Template Key</label>
            <select
              className="w-full p-2 border rounded"
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value })}
              disabled={!isCreate}
            >
              <option value="">Select a template type</option>
              <option value="REGISTRATION_SUCCESS">Registration Success</option>
              <option value="LISTING_INTEREST">Listing Interest Notification</option>
              <option value="PASSWORD_RESET">Password Reset</option>
              <option value="ROOM_BOOKED">Room Booked</option>
              <option value="ROOM_MATCHED">Roommate Match</option>
              <option value="RENT_REMINDER">Rent Reminder</option>
              <option value="BAN_NOTICE">Post Banned</option>
              <option value="TICKET_REPLY">Ticket Reply</option>
            </select>
            {templateInfo && (
              <p className="text-xs text-gray-500 mt-1">
                {templateInfo.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Template Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Password Reset Email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g., Reset Your Password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email Body</label>
            <textarea
              className="w-full p-2 border rounded h-40"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Email body content. Use {{variable}} for dynamic content."
            />
            {templateInfo && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <p className="font-medium mb-1">Available Variables:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(templateInfo.variables).map(([key, desc]) => (
                    <li key={key}>
                      <code className="bg-gray-200 px-1 rounded">{`{{${key}}}`}</code>: {desc}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {loading ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>
    </div>
  );
} 