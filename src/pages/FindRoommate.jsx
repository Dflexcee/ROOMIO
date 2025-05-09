import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import DarkModeToggle from "../components/common/DarkModeToggle";

export default function FindRoommate() {
  const [allUsers, setAllUsers] = useState([]);
  const [filters, setFilters] = useState({
    gender: "",
    religion: "",
    lifestyle: "",
    university: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("users")
      .select("id, full_name, gender, religion, lifestyle, university, budget_range, avatar_url, about_me")
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors px-4">
      <div className="absolute top-6 right-8">
        <DarkModeToggle />
      </div>
      <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400 drop-shadow-sm transition-all duration-300 text-center">🔍 Find a Roommate</h2>
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.map((user) => (
              <div
                key={user.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 text-center border border-blue-100 dark:border-gray-700 flex flex-col items-center"
              >
                <img
                  src={user.avatar_url || "/default-avatar.png"}
                  alt={user.full_name}
                  className="w-20 h-20 rounded-full mx-auto object-cover mb-2 border-4 border-blue-200 dark:border-pink-400"
                />
                <h4 className="font-semibold text-blue-700 dark:text-pink-400">{user.full_name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-300">{user.university}</p>
                <p className="text-xs mt-1 text-gray-700 dark:text-gray-200">{user.budget_range}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{user.about_me}</p>
                <button
                  className="mt-3 bg-gradient-to-r from-pink-500 to-yellow-500 dark:from-blue-700 dark:to-purple-700 text-white px-4 py-1 rounded-full text-sm font-semibold shadow hover:scale-105 transition"
                  onClick={() => alert("Paywall or profile view here")}
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 