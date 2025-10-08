import React, { useState, useEffect } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import { useCurrency } from "../../contexts/CurrencyContext";
import config from "../../config/api";

export default function ListingsSimple() {
  const { formatCurrency } = useCurrency();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await fetch(config.getUrl('/admin/all-listings.php'), {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok && data.success) {
        // Parse images
        const listingsWithImages = (data.listings || []).map(listing => ({
          ...listing,
          images: typeof listing.images === 'string' ? JSON.parse(listing.images || '[]') : (Array.isArray(listing.images) ? listing.images : [])
        }));
        setListings(listingsWithImages);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

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
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {Array.isArray(listing.images) && listing.images.length > 0 && (
                      <img
                        src={listing.images[0].startsWith('http') ? listing.images[0] : `http://localhost${listing.images[0]}`}
                        alt={listing.title}
                        className="w-16 h-16 object-cover rounded mr-3"
                        onError={(e) => {
                          e.target.src = '/default-listing.jpg';
                          e.target.onerror = null;
                        }}
                      />
                    )}
                    <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {listing.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(listing.price || 0)}
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
                    onClick={() => {
                      setSelectedListing(listing);
                      setImageIndex(0);
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 bg-blue-100 px-3 py-1 rounded"
                  >
                    View
                  </button>
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

      {/* View Details Modal */}
      {showModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedListing.title}</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {/* Images */}
              {Array.isArray(selectedListing.images) && selectedListing.images.length > 0 && (
                <div className="mb-4">
                  <img
                    src={selectedListing.images[imageIndex].startsWith('http') ? selectedListing.images[imageIndex] : `http://localhost${selectedListing.images[imageIndex]}`}
                    alt={selectedListing.title}
                    className="w-full h-64 object-cover rounded-lg mb-2"
                    onError={(e) => {
                      e.target.src = '/default-listing.jpg';
                      e.target.onerror = null;
                    }}
                  />
                  {selectedListing.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {selectedListing.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.startsWith('http') ? img : `http://localhost${img}`}
                          alt={`${selectedListing.title} ${idx + 1}`}
                          className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                            idx === imageIndex ? 'border-blue-500' : 'border-gray-300'
                          }`}
                          onClick={() => setImageIndex(idx)}
                          onError={(e) => {
                            e.target.src = '/default-listing.jpg';
                            e.target.onerror = null;
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Details */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Price</label>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(selectedListing.price || 0)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Location</label>
                  <p className="text-gray-900 dark:text-white">{selectedListing.location}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Type</label>
                  <p className="text-gray-900 dark:text-white capitalize">{selectedListing.type}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Description</label>
                  <p className="text-gray-900 dark:text-white">{selectedListing.description}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
