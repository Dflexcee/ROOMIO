import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import PageWrapper from "../components/common/PageWrapper";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import DarkModeToggle from "../components/common/DarkModeToggle";

export default function MyRooms() {
  const [userId, setUserId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data?.user?.id;
      if (uid) {
        setUserId(uid);
        fetchMyRooms(uid);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchMyRooms = async (uid) => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("user_id", uid)
        .order("posted_at", { ascending: false });
      if (error) throw error;
      setRooms(data || []);
    } catch (err) {
      setError("Failed to load your rooms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    const { error } = await supabase.from("rooms").delete().eq("id", id);
    if (!error) fetchMyRooms(userId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <div className="flex justify-center pt-4">
        <DarkModeToggle />
      </div>
      <Navbar />
      <PageWrapper>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400">🛏️ My Posted Rooms</h2>
          {loading ? (
            <div className="text-center text-gray-500">Loading rooms...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : rooms.length === 0 ? (
            <p className="text-gray-600 text-sm">You haven't posted any rooms yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rooms.map((room) => (
                <div key={room.id} className="bg-white dark:bg-gray-900 p-4 shadow rounded-2xl border border-blue-100 dark:border-gray-800">
                  <img
                    src={Array.isArray(room.images) && room.images.length > 0 ? room.images[0] : "/default-room.jpg"}
                    alt={room.title}
                    className="w-full h-36 object-cover rounded mb-2 border-2 border-blue-200 dark:border-pink-400"
                  />
                  <h4 className="font-semibold text-blue-700 dark:text-pink-400 mb-1">{room.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">₦{room.rent} • {room.location}</p>
                  <p className="text-xs mt-1 text-gray-500">Status: {room.status}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => navigate(`/edit-room/${room.id}`)}
                      className="bg-yellow-500 text-white px-3 py-1 text-xs rounded shadow hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="bg-red-600 text-white px-3 py-1 text-xs rounded shadow hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageWrapper>
    </div>
  );
} 