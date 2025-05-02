import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import PageWrapper from "../../components/common/PageWrapper";

export default function Analytics() {
  const [stats, setStats] = useState({
    total_users: 0,
    tenants: 0,
    landlords: 0,
    agents: 0,
    verified: 0,
    unverified: 0,
    total_rooms: 0,
    total_tickets: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [userData, roomData, ticketData] = await Promise.all([
      supabase.from("users").select("*"),
      supabase.from("rooms").select("*"),
      supabase.from("support_tickets").select("*"),
    ]);

    const users = userData.data || [];
    const rooms = roomData.data || [];
    const tickets = ticketData.data || [];

    setStats({
      total_users: users.length,
      tenants: users.filter((u) => u.account_type === "tenant").length,
      landlords: users.filter((u) => u.account_type === "landlord").length,
      agents: users.filter((u) => u.account_type === "agent").length,
      verified: users.filter((u) => u.verification_status === "verified").length,
      unverified: users.filter((u) => u.verification_status !== "verified").length,
      total_rooms: rooms.length,
      total_tickets: tickets.length,
    });
  };

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-6">📊 Admin Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatBox label="Total Users" value={stats.total_users} />
        <StatBox label="Tenants" value={stats.tenants} />
        <StatBox label="Landlords" value={stats.landlords} />
        <StatBox label="Agents" value={stats.agents} />
        <StatBox label="Verified Users" value={stats.verified} />
        <StatBox label="Unverified Users" value={stats.unverified} />
        <StatBox label="Total Rooms Listed" value={stats.total_rooms} />
        <StatBox label="Total Support Tickets" value={stats.total_tickets} />
      </div>
    </PageWrapper>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-white rounded shadow p-4 text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <h3 className="text-2xl font-bold text-blue-700 mt-1">{value}</h3>
    </div>
  );
} 