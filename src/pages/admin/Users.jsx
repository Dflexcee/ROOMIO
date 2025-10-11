import React, { useState, useEffect } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import config from "../../config/api.js";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.users));
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        setError('Error fetching users: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      setError('Error fetching users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId, action) => {
    if (!userId) {
      alert(`Error: User ID is missing`);
      return;
    }
    
    // For status-changing actions, show reason modal first
    if (['suspend', 'ban', 'activate', 'deactivate'].includes(action)) {
      setPendingAction({ userId, action });
      setShowReasonModal(true);
      return;
    }
    
    // For other actions, proceed directly
    await executeAction(userId, action, '');
  };

  const executeAction = async (userId, action, reason) => {
    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.users), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          action: action,
          reason: reason,
          admin_id: 1 // You can get this from auth context
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert(`${action} successful for user ${userId}`);
        
        // Update local state
        setUsers(prev => prev.map(user => {
          if (user.id === userId) {
            let updatedUser = { ...user };
            if (action === 'verify') {
              updatedUser.is_verified = 1;
            } else if (action === 'activate') {
              updatedUser.status = 'active';
            } else if (action === 'suspend') {
              updatedUser.status = 'suspended';
            } else if (action === 'ban') {
              updatedUser.status = 'banned';
            } else if (action === 'deactivate') {
              updatedUser.status = 'inactive';
            }
            updatedUser.status_reason = reason;
            updatedUser.status_changed_at = new Date().toISOString();
            return updatedUser;
          }
          return user;
        }));
      } else {
        alert(`Failed to ${action} user: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error ${action} user: ${error.message}`);
    }
  };

  const handleReasonSubmit = async () => {
    if (pendingAction) {
      await executeAction(pendingAction.userId, pendingAction.action, reasonText);
      setShowReasonModal(false);
      setPendingAction(null);
      setReasonText('');
    }
  };

  const getStatusBadge = (user) => {
    if (user.status === 'banned') {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Banned</span>;
    } else if (user.status === 'suspended') {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Suspended</span>;
    } else if (user.is_verified) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Verified</span>;
    } else {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Unverified</span>;
    }
  };

  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [reasonText, setReasonText] = useState('');

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowModal(false);
  };

  // Handle local field changes (just update the UI)
  const handleFieldChange = (field, value) => {
    setSelectedUser(prev => ({ ...prev, [field]: value }));
  };

  // Save all changes to database
  const handleSaveProfile = async () => {
    if (!selectedUser) return;
    
    console.log('Saving profile for user:', selectedUser.id);
    console.log('Profile data:', selectedUser);
    
    try {
      const requestBody = {
        user_id: selectedUser.id,
        action: 'update_profile',
        field: 'bulk_update',
        profile_data: selectedUser
      };
      
      console.log('Request body:', requestBody);
      console.log('API URL:', config.getUrl(config.endpoints.admin.users));
      
      // Try the main API URL first
      let apiUrl = config.getUrl(config.endpoints.admin.users);
      console.log('Trying API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.success) {
        alert('Profile updated successfully');
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id ? selectedUser : user
        ));
      } else {
        alert('Failed to update profile: ' + (data.error || data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Try alternative API URL as fallback
      try {
        console.log('Trying fallback API URL...');
        const fallbackUrl = config.getUrl('/admin/users-clean.php');
        const fallbackResponse = await fetch(fallbackUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });
        
        const fallbackData = await fallbackResponse.json();
        console.log('Fallback response:', fallbackData);
        
        if (fallbackResponse.ok && fallbackData.success) {
          alert('Profile updated successfully (via fallback)');
          setUsers(prev => prev.map(user => 
            user.id === selectedUser.id ? selectedUser : user
          ));
          return;
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
      
      alert('Error updating profile: ' + error.message);
    }
  };

  const getActionButtons = (user) => {
    return (
      <div className="flex space-x-2 flex-wrap">
        <button
          onClick={() => handleViewProfile(user)}
          className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
        >
          View
        </button>
        <button
          onClick={() => handleAction(user.id, 'verify')}
          className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
        >
          Verify
        </button>
        <button
          onClick={() => handleAction(user.id, 'check_online')}
          className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-xs hover:bg-purple-200"
        >
          Check Online
        </button>
        {user.status === 'active' ? (
          <button
            onClick={() => handleAction(user.id, 'deactivate')}
            className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-xs hover:bg-gray-200"
          >
            Deactivate
          </button>
        ) : (
          <button
            onClick={() => handleAction(user.id, 'activate')}
            className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
          >
            Activate
          </button>
        )}
        <button
          onClick={() => handleAction(user.id, 'suspend')}
          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs hover:bg-yellow-200"
        >
          Suspend
        </button>
        <button
          onClick={() => handleAction(user.id, 'ban')}
          className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
        >
          Ban
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Loading users...</p>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4">👥 User Management</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getActionButtons(user)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Profile Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">User Profile: {selectedUser.full_name}</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6">
              {/* Profile Picture Section */}
              <div className="mb-6 text-center">
                <div className="inline-block">
                  {selectedUser.avatar_url ? (
                    <img
                      src={selectedUser.avatar_url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600">
                      {selectedUser.full_name ? selectedUser.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <div className="mt-2">
                      <input
                        type="url"
                        placeholder="Avatar URL"
                        value={selectedUser.avatar_url || ''}
                        onChange={(e) => handleFieldChange('avatar_url', e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 w-64"
                      />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div>
                  <h4 className="font-semibold mb-3">Basic Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        value={selectedUser.full_name || ''}
                        onChange={(e) => handleFieldChange('full_name', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={selectedUser.email || ''}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="text"
                        value={selectedUser.phone || ''}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Age</label>
                      <input
                        type="number"
                        value={selectedUser.age || ''}
                        onChange={(e) => handleFieldChange('age', parseInt(e.target.value) || null)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <select
                        value={selectedUser.gender || ''}
                        onChange={(e) => handleFieldChange('gender', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">University</label>
                      <input
                        type="text"
                        value={selectedUser.university || ''}
                        onChange={(e) => handleFieldChange('university', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Department</label>
                      <input
                        type="text"
                        value={selectedUser.department || ''}
                        onChange={(e) => handleFieldChange('department', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">About Me</label>
                      <textarea
                        value={selectedUser.about_me || ''}
                        onChange={(e) => handleFieldChange('about_me', e.target.value)}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div>
                  <h4 className="font-semibold mb-3">Account Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">User ID</label>
                      <input
                        type="text"
                        value={selectedUser.id}
                        disabled
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <select
                        value={selectedUser.role}
                        onChange={(e) => handleFieldChange('role', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="landlord">Landlord</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={selectedUser.status}
                        onChange={(e) => handleFieldChange('status', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Verified</label>
                      <select
                        value={selectedUser.is_verified}
                        onChange={(e) => handleFieldChange('is_verified', parseInt(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value={0}>Unverified</option>
                        <option value={1}>Verified</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email Confirmed</label>
                      <select
                        value={selectedUser.email_confirmed}
                        onChange={(e) => handleFieldChange('email_confirmed', parseInt(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value={0}>Not Confirmed</option>
                        <option value={1}>Confirmed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created At</label>
                      <input
                        type="text"
                        value={selectedUser.created_at}
                        disabled
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                      />
                    </div>
                    {selectedUser.status_reason && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status Reason</label>
                        <textarea
                          value={selectedUser.status_reason}
                          disabled
                          rows={2}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                        />
                      </div>
                    )}
                    {selectedUser.status_changed_at && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status Changed At</label>
                        <input
                          type="text"
                          value={new Date(selectedUser.status_changed_at).toLocaleString()}
                          disabled
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-between">
                <div className="text-sm text-gray-500">
                  * Make changes above and click Save to update the database
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCloseModal}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reason Modal */}
      {showReasonModal && pendingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold">
                {pendingAction.action === 'suspend' && 'Suspend User'}
                {pendingAction.action === 'ban' && 'Ban User'}
                {pendingAction.action === 'activate' && 'Activate User'}
                {pendingAction.action === 'deactivate' && 'Deactivate User'}
              </h3>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for {pendingAction.action}:
                </label>
                <textarea
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  placeholder={`Enter reason for ${pendingAction.action}...`}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowReasonModal(false);
                    setPendingAction(null);
                    setReasonText('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReasonSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Confirm {pendingAction.action}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}