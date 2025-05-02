import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import PageWrapper from "../../components/common/PageWrapper";
import ViewDetailsModal from '../../components/admin/ViewDetailsModal';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First, check if we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error('Authentication error: ' + sessionError.message);
      }

      if (!session) {
        throw new Error('No active session found');
      }

      // Then fetch the user's role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        throw new Error('Error fetching user role: ' + userError.message);
      }

      if (!['admin', 'manager'].includes(userData?.role)) {
        throw new Error('Insufficient permissions to view listings');
      }

      // Finally, fetch the listings
      const { data, error: listingsError } = await supabase
        .from("rooms")
        .select(`
          id,
          title,
          description,
          location,
          rent,
          status,
          posted_at,
          updated_at,
          user_id,
          images,
          amenities,
          users (
            id,
            full_name,
            university,
            email
          )
        `)
        .order("posted_at", { ascending: false });

      if (listingsError) {
        throw new Error('Error fetching listings: ' + listingsError.message);
      }

      setListings(data || []);
    } catch (error) {
      console.error("Error in fetchListings:", error);
      setError(error.message || "Failed to load listings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error: updateError } = await supabase
        .from("rooms")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (updateError) {
        throw new Error('Error updating status: ' + updateError.message);
      }
      
      // Optimistically update the local state
      setListings(listings.map(listing =>
        listing.id === id ? { ...listing, status: newStatus } : listing
      ));

    } catch (error) {
      console.error("Error in updateStatus:", error);
      alert(error.message || "Failed to update listing status. Please try again.");
    }
  };

  // Filter listings based on search and status
  const filteredListings = listings.filter(room => {
    const matchesSearch = (
      (room.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (room.location?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (room.users?.full_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (room.users?.university?.toLowerCase() || "").includes(search.toLowerCase())
    );

    const matchesStatus = statusFilter === "all" || room.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "flagged":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRetry = () => {
    fetchListings();
  };

  const handleViewDetails = (listing) => {
    setSelectedListing(listing);
    setShowModal(true);
  };

  const handleSaveListingChanges = async (updatedData) => {
    try {
      const { error: updateError } = await supabase
        .from("rooms")
        .update({
          title: updatedData.title,
          description: updatedData.description,
          location: updatedData.location,
          rent: updatedData.rent,
          amenities: updatedData.amenities,
          status: updatedData.status
        })
        .eq("id", updatedData.id);

      if (updateError) throw updateError;

      // Update local state
      setListings(listings.map(listing =>
        listing.id === updatedData.id ? { ...listing, ...updatedData } : listing
      ));

      alert("Listing updated successfully!");
    } catch (error) {
      console.error("Error updating listing:", error);
      alert("Failed to update listing: " + error.message);
    }
  };

  const listingFields = [
    // Listing Information Section
    { key: 'title', label: 'Title', type: 'text', fullWidth: true },
    { key: 'description', label: 'Description', type: 'textarea', fullWidth: true },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'rent', label: 'Rent (₦)', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'flagged', label: 'Flagged' }
    ]},
    { key: 'amenities', label: 'Amenities', type: 'textarea' },
    { key: 'images', label: 'Images', type: 'images', fullWidth: true },
    { key: 'posted_at', label: 'Posted At', type: 'text', disabled: true },
    { key: 'updated_at', label: 'Last Updated', type: 'text', disabled: true },
    
    // User Information Section
    { key: 'users.full_name', label: 'Poster Name', type: 'text', disabled: true },
    { key: 'users.email', label: 'Poster Email', type: 'text', disabled: true },
    { key: 'users.university', label: 'University', type: 'text', disabled: true },
    { key: 'users.id', label: 'User ID', type: 'text', disabled: true }
  ];

  const renderTableRow = (room) => (
    <tr key={room.id}>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">
          {room.title}
        </div>
        <div className="text-sm text-gray-500">
          ID: {room.id}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">
          {room.users?.full_name || "N/A"}
        </div>
        <div className="text-sm text-gray-500">
          {room.users?.university || "N/A"}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {room.location || "N/A"}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        ₦{room.rent?.toLocaleString() || "N/A"}
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(room.status)}`}>
          {room.status || "pending"}
        </span>
      </td>
      <td className="px-6 py-4 text-sm font-medium space-x-2">
        <button
          onClick={() => handleViewDetails(room)}
          className="text-blue-600 hover:text-blue-900"
        >
          View Details
        </button>
        {room.status !== "approved" && (
          <button
            onClick={() => updateStatus(room.id, "approved")}
            className="text-green-600 hover:text-green-900"
          >
            Approve
          </button>
        )}
        {room.status !== "rejected" && (
          <button
            onClick={() => updateStatus(room.id, "rejected")}
            className="text-red-600 hover:text-red-900"
          >
            Reject
          </button>
        )}
        {room.status !== "flagged" && (
          <button
            onClick={() => updateStatus(room.id, "flagged")}
            className="text-yellow-600 hover:text-yellow-900"
          >
            Flag
          </button>
        )}
      </td>
    </tr>
  );

  return (
    <PageWrapper>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">🏘️ Listings Management</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
              <button
                onClick={handleRetry}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by title, location, or poster..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded w-full"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Listing Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poster
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span>Loading listings...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No listings found
                    </td>
                  </tr>
                ) : (
                  filteredListings.map(renderTableRow)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add the modal */}
      {showModal && selectedListing && (
        <ViewDetailsModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          data={selectedListing}
          onSave={handleSaveListingChanges}
          title="Listing Details"
          fields={listingFields}
          isEditable={true}
        />
      )}
    </PageWrapper>
  );
} 