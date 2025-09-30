import React, { useState, useEffect } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import config from "../../config/api.js";
import currencyManager from "../../utils/currency.js";

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [reasonText, setReasonText] = useState('');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedListings, setSelectedListings] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    fetchListings();
    
    // Listen for currency updates
    const handleCurrencyUpdate = () => {
      // Force re-render to update currency display
      setListings(prev => [...prev]);
    };
    
    window.addEventListener('currencyUpdated', handleCurrencyUpdate);
    window.addEventListener('currencyFormatUpdated', handleCurrencyUpdate);
    
    return () => {
      window.removeEventListener('currencyUpdated', handleCurrencyUpdate);
      window.removeEventListener('currencyFormatUpdated', handleCurrencyUpdate);
    };
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching listings from:', config.getUrl(config.endpoints.admin.listings));
      // Try the simple API first
      const simpleApiUrl = config.getUrl('/admin/listings-simple.php');
      console.log('Trying simple API:', simpleApiUrl);
      const response = await fetch(simpleApiUrl);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        console.log('Listings fetched successfully:', data.listings?.length || 0, 'listings');
        setListings(data.listings || []);
      } else {
        console.error('Simple API failed, trying original API...');
        // Fallback to original API
        const originalResponse = await fetch(config.getUrl(config.endpoints.admin.listings));
        const originalData = await originalResponse.json();
        
        if (originalResponse.ok) {
          console.log('Original API worked:', originalData.listings?.length || 0, 'listings');
          setListings(originalData.listings || []);
        } else {
          console.error('Both APIs failed:', originalData);
          setError('Error fetching listings: ' + (originalData.error || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      setError('Error fetching listings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (listingId, action) => {
    if (!listingId) {
      alert(`Error: Listing ID is missing`);
      return;
    }
    
    // For status-changing actions, show reason modal first
    if (['activate', 'flag', 'pending', 'reject'].includes(action)) {
      setPendingAction({ listingId, action });
      setShowReasonModal(true);
      return;
    }
    
    // For other actions, proceed directly
    await executeAction(listingId, action, '');
  };

  const executeAction = async (listingId, action, reason) => {
    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.listings), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          listing_id: listingId,
          action: action,
          reason: reason,
          admin_id: 1 // You can get this from auth context
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert(`${action} successful for listing ${listingId}`);
        
        // Update local state
        setListings(prev => prev.map(listing => {
          if (listing.id === listingId) {
            let updatedListing = { ...listing };
            if (action === 'activate') {
              updatedListing.status = 'active';
            } else if (action === 'flag') {
              updatedListing.status = 'flagged';
            } else if (action === 'pending') {
              updatedListing.status = 'pending';
            } else if (action === 'reject') {
              updatedListing.status = 'rejected';
            }
            updatedListing.flagged_reason = reason;
            updatedListing.flagged_at = new Date().toISOString();
            return updatedListing;
          }
          return listing;
        }));
      } else {
        alert(`Failed to ${action} listing: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error ${action} listing: ${error.message}`);
    }
  };

  const handleReasonSubmit = async () => {
    if (pendingAction) {
      await executeAction(pendingAction.listingId, pendingAction.action, reasonText);
      setShowReasonModal(false);
      setPendingAction(null);
      setReasonText('');
    }
  };

  const handleViewDetails = (listing) => {
    setSelectedListing(listing);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedListing(null);
  };

  // Filter and search functionality
  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.owner_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle field changes for editing
  const handleFieldChange = (field, value) => {
    setSelectedListing(prev => ({ ...prev, [field]: value }));
  };

  // Save listing changes
  const handleSaveListing = async () => {
    if (!selectedListing) return;
    
    console.log('Saving listing for ID:', selectedListing.id);
    console.log('Listing data:', selectedListing);
    
    try {
      const requestBody = {
        listing_id: selectedListing.id,
        action: 'update_listing',
        field: 'bulk_update',
        listing_data: selectedListing
      };
      
      console.log('Request body:', requestBody);
      console.log('API URL:', config.getUrl(config.endpoints.admin.listings));
      
      const response = await fetch(config.getUrl(config.endpoints.admin.listings), {
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
        alert('Listing updated successfully');
        // Update local state
        setListings(prev => prev.map(listing => 
          listing.id === selectedListing.id ? selectedListing : listing
        ));
      } else {
        alert('Failed to update listing: ' + (data.error || data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      alert('Error updating listing: ' + error.message);
    }
  };

  // Bulk actions
  const handleSelectListing = (listingId) => {
    setSelectedListings(prev => 
      prev.includes(listingId) 
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const handleSelectAll = () => {
    if (selectedListings.length === filteredListings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(filteredListings.map(listing => listing.id));
    }
  };

  const handleBulkAction = (action) => {
    if (selectedListings.length === 0) {
      alert('Please select at least one listing');
      return;
    }
    setBulkAction(action);
    setShowBulkModal(true);
  };

  const executeBulkAction = async () => {
    if (selectedListings.length === 0 || !bulkAction) return;

    try {
      const promises = selectedListings.map(listingId => 
        executeAction(listingId, bulkAction, reasonText)
      );
      
      await Promise.all(promises);
      
      alert(`Bulk ${bulkAction} completed for ${selectedListings.length} listings`);
      setSelectedListings([]);
      setShowBulkModal(false);
      setBulkAction('');
      setReasonText('');
    } catch (error) {
      alert(`Error in bulk ${bulkAction}: ${error.message}`);
    }
  };

  // Export functionality
  const exportToCSV = () => {
    const dataToExport = filteredListings.map(listing => ({
      'ID': listing.id,
      'Title': listing.title,
      'Description': listing.description,
      'Location': listing.location,
      'Rent': currencyManager.formatCurrency(listing.rent),
      'Status': listing.status,
      'Bedrooms': listing.bedrooms,
      'Bathrooms': listing.bathrooms,
      'Area': listing.area,
      'Owner Name': listing.owner_name,
      'Owner Email': listing.owner_email,
      'Contact Phone': listing.contact_phone,
      'Contact Email': listing.contact_email,
      'Created At': listing.created_at,
      'Amenities': listing.amenities ? listing.amenities.join(', ') : '',
      'Flagged Reason': listing.flagged_reason || ''
    }));

    const csvContent = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `listings_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const dataToExport = filteredListings;
    const jsonContent = JSON.stringify(dataToExport, null, 2);
    
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `listings_export_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading listings...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching data from database...</p>
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

  // Calculate statistics
  const stats = {
    total: listings.length,
    active: listings.filter(l => l.status === 'active').length,
    pending: listings.filter(l => l.status === 'pending').length,
    flagged: listings.filter(l => l.status === 'flagged').length,
    rejected: listings.filter(l => l.status === 'rejected').length,
    totalRevenue: listings.reduce((sum, l) => sum + (l.rent || 0), 0),
    avgRent: listings.length > 0 ? Math.round(listings.reduce((sum, l) => sum + (l.rent || 0), 0) / listings.length) : 0
  };

  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🏠 Listings Management</h2>
        <div className="text-sm text-gray-500">
          {filteredListings.length} of {listings.length} listings
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">⏳</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 text-xl">🚩</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Flagged</p>
              <p className="text-2xl font-bold text-red-600">{stats.flagged}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">💰</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">{currencyManager.formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <span className="text-indigo-600 text-xl">📈</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Average Rent</p>
              <p className="text-2xl font-bold text-indigo-600">{currencyManager.formatCurrency(stats.avgRent)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug Information</h3>
          <div className="text-xs text-yellow-700 space-y-1">
            <div>Total Listings: {listings.length}</div>
            <div>Filtered Listings: {filteredListings.length}</div>
            <div>Search Term: "{searchTerm}"</div>
            <div>Status Filter: "{statusFilter}"</div>
            <div>Selected Listings: {selectedListings.length}</div>
            <div>Current Currency: {currencyManager.getCurrentCurrency()}</div>
            <div>Currency Symbol: {currencyManager.getCurrencySymbol()}</div>
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Listings</label>
            <input
              type="text"
              placeholder="Search by title, location, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={fetchListings}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              🔄 Refresh
            </button>
            <div className="flex space-x-1">
              <button
                onClick={exportToCSV}
                className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                title="Export to CSV"
              >
                📊 CSV
              </button>
              <button
                onClick={exportToJSON}
                className="bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                title="Export to JSON"
              >
                📄 JSON
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedListings.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedListings.length} listing(s) selected
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  ✅ Activate All
                </button>
                <button
                  onClick={() => handleBulkAction('flag')}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  🚩 Flag All
                </button>
                <button
                  onClick={() => handleBulkAction('pending')}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                >
                  ⏳ Set Pending
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  ❌ Reject All
                </button>
                <button
                  onClick={() => setSelectedListings([])}
                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                <input
                  type="checkbox"
                  checked={selectedListings.length === filteredListings.length && filteredListings.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listing</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredListings.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="text-6xl mb-4">🏠</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
                    <p className="text-gray-500 mb-4">
                      {listings.length === 0 
                        ? "No listings have been created yet. Users can create listings from the main app."
                        : "No listings match your current search or filter criteria."
                      }
                    </p>
                    {listings.length === 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
                        <h4 className="font-semibold text-blue-800 mb-2">Getting Started:</h4>
                        <ul className="text-sm text-blue-700 space-y-1 text-left">
                          <li>• Users can create listings from the main application</li>
                          <li>• Listings will appear here once created</li>
                          <li>• You can manage and moderate all listings from this page</li>
                        </ul>
                      </div>
                    )}
                    <button
                      onClick={fetchListings}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      🔄 Refresh Listings
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredListings.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedListings.includes(listing.id)}
                    onChange={() => handleSelectListing(listing.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-12 w-12">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={listing.images[0]}
                          alt={listing.title}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">{listing.title}</div>
                      <div className="text-sm text-gray-500 truncate">{listing.description}</div>
                      <div className="text-xs text-gray-400">
                        {listing.bedrooms} bed • {listing.bathrooms} bath • {listing.area}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{listing.owner_name}</div>
                  <div className="text-sm text-gray-500">{listing.owner_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {listing.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {currencyManager.formatCurrency(listing.rent || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    listing.status === 'active' ? 'bg-green-100 text-green-800' : 
                    listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    listing.status === 'flagged' ? 'bg-red-100 text-red-800' :
                    listing.status === 'rejected' ? 'bg-gray-100 text-gray-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {listing.status}
                  </span>
                  {listing.flagged_reason && (
                    <div className="text-xs text-gray-500 mt-1 truncate max-w-32" title={listing.flagged_reason}>
                      {listing.flagged_reason}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-1 flex-wrap">
                  <button
                    onClick={() => handleViewDetails(listing)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-100 px-2 py-1 rounded text-xs"
                  >
                    View
                  </button>
                    {listing.status !== 'active' && (
                  <button
                        onClick={() => handleStatusUpdate(listing.id, 'activate')}
                        className="text-green-600 hover:text-green-900 bg-green-100 px-2 py-1 rounded text-xs"
                  >
                    Activate
                  </button>
                    )}
                    {listing.status !== 'flagged' && (
                  <button
                        onClick={() => handleStatusUpdate(listing.id, 'flag')}
                        className="text-red-600 hover:text-red-900 bg-red-100 px-2 py-1 rounded text-xs"
                  >
                    Flag
                  </button>
                    )}
                    {listing.status !== 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(listing.id, 'pending')}
                        className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 px-2 py-1 rounded text-xs"
                  >
                    Pending
                  </button>
                    )}
                    {listing.status !== 'rejected' && (
                      <button
                        onClick={() => handleStatusUpdate(listing.id, 'reject')}
                        className="text-gray-600 hover:text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View/Edit Details Modal */}
      {showModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Listing Management: {selectedListing.title}</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Images */}
                <div>
                  <h4 className="font-semibold mb-3">Images</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedListing.images && selectedListing.images.length > 0 ? (
                      selectedListing.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${selectedListing.title} ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      ))
                    ) : (
                      <div className="col-span-2 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">No images available</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Info - Editable */}
                <div>
                  <h4 className="font-semibold mb-3">Basic Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={selectedListing.title || ''}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={selectedListing.location || ''}
                        onChange={(e) => handleFieldChange('location', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rent ({currencyManager.getCurrencySymbol()})</label>
                      <input
                        type="number"
                        value={selectedListing.rent || 0}
                        onChange={(e) => handleFieldChange('rent', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={selectedListing.status || 'pending'}
                        onChange={(e) => handleFieldChange('status', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="flagged">Flagged</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description - Editable */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Description</h4>
                <textarea
                  value={selectedListing.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter listing description..."
                />
              </div>

              {/* Property Details - Editable */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-3">Property Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                      <input
                        type="number"
                        value={selectedListing.bedrooms || 0}
                        onChange={(e) => handleFieldChange('bedrooms', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                      <input
                        type="number"
                        value={selectedListing.bathrooms || 0}
                        onChange={(e) => handleFieldChange('bathrooms', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                      <input
                        type="text"
                        value={selectedListing.area || ''}
                        onChange={(e) => handleFieldChange('area', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 1200 sq ft"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Amenities</h4>
                  <textarea
                    value={selectedListing.amenities ? selectedListing.amenities.join(', ') : ''}
                    onChange={(e) => handleFieldChange('amenities', e.target.value.split(',').map(a => a.trim()).filter(a => a))}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amenities separated by commas..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate amenities with commas</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={selectedListing.contact_phone || ''}
                        onChange={(e) => handleFieldChange('contact_phone', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={selectedListing.contact_email || ''}
                        onChange={(e) => handleFieldChange('contact_email', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                      <div className="text-sm text-gray-600">
                        {selectedListing.owner_name} ({selectedListing.owner_email})
                      </div>
                      <div className="text-xs text-gray-500">User ID: {selectedListing.user_id}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Created: {selectedListing.created_at ? new Date(selectedListing.created_at).toLocaleString() : 'Unknown'}
                  {selectedListing.flagged_reason && (
                    <div className="mt-1">
                      <strong>Flag Reason:</strong> {selectedListing.flagged_reason}
                    </div>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveListing}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    💾 Save Changes
                  </button>
                  <button
                    onClick={closeModal}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold">
                {pendingAction?.action === 'activate' ? 'Activate' : 
                 pendingAction?.action === 'flag' ? 'Flag' : 
                 pendingAction?.action === 'pending' ? 'Set to Pending' : 
                 pendingAction?.action === 'reject' ? 'Reject' : 'Action'} Listing
              </h3>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for {pendingAction?.action}:
                </label>
                <textarea
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter reason for this action..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowReasonModal(false);
                    setPendingAction(null);
                    setReasonText('');
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReasonSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold">
                Bulk {bulkAction === 'activate' ? 'Activate' : 
                      bulkAction === 'flag' ? 'Flag' : 
                      bulkAction === 'pending' ? 'Set to Pending' : 
                      bulkAction === 'reject' ? 'Reject' : 'Action'} Listings
              </h3>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  You are about to {bulkAction} {selectedListings.length} listing(s). This action will be applied to all selected listings.
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for bulk {bulkAction}:
                </label>
                <textarea
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter reason for this bulk action..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkAction('');
                    setReasonText('');
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={executeBulkAction}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Confirm Bulk Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}