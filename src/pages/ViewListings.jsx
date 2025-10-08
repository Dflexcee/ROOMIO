import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import DarkModeToggle from "../components/common/DarkModeToggle";
import config from "../config/api";
import { useCurrency } from "../contexts/CurrencyContext";
import LazyImage from "../components/common/LazyImage";

const PAGE_SIZE = 12;

export default function ViewListings() {
  const { currency } = useCurrency();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    search: "",
    minPrice: "",
    maxPrice: "",
    location: ""
  });
  const [page, setPage] = useState(1);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.location) params.append('location', filters.location);

      const url = config.getUrl(`/listings/list.php?${params.toString()}`);
      const response = await fetch(url, { credentials: 'include' });
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

  const openModal = (listing) => {
    setSelectedListing(listing);
    setImageIndex(0);
    setShowModal(true);
  };

  const handleChat = (userId) => {
    navigate(`/chat/${userId}`);
  };

  const totalPages = Math.ceil(listings.length / PAGE_SIZE);
  const paginatedListings = listings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold capitalize">
              {listing.type}
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
          </div>

          {(listing.poster_name || listing.poster_avatar) && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {listing.poster_avatar && (
                <LazyImage
                  src={listing.poster_avatar}
                  alt={listing.poster_name || 'Poster'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                />
              )}
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Posted by {listing.poster_name || 'Unknown'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(listing.created_at).toLocaleDateString()}
                </div>
              </div>
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

          <div className="flex gap-3">
            <button
              onClick={() => handleChat(listing.user_id)}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              💬 Chat with Seller
            </button>
            {listing.contact_phone && (
              <a
                href={`tel:${listing.contact_phone}`}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold text-center"
              >
                📞 Call Now
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <div className="flex justify-center pt-4">
        <DarkModeToggle />
      </div>
      <Navbar />
      <div className="flex-1 p-4">
        <div className="w-full max-w-7xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400 text-center">
            🏘️ Browse Listings
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="land">Land</option>
              <option value="house">House</option>
              <option value="car">Car</option>
              <option value="other">Other</option>
            </select>
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading listings...</p>
            </div>
          ) : paginatedListings.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">No listings found.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform border border-blue-100 dark:border-gray-700"
                  >
                    <LazyImage
                      src={
                        Array.isArray(listing.images) && listing.images.length > 0
                          ? listing.images[0]
                          : '/default-listing.jpg'
                      }
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                      fallback="/default-listing.jpg"
                    />
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
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        📍 {listing.location}
                      </p>
                      {(listing.poster_name || listing.poster_avatar) && (
                        <div className="flex items-center gap-2 mb-3">
                          {listing.poster_avatar && (
                            <LazyImage
                              src={listing.poster_avatar}
                              alt={listing.poster_name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {listing.poster_name}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => openModal(listing)}
                        className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 dark:from-blue-700 dark:to-purple-700 text-white px-4 py-2 rounded-full font-semibold shadow hover:scale-105 transition"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-gray-700 dark:text-gray-300">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {showModal && selectedListing && (
            <ListingModal listing={selectedListing} onClose={() => setShowModal(false)} />
          )}
        </div>
      </div>
    </div>
  );
}