import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import PageWrapper from "../../components/common/PageWrapper";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    verified_users: 0,
    total_rooms: 0,
    pending_verifications: 0,
    open_tickets: 0,
    flagged_rooms: 0,
    new_users: 0,
    last_broadcast: null,
    tenants: 0,
    landlords: 0,
    agents: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    const [userRes, roomRes, ticketRes, broadcastRes] = await Promise.all([
      supabase.from("users").select("*"),
      supabase.from("rooms").select("*"),
      supabase.from("support_tickets").select("*"),
      supabase.from("broadcasts").select("*").order("sent_at", { ascending: false }).limit(1),
    ]);

    const now = new Date();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const users = userRes.data || [];
    const rooms = roomRes.data || [];
    const tickets = ticketRes.data || [];
    const lastBroadcast = broadcastRes.data?.[0] || null;

    setStats({
      total_users: users.length,
      verified_users: users.filter((u) => u.verification_status === "verified").length,
      new_users: users.filter((u) => u.created_at > weekAgo).length,
      total_rooms: rooms.length,
      pending_verifications: users.filter((u) => u.verification_status === "pending").length,
      open_tickets: tickets.filter((t) => t.status === "open").length,
      flagged_rooms: rooms.filter((r) => r.status === "flagged").length,
      last_broadcast: lastBroadcast,
      tenants: users.filter((u) => u.account_type === "tenant").length,
      landlords: users.filter((u) => u.account_type === "landlord").length,
      agents: users.filter((u) => u.account_type === "agent").length,
    });
  };

  // Chart data
  const chartData = {
    labels: ["Tenants", "Landlords", "Agents", "Rooms", "Tickets"],
    datasets: [
      {
        label: "Count",
        data: [
          stats.tenants,
          stats.landlords,
          stats.agents,
          stats.total_rooms,
          stats.open_tickets,
        ],
        backgroundColor: [
          "#3b82f6",
          "#f59e42",
          "#10b981",
          "#6366f1",
          "#ef4444",
        ],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "User & Activity Overview" },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  return (
    <PageWrapper>
      <h2 className="text-3xl font-extrabold mb-8 text-blue-800 flex items-center gap-2">
        <span>📊</span> Admin Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Widget label="👥 Total Users" value={stats.total_users} />
        <Widget label="✅ Verified Users" value={stats.verified_users} />
        <Widget label="🆕 New This Week" value={stats.new_users} />
        <Widget label="🏘️ Rooms Posted" value={stats.total_rooms} />
        <Widget label="🚩 Flagged Rooms" value={stats.flagged_rooms} />
        <Widget label="📩 Open Tickets" value={stats.open_tickets} />
        <Widget label="🧍 Pending Verifications" value={stats.pending_verifications} />
      </div>

      <div className="bg-white rounded shadow p-6 mb-8">
        <Bar data={chartData} options={chartOptions} height={120} />
      </div>

      {stats.last_broadcast && (
        <div className="bg-white rounded shadow p-4 mt-8">
          <h3 className="text-lg font-semibold mb-1">📣 Last Broadcast</h3>
          <p className="text-sm text-gray-700">{stats.last_broadcast.subject}</p>
          <p className="text-xs text-gray-500 mt-1">
            Sent: {new Date(stats.last_broadcast.sent_at).toLocaleString()} via {stats.last_broadcast.channel}
          </p>
        </div>
      )}
    </PageWrapper>
  );
}

function Widget({ label, value }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow p-6 text-center border border-blue-100 hover:shadow-lg transition-all">
      <p className="text-blue-700 text-sm mb-1 font-semibold">{label}</p>
      <h3 className="text-3xl font-extrabold text-blue-900">{value}</h3>
    </div>
  );
} 