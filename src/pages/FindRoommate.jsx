import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Navbar from "../components/common/Navbar";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 8;

export default function FindRoommate() {
  const [allUsers, setAllUsers] = useState([]);
  const [filters, setFilters] = useState({
    gender: "",
    religion: "",
    lifestyle: "",
    university: "",
  });
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tinderView, setTinderView] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("users")
      .select("id, full_name, gender, religion, lifestyle, university, budget_range, avatar_url, about_me, status")
      .neq("status", "banned");
    setAllUsers(data || []);
  };

  const filtered = allUsers.filter((u) => {
    return (
      (!filters.gender || u.gender === filters.gender) &&
      (!filters.religion || u.religion === filters.religion) &&
      (!filters.lifestyle || u.lifestyle === filters.lifestyle) &&
      (!filters.university || u.university?.toLowerCase().includes(filters.university.toLowerCase()))
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedUsers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Modal for viewing profile details
  const ProfileModal = ({ user, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg max-w-md w-full p-6 relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <img
          src={user.avatar_url || "/default-avatar.png"}
          alt={user.full_name}
          className="w-full h-64 object-cover rounded mb-4 border-4 border-blue-200 dark:border-pink-400"
        />
        <h2 className="text-2xl font-bold mb-2 text-blue-700 dark:text-pink-400">{user.full_name}</h2>
        <div className="mb-2 text-gray-600 dark:text-gray-300"><strong>University:</strong> {user.university}</div>
        <div className="mb-2 text-gray-600 dark:text-gray-300"><strong>Gender:</strong> {user.gender}</div>
        <div className="mb-2 text-gray-600 dark:text-gray-300"><strong>Religion:</strong> {user.religion}</div>
        <div className="mb-2 text-gray-600 dark:text-gray-300"><strong>Lifestyle:</strong> {user.lifestyle}</div>
        <div className="mb-2 text-gray-600 dark:text-gray-300"><strong>Budget Range:</strong> {user.budget_range}</div>
        <div className="mb-2 text-gray-600 dark:text-gray-300"><strong>About Me:</strong> {user.about_me}</div>
      </div>
    </div>
  );

  // Tinder-style single card view (for mobile)
  const [tinderIdx, setTinderIdx] = useState(0);
  const tinderUser = filtered[tinderIdx] || null;

  const handleChat = (targetUserId) => {
    navigate(`/chat/${targetUserId}`);
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors px-4">
        <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-blue-700 dark:text-pink-400 drop-shadow-sm transition-all duration-300 text-center">🔍 Find a Roommate</h2>
            <button
              className="bg-gradient-to-r from-pink-500 to-yellow-500 dark:from-blue-700 dark:to-purple-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow hover:scale-105 transition"
              onClick={() => setTinderView((v) => !v)}
            >
              {tinderView ? "Grid View" : "Tinder View"}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <select
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            >
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <input
              type="text"
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
              placeholder="University"
              value={filters.university}
              onChange={(e) => setFilters({ ...filters, university: e.target.value })}
            />
            <select
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
              value={filters.religion}
              onChange={(e) => setFilters({ ...filters, religion: e.target.value })}
            >
              <option value="">Religion</option>
              <option value="christianity">Christianity</option>
              <option value="islam">Islam</option>
            </select>
            <select
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
              value={filters.lifestyle}
              onChange={(e) => setFilters({ ...filters, lifestyle: e.target.value })}
            >
              <option value="">Lifestyle</option>
              <option value="quiet">Quiet</option>
              <option value="party">Party</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-sm text-center">No matches found.</p>
          ) : tinderView ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
              {tinderUser && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 text-center border border-blue-100 dark:border-gray-700 flex flex-col items-center max-w-xs w-full animate-fade-in">
                  <img
                    src={tinderUser.avatar_url || "/default-avatar.png"}
                    alt={tinderUser.full_name}
                    className="w-48 h-48 rounded-2xl mx-auto object-cover mb-2 border-4 border-blue-200 dark:border-pink-400"
                  />
                  <h4 className="font-semibold text-blue-700 dark:text-pink-400 text-lg mb-1">{tinderUser.full_name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">{tinderUser.university}</p>
                  <p className="text-xs text-gray-700 dark:text-gray-200 mb-1">{tinderUser.budget_range}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-3">{tinderUser.about_me}</p>
                  <div className="flex justify-between w-full mt-4">
                    <button
                      className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-1 rounded-full text-xs font-semibold shadow hover:scale-105 transition"
                      onClick={() => setTinderIdx((tinderIdx - 1 + filtered.length) % filtered.length)}
                    >
                      &#8592; Prev
                    </button>
                    <button
                      className="bg-gradient-to-r from-pink-500 to-yellow-500 dark:from-blue-700 dark:to-purple-700 text-white px-4 py-1 rounded-full text-xs font-semibold shadow hover:scale-105 transition"
                      onClick={() => { setSelectedUser(tinderUser); setShowModal(true); }}
                    >
                      View Profile
                    </button>
                    <button
                      className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-1 rounded-full text-xs font-semibold shadow hover:scale-105 transition"
                      onClick={() => setTinderIdx((tinderIdx + 1) % filtered.length)}
                    >
                      Next &#8594;
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">{tinderIdx + 1} / {filtered.length}</div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {paginatedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center border border-blue-100 dark:border-gray-700 flex flex-col items-center hover:scale-[1.01] transition-transform min-h-[260px] animate-fade-in"
                  >
                    <img
                      src={user.avatar_url || "/default-avatar.png"}
                      alt={user.full_name}
                      className="w-32 h-32 rounded-2xl mx-auto object-cover mb-2 border-4 border-blue-200 dark:border-pink-400"
                    />
                    <h4 className="font-semibold text-blue-700 dark:text-pink-400 text-base mb-1 truncate">{user.full_name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-300 mb-1 truncate">{user.university}</p>
                    <p className="text-xs text-gray-700 dark:text-gray-200 mb-1">{user.budget_range}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{user.about_me}</p>
                    <button
                      className="mt-2 bg-blue-600 text-white px-4 py-1 rounded text-sm font-semibold shadow hover:bg-blue-700 transition"
                      onClick={() => handleChat(user.id)}
                    >
                      💬 Chat
                    </button>
                    <button
                      className="mt-2 bg-gradient-to-r from-pink-500 to-yellow-500 dark:from-blue-700 dark:to-purple-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow hover:scale-105 transition"
                      onClick={() => { setSelectedUser(user); setShowModal(true); }}
                    >
                      View Profile
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
          {showModal && selectedUser && (
            <ProfileModal user={selectedUser} onClose={() => setShowModal(false)} />
          )}
        </div>
      </div>
    </>
  );
} 