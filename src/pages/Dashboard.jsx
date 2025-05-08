import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import DarkModeToggle from "../components/common/DarkModeToggle";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data?.user?.id;
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", uid)
        .single();
      setUser(profile);
    });
  }, []);

  const goTo = (route) => {
    navigate(route);
  };

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <div className="absolute top-6 right-8">
        <DarkModeToggle />
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-blue-100 dark:border-gray-800 animate-fade-in">
        <div className="text-lg text-blue-700 dark:text-pink-400 font-bold">Loading...</div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors px-4">
      <div className="absolute top-6 right-8">
        <DarkModeToggle />
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-2xl w-full border border-blue-100 dark:border-gray-800 animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400 drop-shadow-sm transition-all duration-300">👋 Welcome, {user.full_name}!</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card icon="🔍" label="Find Roommate" onClick={() => goTo("/find-roommate")} />
          <Card icon="🏠" label="Find Room" onClick={() => goTo("/find-room")} />
          <Card icon="✍️" label="Post Room" onClick={() => goTo("/post-room")} />
          <Card icon="⚠️" label="Scam Alerts" onClick={() => goTo("/scam-board")} />
          <Card icon="💬" label="Community Feed" onClick={() => goTo("/community")} />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-8">
          💡 Use the buttons above to get started, or return to edit your profile anytime.
        </p>
      </div>
    </div>
  );
}

function Card({ icon, label, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 transition border border-blue-100 dark:border-gray-700"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <p className="font-semibold text-sm text-blue-700 dark:text-pink-400">{label}</p>
    </div>
  );
} 