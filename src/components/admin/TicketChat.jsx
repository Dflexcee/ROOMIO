import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";

export default function TicketChat({ ticket }) {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState(ticket.status);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [ticket, refresh]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticket.id)
      .order("sent_at", { ascending: true });

    if (!error) setMessages(data);
  };

  const handleSend = async () => {
    if (!reply.trim()) return;

    const { error } = await supabase.from("ticket_messages").insert([
      {
        ticket_id: ticket.id,
        sender_role: "admin",
        message: reply.trim(),
      },
    ]);

    if (!error) {
      setReply("");
      setRefresh(!refresh);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    const { error } = await supabase
      .from("support_tickets")
      .update({ status: newStatus })
      .eq("id", ticket.id);

    if (!error) {
      setStatus(newStatus);
    }
  };

  return (
    <div className="bg-white shadow rounded p-4 h-[80vh] flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-bold">Ticket: {ticket.subject}</h3>
        <div>
          <span className="text-sm mr-2">Status:</span>
          <select
            className="border rounded px-2 py-1"
            value={status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 max-w-[75%] rounded ${
              msg.sender_role === "admin"
                ? "bg-blue-100 self-end ml-auto"
                : "bg-gray-100"
            }`}
          >
            <p className="text-sm">{msg.message}</p>
            <p className="text-xs text-gray-500 mt-1">
              {msg.sender_role ? msg.sender_role.toUpperCase() : "USER"}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-auto flex gap-2">
        <input
          className="border rounded p-2 flex-1"
          placeholder="Type a reply..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
} 