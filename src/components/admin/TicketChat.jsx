import React, { useEffect, useState } from "react";

export default function TicketChat({ ticket }) {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState(ticket.status);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [ticket, refresh]);

  const fetchMessages = async () => {
    // Mock messages data
    const mockMessages = [
      {
        id: 1,
        message: "I'm having trouble with my account",
        is_admin: false,
        sent_at: "2024-01-15T10:30:00Z"
      },
      {
        id: 2,
        message: "We're looking into this issue for you",
        is_admin: true,
        sent_at: "2024-01-15T11:00:00Z"
      }
    ];
    setMessages(mockMessages);
  };

  const handleSend = async () => {
    if (!reply.trim()) return;

    // Mock send message functionality
    setReply("");
    setRefresh(!refresh);
  };

  const handleStatusUpdate = async (newStatus) => {
    // Mock status update functionality
    setStatus(newStatus);
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