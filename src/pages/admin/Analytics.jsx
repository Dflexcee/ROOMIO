import React, { useEffect, useState } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import config from "../../config/api.js";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.stats), {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok) {
        setStats({
          total_users: data.total_users || 0,
          tenants: data.tenants || 0,
          landlords: data.landlords || 0,
          agents: data.agents || 0,
          verified: data.verified_users || 0,
          unverified: (data.total_users || 0) - (data.verified_users || 0),
          total_rooms: data.total_rooms || 0,
          total_tickets: data.open_tickets || 0,
        });
      } else {
        setError("Failed to fetch analytics data");
      }
    } catch (err) {
      setError("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <h2 className="text-2xl font-bold mb-6"> Admin Analytics</h2>
        <div className="text-center py-8 text-gray-500">Loading analytics...</div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <h2 className="text-2xl font-bold mb-6"> Admin Analytics</h2>
        <div className="text-center py-8 text-red-500">{error}</div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-6"> Admin Analytics</h2>

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