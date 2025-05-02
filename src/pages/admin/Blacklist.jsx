import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import PageWrapper from "../../components/common/PageWrapper";

export default function Blacklist() {
  const [bannedUsers, setBannedUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [emailToBan, setEmailToBan] = useState("");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const fetchData = async () => {
    const { data: users } = await supabase
      .from("users")
      .select("*")
      .eq("status", "banned");

    const { data: logsData } = await supabase
      .from("system_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    setBannedUsers(users || []);
    setLogs(logsData || []);
  };

  const handleManualBan = async () => {
    if (!emailToBan) return;
    const { data, error } = await supabase
      .from("users")
      .update({ status: "banned" })
      .eq("email", emailToBan);

    if (!error) {
      // Log it
      await supabase.from("system_logs").insert([
        {
          action: "ban",
          description: `Manually banned ${emailToBan}`,
          actor: "admin@campusmate.com",
        },
      ]);
      alert("User banned successfully.");
      setEmailToBan("");
      setRefresh(!refresh);
    }
  };

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4">🚨 Blacklist & Logs</h2>

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