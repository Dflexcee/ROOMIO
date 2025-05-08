import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import PageWrapper from "../../components/common/PageWrapper";

export default function AdminManagerDetails() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);

  useEffect(() => {
    fetchCurrentRole();
    fetchUsers();
  }, []);

  const fetchCurrentRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      setCurrentRole(profile?.role);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_manager_details")
      .select("*")
      .order("user_created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const startEdit = (user) => {
    setEditId(user.id);
    setEditForm({
      full_name: user.full_name || "",
      phone: user.phone || "",
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ full_name: "", phone: "" });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    setSaving(true);
    await supabase
      .from("profiles")
      .upsert({ id: editId, full_name: editForm.full_name, phone: editForm.phone });
    setSaving(false);
    setEditId(null);
    setEditForm({ full_name: "", phone: "" });
    fetchUsers();
  };

  if (currentRole !== "admin") {
    return (
      <PageWrapper>
        <div className="text-center text-red-600 mt-10">
          You do not have permission to view this page.
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4">Admin & Manager Details</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">Loading...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">No admins or managers found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{user.role}</span>
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    {editId === user.id ? (
                      <input
                        type="text"
                        name="full_name"
                        value={editForm.full_name}
                        onChange={handleEditChange}
                        className="border p-1 rounded w-32"
                        disabled={saving}
                      />
                    ) : (
                      user.full_name || <span className="text-gray-400">No name</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editId === user.id ? (
                      <input
                        type="text"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleEditChange}
                        className="border p-1 rounded w-32"
                        disabled={saving}
                      />
                    ) : (
                      user.phone || <span className="text-gray-400">No phone</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{new Date(user.user_created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {editId === user.id ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs mr-2"
                          disabled={saving}
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-400 text-white px-3 py-1 rounded text-xs"
                          disabled={saving}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(user)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
} 