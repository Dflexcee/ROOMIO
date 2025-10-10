import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/common/Navbar";
import DarkModeToggle from "../components/common/DarkModeToggle";
import { useNavigate } from "react-router-dom";
import config from "../config/api.js";

export default function HelpCenter() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ subject: "", priority: "medium", message: "" });
  const navigate = useNavigate();

  const fetchTickets = async () => {
    setLoading(true);
    setError("");
    try {
      if (!user) {
        setError("Please log in to access the help center.");
        setLoading(false);
        return;
      }

      // Fetch tickets from API
      const response = await fetch(config.getUrl(config.endpoints.tickets.list), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const listCt = response.headers.get('content-type') || '';
      const listText = await response.text();
      const data = listCt.includes('application/json') ? (() => { try { return JSON.parse(listText); } catch { return { success: false, message: listText }; } })() : { success: false, message: listText };

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tickets');
      }

      if (data.success) {
        setTickets(data.tickets || []);
      } else {
        throw new Error(data.message || 'Failed to load tickets');
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError(err.message || "Failed to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    if (!user) {
      setError("You must be logged in to submit a ticket.");
      setSubmitting(false);
      navigate("/signup-login");
      return;
    }

    try {
      // Create ticket via API
      const response = await fetch(config.getUrl(config.endpoints.tickets.create), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: form.subject,
          message: form.message,
          priority: form.priority
        })
      });

      const createCt = response.headers.get('content-type') || '';
      const createText = await response.text();
      const data = createCt.includes('application/json') ? (() => { try { return JSON.parse(createText); } catch { return { success: false, message: createText }; } })() : { success: false, message: createText };

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create ticket');
      }

      if (data.success) {
        setSuccess("Ticket submitted successfully! We'll get back to you soon.");
        setForm({ subject: "", priority: "medium", message: "" });
        setSelectedTicket(null);
        // Refresh tickets list
        fetchTickets();
      } else {
        throw new Error(data.message || 'Failed to create ticket');
      }
    } catch (err) {
      console.error("Error submitting ticket:", err);
      // Detect SMTP errors
      const isSMTPError = err.message && (
        err.message.toLowerCase().includes('smtp') ||
        err.message.toLowerCase().includes('mail') ||
        err.message.toLowerCase().includes('email config')
      );

      if (isSMTPError) {
        setError(`⚠️ SMTP Configuration Error: ${err.message}\n\n💡 Admin needs to configure SMTP settings at /admin/smtp-settings`);
      } else {
        setError(err.message || "Failed to submit ticket. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (ticketId) => {
    if (!reply.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      // Send reply via API
      const response = await fetch(config.getUrl(config.endpoints.tickets.reply), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ticket_id: ticketId,
          message: reply
        })
      });

      const replyCt = response.headers.get('content-type') || '';
      const replyText = await response.text();
      const data = replyCt.includes('application/json') ? (() => { try { return JSON.parse(replyText); } catch { return { success: false, message: replyText }; } })() : { success: false, message: replyText };

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reply');
      }

      if (data.success) {
        setSuccess("Reply sent successfully!");
        setReply("");
        // Refresh the ticket details
        await fetchTicketDetails(ticketId);
      } else {
        throw new Error(data.message || 'Failed to send reply');
      }
    } catch (err) {
      console.error("Error sending reply:", err);
      // Detect SMTP errors
      const isSMTPError = err.message && (
        err.message.toLowerCase().includes('smtp') ||
        err.message.toLowerCase().includes('mail') ||
        err.message.toLowerCase().includes('email config')
      );

      if (isSMTPError) {
        setError(`⚠️ SMTP Configuration Error: ${err.message}\n\n💡 Admin needs to configure SMTP settings at /admin/smtp-settings`);
      } else {
        setError(err.message || "Failed to send reply. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await fetch(config.getUrl(config.endpoints.tickets.get) + `?id=${ticketId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const getCt = response.headers.get('content-type') || '';
      const getText = await response.text();
      const data = getCt.includes('application/json') ? (() => { try { return JSON.parse(getText); } catch { return { success: false, message: getText }; } })() : { success: false, message: getText };

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch ticket details');
      }

      if (data.success && data.ticket) {
        // Update the selected ticket with the latest data
        setSelectedTicket(data.ticket);

        // Also update the ticket in the tickets list
        setTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket.id === ticketId ? data.ticket : ticket
          )
        );
      } else {
        throw new Error(data.message || 'Failed to load ticket details');
      }
    } catch (err) {
      console.error("Error fetching ticket details:", err);
      setError(err.message || "Failed to load ticket details. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <div className="flex justify-center pt-4">
        <DarkModeToggle />
      </div>
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 mb-8 border border-blue-100 dark:border-gray-800">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">📞</div>
                <h3 className="font-semibold mb-2">WhatsApp/Phone</h3>
                <p className="text-gray-600 dark:text-gray-300">{import.meta.env.VITE_SUPPORT_PHONE || '+234 123 456 7890'}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📧</div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-gray-600 dark:text-gray-300">{import.meta.env.VITE_SUPPORT_EMAIL || 'support@roomio.com'}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📍</div>
                <h3 className="font-semibold mb-2">Address</h3>
                <p className="text-gray-600 dark:text-gray-300">123 Campus Road, Lagos, Nigeria</p>
              </div>
            </div>
          </div>

          {/* New Ticket Form */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 mb-8 border border-blue-100 dark:border-gray-800">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400">Submit a Ticket</h2>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
                <p className="text-red-700 dark:text-red-300 whitespace-pre-line">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-4">
                <p className="text-green-700 dark:text-green-300">{success}</p>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={user?.full_name || user?.email?.split('@')[0] || "No name"}
                  disabled
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || "No email"}
                  disabled
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows="5"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 dark:from-blue-700 dark:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg hover:scale-105 hover:from-pink-600 hover:to-yellow-600 dark:hover:from-blue-800 dark:hover:to-purple-800 transition-all text-lg font-semibold disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </form>
          </div>

          {/* Existing Tickets */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-blue-100 dark:border-gray-800">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400">Your Tickets</h2>
            {loading ? (
              <div className="text-gray-500">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300 text-center">No tickets yet</p>
            ) : (
              <div className="flex gap-6">
                {/* Sidebar: Ticket List */}
                <div className="w-1/3 space-y-2 overflow-y-auto h-[60vh]">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => fetchTicketDetails(ticket.id)}
                      className={`p-4 rounded shadow cursor-pointer ${
                        selectedTicket?.id === ticket.id ? "bg-blue-100" : "bg-white"
                      }`}
                    >
                      <h4 className="font-semibold text-sm">{ticket.subject}</h4>
                      <p className="text-xs text-gray-600">{ticket.status}</p>
                      <p className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Priority: {ticket.priority || "medium"}</p>
                    </div>
                  ))}
                </div>
                {/* Main: Ticket Details */}
                <div className="flex-1">
                  {selectedTicket ? (
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-xl font-bold mb-2">{selectedTicket.subject}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Priority: {selectedTicket.priority || "medium"} | Status: {selectedTicket.status}
                      </p>
                      <div className="space-y-4 mb-6">
                        {selectedTicket.ticket_responses && selectedTicket.ticket_responses.length > 0 ? (
                          selectedTicket.ticket_responses
                            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                            .map((response) => (
                              <div
                                key={response.id}
                                className={`p-4 rounded-lg ${
                                  response.is_admin_response
                                    ? "bg-blue-50 dark:bg-blue-900/30"
                                    : "bg-gray-50 dark:bg-gray-800"
                                }`}
                              >
                                <p className="text-sm text-gray-600 dark:text-gray-300">{response.message}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {response.is_admin_response ? "Admin" : "You"} • {new Date(response.created_at).toLocaleString()}
                                </p>
                              </div>
                            ))
                        ) : (
                          <p className="text-gray-400">No responses yet.</p>
                        )}
                      </div>
                      {selectedTicket.status !== "resolved" && (
                        <div className="mt-6">
                          <textarea
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Type your reply..."
                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            rows="4"
                          ></textarea>
                          <button
                            onClick={() => handleReply(selectedTicket.id)}
                            disabled={!reply.trim() || submitting}
                            className="mt-4 bg-gradient-to-r from-pink-500 to-yellow-500 dark:from-blue-700 dark:to-purple-700 text-white px-6 py-2 rounded-full shadow-lg hover:scale-105 transition-all text-lg font-semibold disabled:opacity-60"
                          >
                            {submitting ? "Sending..." : "Send Reply"}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 mt-10">Select a ticket to view messages.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 