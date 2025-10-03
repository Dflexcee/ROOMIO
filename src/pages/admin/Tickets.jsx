import React, { useEffect, useState } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import config from "../../config/api.js";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.tickets), {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setTickets(data.tickets || []);
      } else {
        setError(data.error || 'Failed to load tickets');
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || !selectedTicket) return;
    setReplying(true);
    setError("");

    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.tickets), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          message: reply
        })
      });

      // Safely parse JSON, handle HTML error pages
      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      const data = contentType.includes('application/json') ? (() => { try { return JSON.parse(text); } catch { return { error: text }; } })() : { error: text };

      if (response.ok && data.success) {
        setReply("");
        setSelectedTicket(null);
        fetchTickets();
        alert('Reply sent successfully! User will receive an email notification.');
      } else {
        const errorMsg = data.error || 'Failed to send reply';
        // Detect SMTP errors
        const isSMTPError = errorMsg.toLowerCase().includes('smtp') ||
                           errorMsg.toLowerCase().includes('mail') ||
                           errorMsg.toLowerCase().includes('email config');

        if (isSMTPError) {
          setError(`⚠️ SMTP Configuration Error: ${errorMsg}\n\n💡 Please configure SMTP settings at /admin/smtp-settings`);
        } else {
          setError(errorMsg);
        }
      }
    } catch (err) {
      console.error("Error sending reply:", err);
      const errorMsg = err.message || "Network error. Please try again.";
      // Detect SMTP errors in exceptions
      const isSMTPError = errorMsg.toLowerCase().includes('smtp') ||
                         errorMsg.toLowerCase().includes('mail') ||
                         errorMsg.toLowerCase().includes('email config');

      if (isSMTPError) {
        setError(`⚠️ SMTP Configuration Error: ${errorMsg}\n\n💡 Please configure SMTP settings at /admin/smtp-settings`);
      } else {
        setError(errorMsg);
      }
    } finally {
      setReplying(false);
    }
  };

  const handleResolve = async (ticketId) => {
    setError("");
    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.tickets), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ticket_id: ticketId,
          status: 'resolved'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        fetchTickets();
      } else {
        setError(data.error || 'Failed to resolve ticket');
      }
    } catch (err) {
      console.error("Error resolving ticket:", err);
      setError("Network error. Please try again.");
    }
  };

  const handleDelete = async (ticketId) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;

    setError("");
    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.tickets), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ticket_id: ticketId
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSelectedTicket(null);
        fetchTickets();
      } else {
        setError(data.error || 'Failed to delete ticket');
      }
    } catch (err) {
      console.error("Error deleting ticket:", err);
      setError("Network error. Please try again.");
    }
  };

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">📨 Support Tickets</h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg px-4 py-3 mb-4">
          <p className="text-red-700 dark:text-red-300 whitespace-pre-line">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No tickets found.
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                {/* Ticket Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-2">
                      {ticket.subject}
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>👤 <strong>From:</strong> {ticket.full_name || 'Unknown'}</p>
                      <p>📧 <strong>Email:</strong> {ticket.email || 'No email'}</p>
                      {ticket.phone && <p>📱 <strong>Phone:</strong> {ticket.phone}</p>}
                      <p>📅 <strong>Created:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-center ${
                      ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      ticket.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {ticket.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-center ${
                      ticket.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      ticket.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                      ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>

                {/* Conversation Thread */}
                <div className="mb-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">💬 Conversation</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {ticket.ticket_responses && ticket.ticket_responses.length > 0 ? (
                      ticket.ticket_responses.map((response, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${
                            response.is_admin_response
                              ? 'bg-blue-50 dark:bg-blue-900/20 ml-8'
                              : 'bg-white dark:bg-gray-800 mr-8'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              {response.is_admin_response ? '👨‍💼 Admin' : '👤 User'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(response.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                            {response.message}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No messages yet.</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    💬 Reply
                  </button>
                  {ticket.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolve(ticket.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                    >
                      ✓ Resolve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(ticket.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Reply to: {selectedTicket.subject}
            </h3>
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>To:</strong> {selectedTicket.full_name} ({selectedTicket.email})
              </p>
            </div>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply here... The user will receive an email notification."
              className="w-full h-40 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setReply("");
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={replying || !reply.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {replying ? '📤 Sending...' : '📧 Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
