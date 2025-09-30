import React, { useState, useEffect } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import config from "../../config/api.js";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    verified_users: 0,
    total_rooms: 0,
    pending_verifications: 0,
    open_tickets: 0,
    flagged_rooms: 0,
    new_users: 0,
    tenants: 0,
    landlords: 0,
    agents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.stats));
      const data = await response.json();
      if (response.ok && data.success) {
        // Map the data to the expected structure
        const mappedStats = {
          total_users: data.total_users || 0,
          verified_users: data.verified_users || 0,
          total_rooms: data.total_rooms || 0,
          pending_verifications: data.pending_verifications || 0,
          open_tickets: data.open_tickets || 0,
          flagged_rooms: data.flagged_rooms || 0,
          new_users: data.new_users || 0,
          tenants: data.tenants || 0,
          landlords: data.landlords || 0,
          agents: data.agents || 0
        };
        setStats(mappedStats);
      } else {
        setError(data.error || data.message || 'Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Error fetching dashboard stats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Loading dashboard data...</p>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4">📊 Admin Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">🏠</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_rooms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.verified_users}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending_verifications}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">🏠</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Landlords</p>
              <p className="text-2xl font-bold text-gray-900">{stats.landlords}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">👤</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tenants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.tenants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <span className="text-2xl">🤝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Agents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.agents}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => alert('SMTP Settings updated!')}
              className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              📧 Configure SMTP Settings
            </button>
            <button 
              onClick={() => alert('Email template updated!')}
              className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              📝 Update Email Templates
            </button>
            <button 
              onClick={() => alert('Broadcast sent!')}
              className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              📢 Send Broadcast Message
            </button>
            <button 
              onClick={() => alert('Analytics refreshed!')}
              className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              📊 Refresh Analytics
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-green-500 mr-3">✅</span>
              <div>
                <p className="text-sm font-medium">New user registered</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-blue-500 mr-3">🏠</span>
              <div>
                <p className="text-sm font-medium">New listing posted</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-yellow-500 mr-3">⏳</span>
              <div>
                <p className="text-sm font-medium">Verification pending</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}