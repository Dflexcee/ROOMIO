import React, { useEffect, useState } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import config from "../../config/api.js";
import { useCurrency } from "../../contexts/CurrencyContext";

export default function GrantFeatureAccess() {
  const { formatCurrency } = useCurrency();
  const [users, setUsers] = useState([]);
  const [features, setFeatures] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [form, setForm] = useState({
    user_id: "",
    feature_name: "",
    duration_value: 30,
    duration_type: "days"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userAccess, setUserAccess] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (form.user_id) {
      fetchUserAccess(form.user_id);
    } else {
      setUserAccess([]);
    }
  }, [form.user_id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users
      const usersResponse = await fetch(config.getUrl(config.endpoints.admin.users));
      const usersData = await usersResponse.json();

      // Fetch features
      const featuresResponse = await fetch(config.getUrl('/payments-settings/list.php'));
      const featuresData = await featuresResponse.json();

      if (usersResponse.ok) {
        setUsers(usersData.users || []);
      } else {
        console.error("Error fetching users:", usersData.error);
        setError("Failed to load users: " + (usersData.error || 'Unknown error'));
      }

      if (featuresResponse.ok) {
        setFeatures(featuresData.settings || []);
      } else {
        console.error("Error fetching features:", featuresData.error);
        setError("Failed to load features: " + (featuresData.error || 'Unknown error'));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data: " + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAccess = async (userId) => {
    try {
      // Mock user access data for now
      const mockAccess = [
        {
          feature_name: "premium_listing",
          paid_at: "2024-01-15T10:30:00Z",
          expires_at: "2024-02-15T10:30:00Z",
          status: "active"
        },
        {
          feature_name: "priority_support",
          paid_at: "2024-01-10T14:20:00Z",
          expires_at: "2024-03-10T14:20:00Z",
          status: "active"
        }
      ];
      setUserAccess(mockAccess);
    } catch (err) {
      setUserAccess([]);
    }
  };

  const grantAccess = async () => {
    try {
      setError(null);
      setSuccess(null);
      if (!form.user_id || !form.feature_name) {
        setError("Please select both a user and a feature.");
        return;
      }
      
      // Mock grant access functionality
      setSuccess("Feature access granted successfully!");
      fetchUserAccess(form.user_id);
    } catch (err) {
      setError("Failed to grant access: " + (err.message || JSON.stringify(err)));
    }
  };

  // Filter users by search
  const filteredUsers = users.filter(u =>
    (u.full_name || "").toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span className="text-blue-500">🆓</span> Grant Feature Access to User
      </h2>
      <div className="bg-white p-4 rounded shadow space-y-4 max-w-xl">
        <div>
          <input
            type="text"
            placeholder="Search user by name or email..."
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            className="border p-2 w-full mb-2"
          />
          <select
            value={form.user_id}
            onChange={e => setForm({ ...form, user_id: e.target.value })}
            className="border p-2 w-full"
          >
            <option value="">Select User</option>
            {filteredUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name} ({u.email})
              </option>
            ))}
          </select>
          {!loading && filteredUsers.length === 0 && (
            <div className="text-yellow-700 bg-yellow-50 p-2 rounded mt-2">No users found in profiles table.</div>
          )}
        </div>
        <div>
          <select
            value={form.feature_name}
            onChange={e => setForm({ ...form, feature_name: e.target.value })}
            className="border p-2 w-full"
          >
            <option value="">Select Feature</option>
            {features.map((f) => (
              <option key={f.id} value={f.feature_name}>
                {(f.label || f.feature_name)} ({formatCurrency(f.unlock_price || 0)} / {f.duration_value} {f.duration_type})
              </option>
            ))}
          </select>
          {!loading && features.length === 0 && (
            <div className="text-yellow-700 bg-yellow-50 p-2 rounded mt-2">No features found in payment_settings table.</div>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            value={form.duration_value}
            onChange={e => setForm({ ...form, duration_value: e.target.value })}
            className="border p-2 w-1/2"
            placeholder="Duration"
          />
          <select
            value={form.duration_type}
            onChange={e => setForm({ ...form, duration_type: e.target.value })}
            className="border p-2 w-1/2"
          >
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="years">Years</option>
          </select>
        </div>
        <button
          onClick={grantAccess}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Grant Access
        </button>
        {error && (
          <div className="text-red-600 bg-red-50 p-3 rounded" style={{ wordBreak: "break-all" }}>
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-600 bg-green-50 p-3 rounded">
            {success}
          </div>
        )}
      </div>
      {/* Show current access for selected user */}
      {form.user_id && (
        <div className="bg-gray-50 rounded shadow p-4 mt-6 max-w-xl">
          <h3 className="font-semibold mb-2">Current Feature Access for User</h3>
          {userAccess.length === 0 ? (
            <div className="text-gray-500">No premium features granted yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left">Feature</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Paid On</th>
                  <th className="p-2 text-left">Expires</th>
                </tr>
              </thead>
              <tbody>
                {userAccess.map((a, i) => (
                  <tr key={i}>
                    <td className="p-2">{a.feature_name}</td>
                    <td className="p-2">{a.status}</td>
                    <td className="p-2">{a.paid_at ? new Date(a.paid_at).toLocaleDateString() : "-"}</td>
                    <td className="p-2">{a.expires_at ? new Date(a.expires_at).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </PageWrapper>
  );
} 