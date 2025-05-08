import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import PageWrapper from "../../components/common/PageWrapper";

function EditUserModal({ open, onClose, onSave, form, onChange, saving }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <h3 className="text-lg font-bold mb-4">Edit User Info</h3>
        <label className="block mb-2">
          <span className="text-sm">Full Name</span>
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={onChange}
            className="border p-2 rounded w-full mt-1"
            placeholder="Full Name"
            disabled={saving}
          />
        </label>
        <label className="block mb-4">
          <span className="text-sm">Phone</span>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={onChange}
            className="border p-2 rounded w-full mt-1"
            placeholder="Phone"
            disabled={saving}
          />
        </label>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="bg-green-600 text-white px-4 py-2 rounded"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default function UserAccessManager() {
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payment_details")
        .select("*");
      if (paymentsError) throw paymentsError;
      // Group payments by user
      const userMap = new Map();
      paymentsData.forEach(payment => {
        if (!userMap.has(payment.user_id)) {
          userMap.set(payment.user_id, {
            id: payment.user_id,
            full_name: payment.full_name,
            email: payment.email,
            phone: payment.phone,
            payments: []
          });
        }
        userMap.get(payment.user_id).payments.push(payment);
      });
      setUsers(Array.from(userMap.values()));
      setPayments(paymentsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAccess = async (paymentId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "disabled" : "active";
      const { error } = await supabase
        .from("user_payments")
        .update({ status: newStatus })
        .eq("id", paymentId);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error("Error toggling access:", err);
      setError("Failed to update access. Please try again.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "∞";
    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "disabled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Modal edit handlers
  const startEdit = (user) => {
    setEditUserId(user.id);
    setEditForm({ full_name: user.full_name || "", phone: user.phone || "" });
    setModalOpen(true);
  };
  const closeModal = () => {
    setEditUserId(null);
    setEditForm({ full_name: "", phone: "" });
    setModalOpen(false);
  };
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const saveEdit = async () => {
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: editForm.full_name, phone: editForm.phone })
        .eq("id", editUserId);
      if (error) throw error;
      closeModal();
      await fetchData();
    } catch (err) {
      setError("Failed to update user info. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <EditUserModal
        open={modalOpen}
        onClose={closeModal}
        onSave={saveEdit}
        form={editForm}
        onChange={handleEditChange}
        saving={saving}
      />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">👤 User Access Manager</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 pl-8 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-2 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No users found matching your search.
        </div>
      ) : (
        filteredUsers.map((user) => (
          <div key={user.id} className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{user.full_name || <span className="text-gray-400">No name</span>}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                {user.phone && (
                  <p className="text-sm text-gray-600">{user.phone}</p>
                )}
                <button
                  onClick={() => startEdit(user)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs mt-2"
                >
                  Edit
                </button>
              </div>
              <span className="text-sm text-gray-500">
                {user.payments.length} feature{user.payments.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Feature</th>
                    <th className="p-3 text-left">Price</th>
                    <th className="p-3 text-left">Paid On</th>
                    <th className="p-3 text-left">Expires</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {user.payments.map((pay) => (
                    <tr key={pay.payment_id} className="border-t">
                      <td className="p-3 font-medium">{pay.feature_name}</td>
                      <td className="p-3">₦{pay.unlock_price.toLocaleString()}</td>
                      <td className="p-3">{formatDate(pay.paid_at)}</td>
                      <td className="p-3">{formatDate(pay.expires_at)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(pay.status)}`}>
                          {pay.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleAccess(pay.payment_id, pay.status)}
                          className={`px-3 py-1 text-xs rounded text-white transition-colors ${
                            pay.status === "active" 
                              ? "bg-red-600 hover:bg-red-700" 
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {pay.status === "active" ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </PageWrapper>
  );
} 