import React, { useEffect, useState } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import config from "../../config/api.js";

export default function AgentVerification() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(config.getUrl('/admin/verification-requests.php'), {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok) {
        setRequests(data.requests || []);
      } else {
        setError("Failed to fetch verification requests");
      }
    } catch (err) {
      setError("Failed to fetch verification requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(config.getUrl('/admin/verify-user.php'), {
        method: 'POST',
        headers: config.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          user_id: id,
          status: 'verified'
        })
      });
      
      if (response.ok) {
        fetchRequests();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to approve user");
      }
    } catch (err) {
      setError("Failed to approve user");
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(config.getUrl('/admin/verify-user.php'), {
        method: 'POST',
        headers: config.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          user_id: id,
          status: 'rejected'
        })
      });
      
      if (response.ok) {
        fetchRequests();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to reject user");
      }
    } catch (err) {
      setError("Failed to reject user");
    }
  };

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-6">✅ Agent & Landlord Verifications</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading verification requests...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No pending verifications.</div>
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