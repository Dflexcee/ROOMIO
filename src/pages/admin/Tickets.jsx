import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import PageWrapper from "../../components/common/PageWrapper";
import TicketChat from "../../components/admin/TicketChat";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*, users(full_name, email)")
      .order("created_at", { ascending: false });

    if (!error) setTickets(data);
  };

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4">📨 Support Tickets</h2>

      <div className="flex gap-6">
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
                  {ticket.users?.full_name || "User"} – {ticket.status}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(ticket.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="flex-1">
          {selectedTicket ? (
            <TicketChat ticket={selectedTicket} />
          ) : (
            <p className="text-gray-500 mt-10">Select a ticket to view messages.</p>
          )}
        </div>
      </div>
    </PageWrapper>
  );
} 