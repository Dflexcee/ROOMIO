import React, { useState, useEffect } from "react";
import PageWrapper from "../../components/common/PageWrapper";

export default function ListingsSimple() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - works immediately
    const mockListings = [
      { id: 1, title: 'Beautiful Apartment', location: 'Lagos', rent: 50000, status: 'active', user_id: 1 },
      { id: 2, title: 'Cozy Room', location: 'Abuja', rent: 30000, status: 'pending', user_id: 2 }
    ];
    
    setListings(mockListings);
    setLoading(false);
  }, []);

  const handleStatusUpdate = (listingId, newStatus) => {
    alert(`Status updated to ${newStatus} for listing ${listingId} - Working!`);
    setListings(prev => prev.map(listing => 
      listing.id === listingId ? { ...listing, status: newStatus } : listing
    ));
  };

  if (loading) return <PageWrapper><p>Loading...</p></PageWrapper>;

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4">🏠 Listings Management</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listing</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {listings.map((listing) => (
              <tr key={listing.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {listing.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₦{listing.rent.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {listing.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleStatusUpdate(listing.id, 'active')}
                    className="text-green-600 hover:text-green-900 bg-green-100 px-3 py-1 rounded"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(listing.id, 'flagged')}
                    className="text-red-600 hover:text-red-900 bg-red-100 px-3 py-1 rounded"
                  >
                    Flag
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
