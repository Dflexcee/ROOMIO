import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import PageWrapper from "../../components/common/PageWrapper";

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
      // Get all tickets with their responses
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_responses(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching tickets:", error);
        setError("Error loading tickets. Please try again.");
      } else {
        // Get user details for each ticket
        const ticketsWithUsers = await Promise.all(
          (data || []).map(async (ticket) => {
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', ticket.user_id)
              .single();
            
            return {
              ...ticket,
              users: userData || { full_name: 'Unknown User', email: 'No email' }
            };
          })
        );
        
        setTickets(ticketsWithUsers);
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
      const { error } = await supabase
        .from('ticket_responses')
        .insert([{
          ticket_id: ticketId,
          message: reply,
          is_admin: true,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setReply("");
      fetchTickets();
    } catch (err) {
      console.error("Error sending reply:", err);
      setError(err.message || "Failed to send reply. Please try again.");
    } finally {
      setReplying(false);
    }
  };

  const handleResolve = async (ticketId) => {
    setError("");
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: 'resolved' })
        .eq('id', ticketId);

      if (error) throw error;
      fetchTickets();
    } catch (err) {
      console.error("Error resolving ticket:", err);
      setError(err.message || "Failed to resolve ticket. Please try again.");
    }
  };

  const handleDelete = async (ticketId) => {
    setDeleting(true);
    setError("");
    try {
      // First delete all responses
      const { error: responsesError } = await supabase
        .from('ticket_responses')
        .delete()
        .eq('ticket_id', ticketId);

      if (responsesError) throw responsesError;

      // Then delete the ticket
      const { error: ticketError } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);

      if (ticketError) throw ticketError;

      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      console.error("Error deleting ticket:", err);
      setError(err.message || "Failed to delete ticket. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4">📨 Support Tickets</h2>
      {loading ? (
        <div className="text-center text-gray-500">Loading tickets...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <div className="flex gap-6">
          {/* Sidebar: Ticket List */}
          <div className="w-1/3 space-y-2 overflow-y-auto h-[80vh]">
            {tickets.length === 0 ? (
              <p className="text-sm text-gray-500">No tickets submitted yet.</p>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 rounded shadow cursor-pointer ${
                    selectedTicket?.id === ticket.id ? "bg-blue-100" : "bg-white"
                  }`}
                >
                  <h4 className="font-semibold text-sm">{ticket.subject}</h4>
                  <p className="text-xs text-gray-600">
                    {ticket.users?.full_name || "Unknown User"} – {ticket.status}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(ticket.created_at).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Priority: {ticket.priority || "medium"}
                  </p>
                  {ticket.users?.email && (
                    <p className="text-xs text-gray-500">
                      Email: {ticket.users.email}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Main: Ticket Details */}
          <div className="flex-1">
            {selectedTicket ? (
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-2">{selectedTicket.subject}</h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    From: {selectedTicket.users?.full_name || "Unknown User"}
                  </p>
                  {selectedTicket.users?.email && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Email: {selectedTicket.users.email}
                    </p>
                  )}
                  {selectedTicket.users?.phone && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Phone: {selectedTicket.users.phone}
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
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
                            response.is_admin
                              ? "bg-blue-50 dark:bg-blue-900/30"
                              : "bg-gray-50 dark:bg-gray-800"
                          }`}
                        >
                          <p className="text-sm text-gray-600 dark:text-gray-300">{response.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {response.is_admin ? "Admin" : "User"} • {new Date(response.created_at).toLocaleString()}
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
                      disabled={!reply.trim() || replying}
                      className="mt-4 bg-gradient-to-r from-pink-500 to-yellow-500 dark:from-blue-700 dark:to-purple-700 text-white px-6 py-2 rounded-full shadow-lg hover:scale-105 transition-all text-lg font-semibold disabled:opacity-60"
                    >
                      {replying ? "Sending..." : "Send Reply"}
                    </button>
                    <button
                      onClick={() => handleResolve(selectedTicket.id)}
                      className="ml-4 mt-4 bg-green-600 text-white px-4 py-2 rounded-full shadow hover:bg-green-700"
                    >
                      Mark as Resolved
                    </button>
                  </div>
                )}
                <button
                  onClick={() => handleDelete(selectedTicket.id)}
                  disabled={deleting}
                  className="mt-6 bg-red-600 text-white px-4 py-2 rounded-full shadow hover:bg-red-700"
                >
                  {deleting ? "Deleting..." : "Delete Ticket"}
                </button>
              </div>
            ) : (
              <p className="text-gray-500 mt-10">Select a ticket to view messages.</p>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
} 