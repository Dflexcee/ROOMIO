import React, { useState, useEffect } from 'react';
import config from '../../config/api';

export default function PostingAccessManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [accessFilter, setAccessFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalData, setModalData] = useState({
    can_post_rooms: true,
    can_post_listings: true,
    reason: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [search, accessFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: search,
        access_filter: accessFilter
      });

      const response = await fetch(
        config.getUrl(`${config.endpoints.admin.postingAccess}?${params}`),
        {
          method: 'GET',
          credentials: 'include'
        }
      );

      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users:', data.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setModalData({
      can_post_rooms: user.can_post_rooms === 1,
      can_post_listings: user.can_post_listings === 1,
      reason: user.posting_suspended_reason || ''
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    // Validate: if blocking either, reason is required
    if ((!modalData.can_post_rooms || !modalData.can_post_listings) && !modalData.reason.trim()) {
      alert('Please provide a reason for restricting posting access');
      return;
    }

    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.postingAccess), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_id: selectedUser.id,
          can_post_rooms: modalData.can_post_rooms ? 1 : 0,
          can_post_listings: modalData.can_post_listings ? 1 : 0,
          reason: modalData.reason
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Posting access updated successfully');
        setShowModal(false);
        fetchUsers();
      } else {
        alert('Error: ' + (data.error || 'Failed to update'));
      }
    } catch (error) {
      console.error('Error updating posting access:', error);
      alert('Network error. Please try again.');
    }
  };

  const getAccessBadge = (user) => {
    const canRooms = user.can_post_rooms === 1;
    const canListings = user.can_post_listings === 1;

    if (canRooms && canListings) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Full Access</span>;
    } else if (!canRooms && !canListings) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">No Access</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Partial Access</span>;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🔐 User Posting Access Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Control user permissions for posting rooms and property listings
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <select
          value={accessFilter}
          onChange={(e) => setAccessFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Users</option>
          <option value="rooms_blocked">Room Posting Blocked</option>
          <option value="listings_blocked">Listing Posting Blocked</option>
          <option value="all_blocked">Any Posting Blocked</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Room Posting</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Listing Posting</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.full_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                          {user.account_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.can_post_rooms === 1 ? (
                          <span className="text-green-600 font-semibold">✓ Enabled</span>
                        ) : (
                          <span className="text-red-600 font-semibold">✗ Blocked</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.can_post_listings === 1 ? (
                          <span className="text-green-600 font-semibold">✓ Enabled</span>
                        ) : (
                          <span className="text-red-600 font-semibold">✗ Blocked</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getAccessBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => openModal(user)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          Manage Access
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Manage Posting Access
            </h3>

            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
              <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.full_name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.email}</div>
            </div>

            <div className="space-y-4 mb-6">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={modalData.can_post_rooms}
                  onChange={(e) => setModalData({ ...modalData, can_post_rooms: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-gray-900 dark:text-white font-medium">Can Post Rooms</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={modalData.can_post_listings}
                  onChange={(e) => setModalData({ ...modalData, can_post_listings: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-gray-900 dark:text-white font-medium">Can Post Property Listings</span>
              </label>

              {(!modalData.can_post_rooms || !modalData.can_post_listings) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for Restriction *
                  </label>
                  <textarea
                    value={modalData.reason}
                    onChange={(e) => setModalData({ ...modalData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                    placeholder="Explain why posting access is being restricted..."
                  />
                </div>
              )}

              {selectedUser.posting_suspended_reason && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <div className="text-xs text-yellow-800 dark:text-yellow-300 font-semibold mb-1">
                    Current Restriction Reason:
                  </div>
                  <div className="text-sm text-yellow-900 dark:text-yellow-200">
                    {selectedUser.posting_suspended_reason}
                  </div>
                  {selectedUser.posting_suspended_at && (
                    <div className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                      Restricted on: {new Date(selectedUser.posting_suspended_at).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUpdate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Update Access
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}