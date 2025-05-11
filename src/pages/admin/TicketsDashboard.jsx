import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import Navbar from "../../components/common/Navbar";
import DarkModeToggle from "../../components/common/DarkModeToggle";

export default function TicketsDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/signup-login");
        return;
      }

      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!adminUser) {
        navigate("/dashboard");
        return;
      }

      fetchTickets();
      fetchEmailTemplate();
    };

    checkAdmin();
  }, [navigate]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          ticket_responses(*),
          users:user_id (
            email,
            full_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("name", "ticket_auto_response")
        .single();

      if (error) throw error;
      setEmailTemplate(data);
    } catch (err) {
      console.error("Error fetching email template:", err);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const { error } = await supabase
        .from("tickets")
        .update({ status: newStatus })
        .eq("id", ticketId);

      if (error) throw error;
      fetchTickets();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReply = async (ticketId) => {
    if (!replyMessage.trim()) return;

    try {
      const { error } = await supabase
        .from("ticket_responses")
        .insert([
          {
            ticket_id: ticketId,
            message: replyMessage,
            is_admin: true,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      // Send email to user
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket && emailTemplate) {
        const emailBody = emailTemplate.body
          .replace("{user_name}", ticket.users.full_name)
          .replace("{ticket_subject}", ticket.subject)
          .replace("{ticket_priority}", ticket.priority)
          .replace("{ticket_id}", ticket.id);

        // Here you would integrate with your email service
        console.log("Sending email:", {
          to: ticket.users.email,
          subject: emailTemplate.subject,
          body: emailBody,
        });
      }

      setReplyMessage("");
      fetchTickets();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <div className="flex justify-center pt-4">
        <DarkModeToggle />
      </div>
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-lg text-blue-700 dark:text-pink-400 font-bold">Loading...</div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <div className="flex justify-center pt-4">
        <DarkModeToggle />
      </div>
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-blue-100 dark:border-gray-800">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400">Tickets Dashboard</h2>
            {error && <div className="text-red-600 mb-4">{error}</div>}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Tickets List */}
              <div className="lg:col-span-1">
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedTicket?.id === ticket.id
                          ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      } border`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{ticket.subject}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            From: {ticket.users.full_name}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                          ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        Status: <span className={`font-semibold ${
                          ticket.status === 'open' ? 'text-green-600' :
                          ticket.status === 'in_progress' ? 'text-blue-600' :
                          ticket.status === 'resolved' ? 'text-purple-600' :
                          'text-gray-600'
                        }`}>{ticket.status}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ticket Details */}
              <div className="lg:col-span-2">
                {selectedTicket ? (
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold">{selectedTicket.subject}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          From: {selectedTicket.users.full_name} ({selectedTicket.users.email})
                        </p>
                      </div>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                        className="p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div className="space-y-4 mb-6">
                      {selectedTicket.ticket_responses.map((response) => (
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
                      ))}
                    </div>

                    <div className="mt-6">
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        rows="4"
                      ></textarea>
                      <button
                        onClick={() => handleReply(selectedTicket.id)}
                        disabled={!replyMessage.trim()}
                        className="mt-4 bg-gradient-to-r from-pink-500 to-yellow-500 dark:from-blue-700 dark:to-purple-700 text-white px-6 py-2 rounded-full shadow-lg hover:scale-105 transition-all text-lg font-semibold disabled:opacity-60"
                      >
                        Send Reply
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-600 dark:text-gray-300 py-12">
                    Select a ticket to view details
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 