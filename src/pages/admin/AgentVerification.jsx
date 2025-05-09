import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import PageWrapper from "../../components/common/PageWrapper";

export default function AgentVerification() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, account_type, verification_status, verification_id_url, verification_submitted_at")
      .in("account_type", ["agent", "landlord"])
      .eq("verification_status", "pending")
      .order("verification_submitted_at", { ascending: false });
    setRequests(data || []);
    setLoading(false);
  };

  const handleApprove = async (id) => {
    await supabase.from("users").update({ verification_status: "verified" }).eq("id", id);
    fetchRequests();
  };

  const handleReject = async (id) => {
    await supabase.from("users").update({ verification_status: "rejected" }).eq("id", id);
    fetchRequests();
  };

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-6">✅ Agent & Landlord Verifications</h2>
      {loading ? (
        <div>Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-gray-500">No pending verifications.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((user) => (
            <div key={user.id} className="bg-white rounded shadow p-4 flex flex-col">
              <div className="mb-2">
                <span className="font-semibold">{user.full_name}</span> ({user.email})<br />
                <span className="text-xs text-gray-500">{user.account_type}</span>
              </div>
              <div className="mb-2">
                <img
                  src={user.verification_id_url}
                  alt="ID"
                  className="w-full max-w-xs rounded border mb-2"
                />
                <div className="text-xs text-gray-500">
                  Submitted: {user.verification_submitted_at ? new Date(user.verification_submitted_at).toLocaleString() : "N/A"}
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleApprove(user.id)}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(user.id)}
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
} 