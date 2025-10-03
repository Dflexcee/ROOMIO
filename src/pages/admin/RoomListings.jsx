import React, { useState, useEffect } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import config from "../../config/api.js";

export default function RoomListings() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [reasonText, setReasonText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(config.getUrl('/admin/rooms-management.php'), {
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setRooms(data.rooms || []);
      } else {
        setError(data.error || 'Failed to fetch rooms');
      }
    } catch (error) {
      setError('Error fetching rooms: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (room, action) => {
    setSelectedRoom(room);
    setPendingAction(action);
    setReasonText('');
    setShowActionModal(true);
  };

  const executeAction = async () => {
    if (!selectedRoom || !pendingAction) return;

    try {
      const response = await fetch(config.getUrl('/admin/rooms-management.php'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          room_id: selectedRoom.id,
          action: pendingAction,
          reason: reasonText || `Room ${pendingAction} by admin`
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Action completed successfully');
        setShowActionModal(false);
        fetchRooms();
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (room) => {
    setSelectedRoom(room);
    setEditFormData({
      title: room.title,
      description: room.description || '',
      rent: room.rent,
      location: room.location,
      bedrooms: room.bedrooms || '',
      bathrooms: room.bathrooms || ''
    });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!selectedRoom) return;

    try {
      const response = await fetch(config.getUrl('/admin/room-edit.php'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          room_id: selectedRoom.id,
          ...editFormData
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Room updated successfully');
        setShowEditModal(false);
        fetchRooms();
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (room) => {
    if (!confirm(`Are you sure you want to delete "${room.title}"?`)) return;

    try {
      const response = await fetch(config.getUrl('/admin/room-delete.php'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ room_id: room.id })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Room deleted successfully');
        fetchRooms();
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = searchTerm === '' ||
      room.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'approved': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'rejected': 'bg-red-100 text-red-800',
      'flagged': 'bg-orange-100 text-orange-800'
    };
    return badges[status] || badges.pending;
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Room Listings Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all room listings - approve, reject, or suspend rooms
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, location, or owner..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {rooms.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Rooms</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-400">
              {rooms.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-500">Pending</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-800 dark:text-green-400">
              {rooms.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-sm text-green-700 dark:text-green-500">Approved</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-800 dark:text-red-400">
              {rooms.filter(r => r.status === 'rejected' || r.status === 'flagged').length}
            </div>
            <div className="text-sm text-red-700 dark:text-red-500">Rejected/Flagged</div>
          </div>
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600 dark:text-gray-400">Loading rooms...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                        rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Rooms Table */}
        {!loading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Room Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {room.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {room.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {room.owner_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {room.owner_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ₦{parseFloat(room.rent || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(room.status)}`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col space-y-1">
                          {room.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(room, 'approve')}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => handleAction(room, 'reject')}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                              >
                                ✗ Reject
                              </button>
                            </>
                          )}
                          {room.status === 'approved' && (
                            <button
                              onClick={() => handleAction(room, 'flag')}
                              className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs"
                            >
                              ⚠ Flag
                            </button>
                          )}
                          {(room.status === 'rejected' || room.status === 'flagged') && (
                            <button
                              onClick={() => handleAction(room, 'approve')}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                            >
                              ✓ Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(room)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                          >
                            ✎ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(room)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRooms.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No rooms found</p>
              </div>
            )}
          </div>
        )}

        {/* Action Modal */}
        {showActionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {pendingAction?.charAt(0).toUpperCase() + pendingAction?.slice(1)} Room
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Room: <strong>{selectedRoom?.title}</strong>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason (optional)
                </label>
                <textarea
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter reason for this action..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200
                           rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Confirm {pendingAction}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Edit Room
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.title || ''}
                    onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editFormData.description || ''}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rent
                    </label>
                    <input
                      type="number"
                      value={editFormData.rent || ''}
                      onChange={(e) => setEditFormData({...editFormData, rent: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editFormData.location || ''}
                      onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      value={editFormData.bedrooms || ''}
                      onChange={(e) => setEditFormData({...editFormData, bedrooms: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      value={editFormData.bathrooms || ''}
                      onChange={(e) => setEditFormData({...editFormData, bathrooms: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200
                           rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}