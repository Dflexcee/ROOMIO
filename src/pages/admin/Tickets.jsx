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
  const [deleting, setDeleting] = useState(false);

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

      if (response.ok) {
        setTickets(data.tickets || []);
      } else {
        console.error("Error fetching tickets:", data.error);
        setError("Error loading tickets: " + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (ticketId) => {
    if (!reply.trim()) return;
    setReplying(true);
    setError("");
    
    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.tickets), {
        method: 'POST',
        headers: config.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          ticket_id: ticketId,
          message: reply
        })
      });

      const data = await response.json();

      if (response.ok) {
        setReply("");
        fetchTickets();
      } else {
        console.error("Error sending reply:", data.error);
        setError("Failed to send reply: " + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error("Error sending reply:", err);
      setError("Failed to send reply. Please try again.");
    } finally {
      setReplying(false);
    }
  };

  const handleResolve = async (ticketId) => {
    setError("");
    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.tickets), {
        method: 'PUT',
        headers: config.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          ticket_id: ticketId,
          status: 'resolved'
        })
      });

      const data = await response.json();

      if (response.ok) {
        fetchTickets();
      } else {
        console.error("Error resolving ticket:", data.error);
        setError("Failed to resolve ticket: " + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error("Error resolving ticket:", err);
      setError("Failed to resolve ticket. Please try again.");
    }
  };

  const handleDelete = async (ticketId) => {
    setDeleting(true);
    setError("");
    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.tickets), {
        method: 'DELETE',
        headers: config.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          ticket_id: ticketId
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSelectedTicket(null);
        fetchTickets();
      } else {
        console.error("Error deleting ticket:", data.error);
        setError("Failed to delete ticket: " + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error("Error deleting ticket:", err);
      setError("Failed to delete ticket. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4">📨 Support Tickets</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tickets found.
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                    <p className="text-gray-600 text-sm">
                      From: {ticket.users?.full_name || 'Unknown User'} ({ticket.users?.email || 'No email'})
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(ticket.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                      ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-700">{ticket.description}</p>
                </div>

                {ticket.ticket_responses && ticket.ticket_responses.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Responses:</h4>
                    <div className="space-y-2">
                      {ticket.ticket_responses.map((response, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <p className="text-sm">{response.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(response.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Reply
                  </button>
                  {ticket.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolve(ticket.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(ticket.id)}
                    disabled={deleting}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reply to Ticket</h3>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReply(selectedTicket.id)}
                disabled={replying || !reply.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {replying ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}