import React, { useState, useEffect } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import config from "../../config/api.js";
import { useCurrency } from "../../contexts/CurrencyContext";

export default function AllListingsManagement() {
  const { formatCurrency } = useCurrency();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [reasonText, setReasonText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.listingsActions), {
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setListings(data.listings || []);
      } else {
        setError(data.error || 'Failed to fetch listings');
      }
    } catch (error) {
      setError('Error fetching listings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (listing, action) => {
    setSelectedListing(listing);
    setPendingAction(action);
    setReasonText('');
    setShowActionModal(true);
  };

  const executeAction = async () => {
    if (!selectedListing || !pendingAction) return;

    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.listingsActions), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          listing_id: selectedListing.id,
          action: pendingAction,
          reason: reasonText || `Listing ${pendingAction} by admin`
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Action completed successfully');
        setShowActionModal(false);
        fetchListings();
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (listing) => {
    setSelectedListing(listing);

    // Parse images safely
    let parsedImages = [];
    try {
      if (Array.isArray(listing.images)) {
        parsedImages = listing.images;
      } else if (typeof listing.images === 'string' && listing.images.trim()) {
        parsedImages = JSON.parse(listing.images);
      }
    } catch (e) {
      console.error('Error parsing listing images:', e);
      parsedImages = [];
    }

    setEditFormData({
      title: listing.title || '',
      description: listing.description || '',
      price: listing.price || '',
      location: listing.location || '',
      type: listing.type || 'other',
      specifications: listing.specifications || '',
      images: parsedImages,
      contact_phone: listing.contact_phone || '',
      contact_email: listing.contact_email || ''
    });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!selectedListing) return;

    try {
      const response = await fetch(config.getUrl('/admin/listing-edit.php'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          listing_id: selectedListing.id,
          ...editFormData
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Listing updated successfully');
        setShowEditModal(false);
        fetchListings();
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (listing) => {
    if (!confirm(`Are you sure you want to delete "${listing.title}"?`)) return;

    try {
      const response = await fetch(config.getUrl('/admin/listing-delete.php'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ listing_id: listing.id })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Listing deleted successfully');
        fetchListings();
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = searchTerm === '' ||
      listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || listing.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'suspended': 'bg-gray-100 text-gray-800'
    };
    return badges[status] || badges.pending;
  };

  const getTypeIcon = (type) => {
    const icons = {
      'land': '🏞️',
      'house': '🏠',
      'car': '🚗',
      'other': '📦'
    };
    return icons[type] || '📦';
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            All Listings Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all property listings (Land, House, Car, Other)
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                Type Filter
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="land">Land</option>
                <option value="house">House</option>
                <option value="car">Car</option>
                <option value="other">Other</option>
              </select>
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
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {listings.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          {['land', 'house', 'car', 'other'].map(type => (
            <div key={type} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {listings.filter(l => l.type === type).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{type}</div>
            </div>
          ))}
        </div>

        {/* Loading/Error */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600 dark:text-gray-400">Loading listings...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                        rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Listings Table */}
        {!loading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Listing Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-2xl">{getTypeIcon(listing.type)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {listing.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {listing.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {listing.owner_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {listing.owner_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(listing.price || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(listing.status)}`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col space-y-1">
                          {listing.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(listing, 'approve')}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => handleAction(listing, 'reject')}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                              >
                                ✗ Reject
                              </button>
                            </>
                          )}
                          {listing.status === 'approved' && (
                            <button
                              onClick={() => handleAction(listing, 'suspend')}
                              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs"
                            >
                              ⏸ Suspend
                            </button>
                          )}
                          {(listing.status === 'rejected' || listing.status === 'suspended') && (
                            <button
                              onClick={() => handleAction(listing, 'approve')}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                            >
                              ↻ Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(listing)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                          >
                            ✎ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(listing)}
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

            {filteredListings.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No listings found</p>
              </div>
            )}
          </div>
        )}

        {/* Action Modal */}
        {showActionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {pendingAction?.charAt(0).toUpperCase() + pendingAction?.slice(1)} Listing
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Listing: <strong>{selectedListing?.title}</strong>
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
                  Confirm
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
                Edit Listing
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
                      Price
                    </label>
                    <input
                      type="number"
                      value={editFormData.price || ''}
                      onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
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
                      Type
                    </label>
                    <select
                      value={editFormData.type || 'other'}
                      onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="land">Land</option>
                      <option value="house">House</option>
                      <option value="car">Car</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Specifications
                    </label>
                    <input
                      type="text"
                      value={editFormData.specifications || ''}
                      onChange={(e) => setEditFormData({...editFormData, specifications: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Images
                  </label>
                  {Array.isArray(editFormData.images) && editFormData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {editFormData.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={imgUrl}
                            alt={`Listing image ${idx + 1}`}
                            className="w-full h-32 object-cover rounded border border-gray-300"
                            onError={(e) => {
                              e.target.src = '/default-listing.jpg';
                              e.target.onerror = null;
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = editFormData.images.filter((_, i) => i !== idx);
                              setEditFormData({...editFormData, images: newImages});
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <textarea
                    value={Array.isArray(editFormData.images) ? editFormData.images.join('\n') : ''}
                    onChange={(e) => setEditFormData({...editFormData, images: e.target.value.split('\n').filter(url => url.trim())})}
                    rows="2"
                    placeholder="http://example.com/image1.jpg&#10;http://example.com/image2.jpg"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={editFormData.contact_phone || ''}
                      onChange={(e) => setEditFormData({...editFormData, contact_phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.contact_email || ''}
                      onChange={(e) => setEditFormData({...editFormData, contact_email: e.target.value})}
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