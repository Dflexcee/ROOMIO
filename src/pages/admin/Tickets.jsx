import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import PageWrapper from "../../components/common/PageWrapper";
import TicketChat from "../../components/admin/TicketChat";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError("Failed to load tickets: " + error.message);
    else setTickets(data);
  };

  return (
    <PageWrapper>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      <h2 className="text-2xl font-bold mb-4">🧾 Support Tickets</h2>
      <div className="flex gap-6">
        <div className="w-1/3 space-y-2 overflow-y-auto h-[80vh]">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`p-4 rounded shadow cursor-pointer ${
                selectedTicket?.id === ticket.id ? "bg-blue-100" : "bg-white"
              }`}
            >
              <h4 className="font-semibold text-sm">{ticket.subject}</h4>
              <p className="text-xs text-gray-500">Status: {ticket.status}</p>
            </div>
          ))}
        </div>
        <div className="flex-1">
          {selectedTicket ? (
            <TicketChat ticket={selectedTicket} />
          ) : (
            <div className="text-gray-500 mt-10">Select a ticket to view conversation</div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
} 