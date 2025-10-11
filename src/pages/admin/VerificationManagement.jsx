import React, { useEffect, useState } from 'react';
import PageWrapper from '../../components/common/PageWrapper';
import config from '../../config/api.js';
import LazyImage from '../../components/common/LazyImage';
import { toAbsoluteImageUrl } from '../../utils/urlHelper';

export default function VerificationManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [action, setAction] = useState('');
  const [filter, setFilter] = useState('all');
  const [settings, setSettings] = useState({ require_verification_posting: 1, require_verification_rooms: 0, require_verification_listings: 0 });
  const [viewingVerification, setViewingVerification] = useState(null);
  const [showVerificationDetails, setShowVerificationDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchSettings();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.users), {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.users) {
          setUsers(data.users);
          setError('');
        } else {
          setError('No users data received');
        }
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationDetails = async (userId) => {
    try {
      const response = await fetch(config.getUrl(`/verification/details.php?user_id=${userId}`), {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.verification) {
          setViewingVerification(data.verification);
          setShowVerificationDetails(true);
        } else {
          alert('No verification data found for this user');
        }
      } else {
        alert('Failed to fetch verification details');
      }
    } catch (error) {
      console.error('Error fetching verification details:', error);
      alert('Error: ' + error.message);
    }
  };

  const togglePerType = async (user, key, nextValue) => {
    const scope = key === 'verified_for_rooms' ? 'rooms' : 'listings';
    const action = nextValue ? 'approve_verification' : 'reset_verification';
    try {
      const res = await fetch(config.getUrl(config.endpoints.admin.verificationActions), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: user.id, action, scope, reason: `Per-user ${scope} toggle` })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, [key]: nextValue ? 1 : 0 } : u));
      } else {
        alert(data.error || 'Failed to update');
      }
    } catch (e) {
      alert(e.message || 'Network error');
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(config.getUrl(config.endpoints.admin.verificationSettings), { credentials: 'include' });
      const ct = res.headers.get('content-type') || '';
      const txt = await res.text();
      const data = ct.includes('application/json') ? (() => { try { return JSON.parse(txt); } catch { return {}; } })() : {};
      if (res.ok && data.settings) setSettings(data.settings);
    } catch {}
  };

  const updateSettings = async (patch) => {
    try {
      const res = await fetch(config.getUrl(config.endpoints.admin.verificationSettings), {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      const data = await res.json();
      if (res.ok && data.settings) setSettings(data.settings);
    } catch {}
  };

  const handleVerificationAction = (user, actionType) => {
    setSelectedUser(user);
    setAction(actionType);
    setAdminMessage('');
    setShowModal(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedUser || !action) return;

    try {
      // Use NEW verification-actions endpoint that ONLY affects posting
      const response = await fetch(config.getUrl(config.endpoints.admin.verificationActions), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_id: selectedUser.id,
          action: action,
          reason: adminMessage || `Verification ${action} by admin`,
          scope: scope
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message || 'Action completed successfully!');
        setShowModal(false);
        setSelectedUser(null);
        setAction('');
        setAdminMessage('');
        fetchUsers(); // Refresh the list
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Verification action error:', error);
      alert('Error: ' + error.message);
    }
  };

  const [scope, setScope] = useState('global');

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'unverified') return user.verification_status === 'unverified';
    if (filter === 'pending') return user.verification_status === 'pending';
    if (filter === 'verified') return user.verification_status === 'verified';
    if (filter === 'rejected') return user.verification_status === 'rejected';
    if (filter === 'suspended') return user.verification_status === 'suspended';
    return true;
  });

  const getVerificationBadge = (status) => {
    const badges = {
      unverified: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-orange-100 text-orange-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getAccountTypeBadge = (type) => {
    const badges = {
      student: 'bg-blue-100 text-blue-800',
      tenant: 'bg-purple-100 text-purple-800',
      landlord: 'bg-green-100 text-green-800',
      agent: 'bg-orange-100 text-orange-800',
      individual: 'bg-gray-100 text-gray-800'
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verification Management</h1>
          <p className="text-gray-600">
            Manage user verification status. <strong>This ONLY affects posting ability</strong> - users keep dashboard access.
          </p>
        </div>

        {/* Important Notice */}
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <h3 className="font-semibold text-blue-900 mb-2">⚠️ Important: Verification vs Account Status</h3>
          <div className="text-sm text-blue-800">
            <p className="mb-2"><strong>Verification Actions (This Page):</strong></p>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong>Approve</strong> → User can post rooms (keeps all other access)</li>
              <li><strong>Reject</strong> → User cannot post, sees rejection reason (keeps all other access)</li>
              <li><strong>Suspend</strong> → User cannot post, sees suspension notice (keeps all other access)</li>
              <li><strong>Reset</strong> → User needs to verify again (keeps all other access)</li>
            </ul>
            <p className="mt-3"><strong>To ban/suspend entire account:</strong> Go to <a href="/admin/users" className="underline font-semibold">User Management</a> page instead</p>
          </div>
        </div>

        {/* Global Verification Toggles */}
        <div className="mb-6 p-4 bg-white border rounded">
          <h3 className="font-semibold mb-3">Posting Verification Policy</h3>
          <div className="flex flex-col gap-2 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={!!settings.require_verification_posting} onChange={(e) => updateSettings({ require_verification_posting: e.target.checked ? 1 : 0 })} />
              <span>Require verification to post (global)</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={!!settings.require_verification_rooms} onChange={(e) => updateSettings({ require_verification_rooms: e.target.checked ? 1 : 0 })} />
              <span>Additionally require for Rooms only (overrides when enabled)</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={!!settings.require_verification_listings} onChange={(e) => updateSettings({ require_verification_listings: e.target.checked ? 1 : 0 })} />
              <span>Additionally require for Listings only (overrides when enabled)</span>
            </label>
            <div className="text-xs text-gray-500 mt-1">Admins and managers always bypass verification.</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'unverified', 'pending', 'verified', 'rejected', 'suspended'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {' '}
              ({users.filter(u => f === 'all' || u.verification_status === f).length})
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading users...</div>
          </div>
        )}

        {/* Users Table */}
        {!loading && filteredUsers.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verification Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Per-Type Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {user.avatar_url ? (
                              <LazyImage
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.avatar_url}
                                alt={user.full_name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                {(user.full_name || user.email).charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.full_name || 'No name'}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccountTypeBadge(user.account_type)}`}>
                          {user.account_type || 'individual'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVerificationBadge(user.verification_status)}`}>
                          {user.verification_status || 'unverified'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                          user.status === 'banned' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => fetchVerificationDetails(user.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
                          >
                            👁 View Details
                          </button>
                          {user.verification_status !== 'verified' && (
                            <button
                              onClick={() => handleVerificationAction(user, 'approve_verification')}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium"
                            >
                              ✓ Approve
                            </button>
                          )}
                          {user.verification_status === 'pending' && (
                            <button
                              onClick={() => handleVerificationAction(user, 'reject_verification')}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium"
                            >
                              ✗ Reject
                            </button>
                          )}
                          {user.verification_status === 'verified' && (
                            <button
                              onClick={() => handleVerificationAction(user, 'suspend_verification')}
                              className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs font-medium"
                            >
                              ⏸ Suspend
                            </button>
                          )}
                          {(user.verification_status === 'verified' || user.verification_status === 'suspended') && (
                            <button
                              onClick={() => handleVerificationAction(user, 'reset_verification')}
                              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs font-medium"
                            >
                              ↻ Reset
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-4">
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={!!user.verified_for_rooms}
                              onChange={(e) => togglePerType(user, 'verified_for_rooms', e.target.checked)}
                            />
                            <span>Rooms</span>
                          </label>
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={!!user.verified_for_listings}
                              onChange={(e) => togglePerType(user, 'verified_for_listings', e.target.checked)}
                            />
                            <span>Listings</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No users found with filter: {filter}</p>
          </div>
        )}

        {/* Action Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">
                {action === 'approve_verification' && '✓ Approve Verification'}
                {action === 'reject_verification' && '✗ Reject Verification'}
                {action === 'suspend_verification' && '⏸ Suspend Verification'}
                {action === 'reset_verification' && '↻ Reset Verification'}
              </h2>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>User:</strong> {selectedUser.full_name || selectedUser.email}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Current Status:</strong> {selectedUser.verification_status}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Scope</label>
                <select value={scope} onChange={(e) => setScope(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="global">Global (rooms + listings)</option>
                  <option value="rooms">Rooms only</option>
                  <option value="listings">Listings only</option>
                </select>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">
                  {action === 'approve_verification' && '✓ User will be able to post rooms and listings'}
                  {action === 'reject_verification' && '✗ User cannot post. They can browse, message, and resubmit verification'}
                  {action === 'suspend_verification' && '⏸ User cannot post. They can browse and message but not submit listings'}
                  {action === 'reset_verification' && '↻ User must complete verification again to post'}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Message (Optional)
                </label>
                <textarea
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter a message for the user..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmitAction}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedUser(null);
                    setAction('');
                    setAdminMessage('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verification Details Modal */}
        {showVerificationDetails && viewingVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-4 sm:p-6 my-4 sm:my-8 max-h-[95vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Verification Details</h2>
                <button
                  onClick={() => {
                    setShowVerificationDetails(false);
                    setViewingVerification(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Personal Information */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-gray-900">{viewingVerification.full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{viewingVerification.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Account Type</label>
                      <p className="text-gray-900">{viewingVerification.account_type || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Submission Date</label>
                      <p className="text-gray-900">{new Date(viewingVerification.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Profile Picture */}
                {viewingVerification.profile_picture && (
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">Profile Picture</h3>
                    <LazyImage
                      src={toAbsoluteImageUrl(viewingVerification.profile_picture)}
                      alt="Profile"
                      className="w-48 h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}

                {/* Government ID */}
                {viewingVerification.government_id_type && (
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">Government ID</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">ID Type</label>
                        <p className="text-gray-900">{viewingVerification.government_id_type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">ID Number</label>
                        <p className="text-gray-900">{viewingVerification.government_id_number || 'N/A'}</p>
                      </div>
                      {viewingVerification.nin && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">NIN</label>
                          <p className="text-gray-900">{viewingVerification.nin}</p>
                        </div>
                      )}
                    </div>
                    {viewingVerification.government_id_image && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-2">ID Document</label>
                        <LazyImage
                          src={toAbsoluteImageUrl(viewingVerification.government_id_image)}
                          alt="Government ID"
                          className="max-w-md w-full object-contain rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* School ID (for students) */}
                {viewingVerification.school_id_type && (
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">School ID</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">ID Type</label>
                        <p className="text-gray-900">{viewingVerification.school_id_type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">ID Number</label>
                        <p className="text-gray-900">{viewingVerification.school_id_number || 'N/A'}</p>
                      </div>
                      {viewingVerification.school_name && (
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-gray-600">School Name</label>
                          <p className="text-gray-900">{viewingVerification.school_name}</p>
                        </div>
                      )}
                    </div>
                    {viewingVerification.school_id_image && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-2">School ID Document</label>
                        <LazyImage
                          src={toAbsoluteImageUrl(viewingVerification.school_id_image)}
                          alt="School ID"
                          className="max-w-md w-full object-contain rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Status Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Status</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Verification Status</label>
                      <p className="text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          viewingVerification.status === 'approved' ? 'bg-green-100 text-green-800' :
                          viewingVerification.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {viewingVerification.status || 'pending'}
                        </span>
                      </p>
                    </div>
                    {viewingVerification.reviewed_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Reviewed At</label>
                        <p className="text-gray-900">{new Date(viewingVerification.reviewed_at).toLocaleString()}</p>
                      </div>
                    )}
                    {viewingVerification.admin_message && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-600">Admin Message</label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded">{viewingVerification.admin_message}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowVerificationDetails(false);
                    setViewingVerification(null);
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}