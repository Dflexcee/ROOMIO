import React, { useEffect, useState } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import config from "../../config/api.js";

export default function Blacklist() {
  const [bannedUsers, setBannedUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [emailToBan, setEmailToBan] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch banned users
      const usersResponse = await fetch(config.getUrl('/admin/banned-users.php'), {
        credentials: 'include'
      });
      const usersData = await usersResponse.json();
      
      // Fetch system logs
      const logsResponse = await fetch(config.getUrl('/admin/system-logs.php'), {
        credentials: 'include'
      });
      const logsData = await logsResponse.json();
      
      if (usersResponse.ok && logsResponse.ok) {
        setBannedUsers(usersData.users || []);
        setLogs(logsData.logs || []);
      } else {
        setError("Failed to fetch data");
      }
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleManualBan = async () => {
    if (!emailToBan) return;
    
    try {
      const response = await fetch(config.getUrl('/admin/ban-user.php'), {
        method: 'POST',
        headers: config.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          email: emailToBan,
          reason: 'Manual ban by admin'
        })
      });
      
      if (response.ok) {
        alert("User banned successfully.");
        setEmailToBan("");
        setRefresh(!refresh);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to ban user");
      }
    } catch (err) {
      alert("Failed to ban user");
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <h2 className="text-2xl font-bold mb-4"> Blacklist & Logs</h2>
        <div className="text-center py-8 text-gray-500">Loading data...</div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4">🚨 Blacklist & Logs</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white p-4 rounded shadow mb-6 max-w-xl">
        <h3 className="font-semibold mb-2">➕ Manually Ban a User</h3>
        <input
          type="email"
          placeholder="Enter email to ban"
          value={emailToBan}
          onChange={(e) => setEmailToBan(e.target.value)}
          className="border p-2 w-full mb-3"
        />
        <button
          onClick={handleManualBan}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Ban User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg mb-2">🛑 Banned Users</h3>
          {bannedUsers.length === 0 ? (
            <p className="text-gray-500 text-sm">No banned users.</p>
          ) : (
            <ul className="space-y-2">
              {bannedUsers.map((user) => (
                <li key={user.id} className="text-sm">
                  {user.full_name} – {user.email}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg mb-2">🧾 System Logs</h3>
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activity.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {logs.map((log) => (
                <li key={log.id}>
                  <strong>{log.action}</strong>: {log.description}  
                  <span className="text-xs text-gray-400 block">
                    {new Date(log.created_at).toLocaleString()} by {log.actor}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageWrapper>
  );
} 