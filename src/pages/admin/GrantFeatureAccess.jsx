import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import PageWrapper from "../../components/common/PageWrapper";

export default function GrantFeatureAccess() {
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

      // Fetch users from profiles
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .order("full_name");
      if (usersError) throw usersError;

      // Fetch only locked (premium) features from payment_settings
      const { data: featuresData, error: featuresError } = await supabase
        .from("payment_settings")
        .select("id, feature_name, unlock_price, is_locked, duration_type, duration_value, label")
        .eq("is_locked", true)
        .order("feature_name");
      if (featuresError) throw featuresError;

      setUsers(usersData || []);
      setFeatures(featuresData || []);
    } catch (err) {
      setError("Failed to load data: " + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAccess = async (userId) => {
    try {
      // Get all active/valid feature access for this user
      const { data, error } = await supabase
        .from("user_payments")
        .select("feature_name, paid_at, expires_at, status")
        .eq("user_id", userId)
        .order("expires_at", { ascending: false });
      if (error) throw error;
      setUserAccess(data || []);
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
      let durationInDays = Number(form.duration_value);
      if (form.duration_type === "weeks") durationInDays *= 7;
      if (form.duration_type === "months") durationInDays *= 30;
      if (form.duration_type === "years") durationInDays *= 365;
      const { error } = await supabase.rpc("grant_user_access", {
        user_id: form.user_id,
        feature_name: form.feature_name,
        duration: `${durationInDays} days`
      });
      if (error) throw error;
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
                {(f.label || f.feature_name)} (₦{f.unlock_price} / {f.duration_value} {f.duration_type})
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