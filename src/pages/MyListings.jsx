import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import DarkModeToggle from "../components/common/DarkModeToggle";
import config from "../config/api";
import { useCurrency } from "../contexts/CurrencyContext";
import Alert from "../components/common/Alert";
import LoadingSpinner from "../components/common/LoadingSpinner";
import LazyImage from "../components/common/LazyImage";

export default function MyListings() {
  const { currency } = useCurrency();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(config.getUrl(config.endpoints.listings.mine), {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        setListings(data.listings || []);
      } else {
        setError(data.error || 'Failed to fetch listings');
      }
    } catch (error) {
      setError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (listingId) => {
    try {
      const response = await fetch(config.getUrl(config.endpoints.listings.delete), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ listing_id: listingId })
      });

      const data = await response.json();

      if (response.ok) {
        setListings(listings.filter(l => l.id !== listingId));
        setDeleteConfirm(null);
        alert('Listing deleted successfully!');
      } else {
        alert(data.error || 'Failed to delete listing');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  };

  const openModal = (listing) => {
    setSelectedListing(listing);
    setImageIndex(0);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'approved': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'suspended': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
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

  const ListingModal = ({ listing, onClose }) => {
    const images = Array.isArray(listing.images) && listing.images.length > 0
      ? listing.images
      : ['/default-listing.jpg'];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white text-3xl"
            onClick={onClose}
          >
            ×
          </button>

          <div className="mb-6">
            <LazyImage
              src={images[imageIndex]}
              alt={listing.title}
              className="w-full h-96 object-cover rounded-lg border-4 border-blue-200 dark:border-pink-400"
            />
            {images.length > 1 && (
              <>
                <div className="flex justify-center gap-3 mt-3">
                  <button
                    onClick={() => setImageIndex((imageIndex - 1 + images.length) % images.length)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                  >
                    ← Prev
                  </button>
                  <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                    {imageIndex + 1} / {images.length}
                  </span>
                  <button
                    onClick={() => setImageIndex((imageIndex + 1) % images.length)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                  >
                    Next →
                  </button>
                </div>
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <LazyImage
                      key={idx}
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                        idx === imageIndex ? 'border-blue-500' : 'border-gray-300'
                      }`}
                      onClick={() => setImageIndex(idx)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <h2 className="text-3xl font-bold mb-3 text-blue-700 dark:text-pink-400">
            {listing.title}
          </h2>
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusBadge(listing.status)}`}>
              {listing.status}
            </span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
            {currency.currency_symbol}{Number(listing.price).toLocaleString()}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
            {listing.description}
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="text-gray-600 dark:text-gray-400">
              <strong>Location:</strong> {listing.location}
            </div>
            {listing.specifications && (
              <div className="text-gray-600 dark:text-gray-400">
                <strong>Specifications:</strong> {listing.specifications}
              </div>
            )}
            <div className="text-gray-600 dark:text-gray-400">
              <strong>Views:</strong> {listing.views || 0}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              <strong>Posted:</strong> {new Date(listing.created_at).toLocaleDateString()}
            </div>
          </div>

          {listing.status_reason && (listing.status === 'rejected' || listing.status === 'suspended') && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mb-4">
              <p className="text-sm text-red-800 dark:text-red-400">
                <strong>Reason:</strong> {listing.status_reason}
              </p>
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Contact Information</h3>
            {listing.contact_phone && (
              <div className="mb-2 text-gray-700 dark:text-gray-300">
                <strong>Phone:</strong> {listing.contact_phone}
              </div>
            )}
            {listing.contact_email && (
              <div className="mb-2 text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> {listing.contact_email}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  const DeleteConfirmModal = ({ listing, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Confirm Delete
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to delete "<strong>{listing.title}</strong>"? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(listing.id)}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <div className="flex justify-center pt-4">
        <DarkModeToggle />
      </div>
      <Navbar />
      <div className="pt-16">
      <div className="flex-1 p-4">
        <div className="w-full max-w-7xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400 text-center">
            📋 My Listings
          </h2>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl shadow p-4 border border-blue-200 dark:border-blue-700">
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                {listings.length}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-500">Total</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl shadow p-4 border border-yellow-200 dark:border-yellow-700">
              <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">
                {listings.filter(l => l.status === 'pending').length}
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-500">Pending</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl shadow p-4 border border-green-200 dark:border-green-700">
              <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                {listings.filter(l => l.status === 'approved').length}
              </div>
              <div className="text-sm text-green-600 dark:text-green-500">Approved</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl shadow p-4 border border-red-200 dark:border-red-700">
              <div className="text-3xl font-bold text-red-700 dark:text-red-400">
                {listings.filter(l => l.status === 'rejected' || l.status === 'suspended').length}
              </div>
              <div className="text-sm text-red-600 dark:text-red-500">Rejected</div>
            </div>
          </div>

          <Alert type="error" message={error} onClose={() => setError(null)} />

          {loading ? (
            <LoadingSpinner size="md" message="Loading your listings..." />
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">You haven't posted any listings yet</p>
              <button
                onClick={() => navigate('/post-listing')}
                className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 dark:from-blue-700 dark:to-purple-700 text-white rounded-full font-semibold shadow-lg hover:scale-105 transition"
              >
                Post Your First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-blue-100 dark:border-gray-700"
                >
                  <div className="relative">
                    {Array.isArray(listing.images) && listing.images.length > 0 ? (
                      <LazyImage
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-6xl">{getTypeIcon(listing.type)}</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(listing.status)}`}>
                        {listing.status}
                      </span>
                    </div>
                    {Array.isArray(listing.images) && listing.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                        📷 {listing.images.length}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-semibold capitalize">
                        {listing.type}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-blue-700 dark:text-pink-400 mb-2 line-clamp-2">
                      {listing.title}
                    </h3>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {currency.currency_symbol}{Number(listing.price).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      📍 {listing.location}
                    </p>

                    {listing.status_reason && (listing.status === 'rejected' || listing.status === 'suspended') && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 mb-3">
                        <p className="text-xs text-red-800 dark:text-red-400">
                          <strong>Reason:</strong> {listing.status_reason}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span>👁️ {listing.views || 0} views</span>
                      <span>📅 {new Date(listing.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(listing)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-700 dark:to-purple-700 text-white px-3 py-2 rounded-lg font-semibold text-sm shadow hover:scale-105 transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/edit-listing/${listing.id}`)}
                        className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded-lg font-semibold text-sm shadow hover:bg-yellow-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(listing)}
                        className="bg-red-500 text-white px-3 py-2 rounded-lg font-semibold text-sm shadow hover:bg-red-600 transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showModal && selectedListing && (
            <ListingModal listing={selectedListing} onClose={() => setShowModal(false)} />
          )}

          {deleteConfirm && (
            <DeleteConfirmModal
              listing={deleteConfirm}
              onConfirm={handleDelete}
              onCancel={() => setDeleteConfirm(null)}
            />
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
