import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import DarkModeToggle from "../components/common/DarkModeToggle";

export default function FindRoom() {
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({
    location: "",
    gender_preference: "",
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const { data } = await supabase
      .from("rooms")
      .select("*, users(full_name, avatar_url)")
      .eq("status", "approved");
    setRooms(data || []);
  };

  const filteredRooms = rooms.filter((r) => {
    return (
      (!filters.location || r.location?.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.gender_preference || r.gender_preference === filters.gender_preference)
    );
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors px-4">
      <div className="absolute top-6 right-8">
        <DarkModeToggle />
      </div>
      <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400 drop-shadow-sm transition-all duration-300 text-center">🏠 Find a Room</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <input
            type="text"
            placeholder="Location"
            className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />
          <select
            className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            value={filters.gender_preference}
            onChange={(e) => setFilters({ ...filters, gender_preference: e.target.value })}
          >
            <option value="">Gender Preference</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        {filteredRooms.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">No available rooms found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div key={room.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border border-blue-100 dark:border-gray-700 flex flex-col">
                <img
                  src={room.images?.[0] || "/default-room.jpg"}
                  alt={room.title}
                  className="w-full h-40 object-cover rounded mb-2 border-4 border-blue-200 dark:border-pink-400"
                />
                <h4 className="font-semibold text-blue-700 dark:text-pink-400">{room.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">₦{room.rent}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{room.location}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Posted by: {room.users?.full_name || "Unknown"}
                </p>
                <button
                  onClick={() => alert("Paywall or contact modal here")}
                  className="mt-3 bg-gradient-to-r from-pink-500 to-yellow-500 dark:from-blue-700 dark:to-purple-700 text-white px-4 py-1 rounded-full text-sm font-semibold shadow hover:scale-105 transition"
                >
                  Contact
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 