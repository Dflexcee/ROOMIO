import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Navbar from "../components/common/Navbar";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 8;

export default function FindRoom() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    gender_preference: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "posted_at",
    sortOrder: "desc"
  });
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
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
          gender_preference,
          conditions,
          role
        `)
        .order("posted_at", { ascending: false });
      if (error) throw error;
      setRooms(data || []);
    } catch (err) {
      setError("Failed to load rooms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filtering logic (in JS, not in query)
  const filteredRooms = rooms.filter(room => {
    if (search && !(
      (room.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (room.location || "").toLowerCase().includes(search.toLowerCase()) ||
      (room.description || "").toLowerCase().includes(search.toLowerCase())
    )) {
      return false;
    }
    if (filters.location && !room.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.gender_preference && room.gender_preference !== filters.gender_preference) {
      return false;
    }
    if (filters.minPrice && Number(room.rent) < parseInt(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && Number(room.rent) > parseInt(filters.maxPrice)) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (filters.sortBy === "rent") {
      return filters.sortOrder === "asc" ? Number(a.rent) - Number(b.rent) : Number(b.rent) - Number(a.rent);
    } else {
      return filters.sortOrder === "asc"
        ? new Date(a.posted_at) - new Date(b.posted_at)
        : new Date(b.posted_at) - new Date(a.posted_at);
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRooms.length / PAGE_SIZE);
  const paginatedRooms = filteredRooms.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Modal for viewing details (with image carousel)
  const RoomDetailsModal = ({ room, onClose }) => {
    const [imgIdx, setImgIdx] = useState(0);
    const images = Array.isArray(room.images) && room.images.length > 0 ? room.images : ["/default-room.jpg"];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg max-w-lg w-full p-6 relative animate-fade-in">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl"
            onClick={onClose}
          >
            &times;
          </button>
          {/* Image carousel */}
          <div className="flex flex-col items-center mb-4">
            <img
              src={images[imgIdx]}
              alt={room.title}
              className="w-full h-56 object-cover rounded border-4 border-blue-200 dark:border-pink-400 mb-2"
            />
            {images.length > 1 && (
              <div className="flex gap-2 mt-2">
                <button onClick={() => setImgIdx((imgIdx - 1 + images.length) % images.length)} className="px-2 py-1 bg-gray-200 rounded">&#8592;</button>
                <span className="text-xs text-gray-600 dark:text-gray-300">{imgIdx + 1} / {images.length}</span>
                <button onClick={() => setImgIdx((imgIdx + 1) % images.length)} className="px-2 py-1 bg-gray-200 rounded">&#8594;</button>
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2 text-blue-700 dark:text-pink-400">{room.title}</h2>
          <p className="mb-2 text-gray-700 dark:text-gray-200">{room.description}</p>
          <div className="mb-2 text-gray-600 dark:text-gray-300"><strong>Location:</strong> {room.location}</div>
          <div className="mb-2 text-gray-600 dark:text-gray-300"><strong>Rent:</strong> ₦{Number(room.rent).toLocaleString()}</div>
          <div className="mb-2 text-gray-600 dark:text-gray-300"><strong>Gender Preference:</strong> {room.gender_preference || "Any"}</div>
          <div className="mb-2 text-gray-600 dark:text-gray-300"><strong>Status:</strong> {room.status}</div>
          <div className="mb-2 text-gray-600 dark:text-gray-300"><strong>Posted at:</strong> {room.posted_at ? new Date(room.posted_at).toLocaleString() : "N/A"}</div>
          <div className="mb-2 text-gray-600 dark:text-gray-300"><strong>Updated at:</strong> {room.updated_at ? new Date(room.updated_at).toLocaleString() : "N/A"}</div>
          <div className="mb-2 text-gray-600 dark:text-gray-300"><strong>Role:</strong> {room.role || "N/A"}</div>
          <div className="mb-2 text-gray-600 dark:text-gray-300"><strong>Conditions:</strong> {room.conditions || "N/A"}</div>
        </div>
      </div>
    );
  };

  const handleChat = (targetUserId) => {
    navigate(`/chat/${targetUserId}`);
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors px-4">
        <div className="w-full max-w-7xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400 drop-shadow-sm transition-all duration-300 text-center">🏠 Find a Room</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
              {error}
            </div>
          )}
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <input
              type="text"
              placeholder="Search by title, location, or description"
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white w-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <input
              type="text"
              placeholder="Location"
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white w-full"
              value={filters.location}
              onChange={e => setFilters({ ...filters, location: e.target.value })}
            />
            <select
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
              value={filters.gender_preference}
              onChange={e => setFilters({ ...filters, gender_preference: e.target.value })}
            >
              <option value="">Gender Preference</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="any">Any</option>
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min Price"
                className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white w-full"
                value={filters.minPrice}
                onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
              />
              <input
                type="number"
                placeholder="Max Price"
                className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white w-full"
                value={filters.maxPrice}
                onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
            <select
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={e => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters({ ...filters, sortBy, sortOrder });
              }}
            >
              <option value="posted_at-desc">Newest First</option>
              <option value="posted_at-asc">Oldest First</option>
              <option value="rent-asc">Price: Low to High</option>
              <option value="rent-desc">Price: High to Low</option>
            </select>
          </div>
          {/* Results Section */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading rooms...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">No available rooms found.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {paginatedRooms.map((room) => (
                  <div key={room.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-blue-100 dark:border-gray-700 flex flex-col hover:scale-[1.01] transition-transform min-h-[320px]">
                    <img
                      src={Array.isArray(room.images) && room.images.length > 0 ? room.images[0] : "/default-room.jpg"}
                      alt={room.title}
                      className="w-full h-32 object-cover rounded mb-2 border-2 border-blue-200 dark:border-pink-400"
                    />
                    <h4 className="font-semibold text-base text-blue-700 dark:text-pink-400 mb-1 truncate">{room.title}</h4>
                    <p className="text-base font-bold text-gray-900 dark:text-white mb-1">₦{Number(room.rent).toLocaleString()}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-1 truncate">{room.location}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                        {room.gender_preference || "Any"}
                      </span>
                    </div>
                    <button
                      onClick={() => { setSelectedRoom(room); setShowModal(true); }}
                      className="mt-2 bg-gradient-to-r from-pink-500 to-yellow-500 dark:from-blue-700 dark:to-purple-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow hover:scale-105 transition"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleChat(room.user_id)}
                      className="mt-2 bg-blue-600 text-white px-4 py-1 rounded text-sm font-semibold shadow hover:bg-blue-700 transition"
                    >
                      💬 Chat with Poster
                    </button>
                  </div>
                ))}
              </div>
              {/* Pagination Controls */}
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
          {showModal && selectedRoom && (
            <RoomDetailsModal room={selectedRoom} onClose={() => setShowModal(false)} />
          )}
        </div>
      </div>
    </>
  );
} 