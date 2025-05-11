import React from "react";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import DarkModeToggle from "../components/common/DarkModeToggle";
import Navbar from "../components/common/Navbar";

export default function ProfileSetup() {
  const [form, setForm] = useState({
    full_name: "",
    age: "",
    gender: "male",
    university: "",
    department: "",
    budget_range: "",
    religion: "",
    lifestyle: "",
    about_me: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Fetch user profile data
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile && !profileError) {
          setForm({
            full_name: profile.full_name || "",
            age: profile.age || "",
            gender: profile.gender || "male",
            university: profile.university || "",
            department: profile.department || "",
            budget_range: profile.budget_range || "",
            religion: profile.religion || "",
            lifestyle: profile.lifestyle || "",
            about_me: profile.about_me || "",
          });
          setCurrentAvatarUrl(profile.avatar_url || "");
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    let avatarUrl = currentAvatarUrl;

    if (profilePic) {
      const fileName = `profile-${userId}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, profilePic, { upsert: true });

      if (uploadError) {
        setError("Failed to upload profile picture.");
        setLoading(false);
        return;
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      avatarUrl = data.publicUrl;
    }

    const { error } = await supabase.from("users").upsert({
      id: userId,
      ...form,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    });

    setLoading(false);
    if (!error) {
      navigate("/dashboard");
    } else {
      setError("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <div className="flex justify-center pt-4">
        <DarkModeToggle />
      </div>
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full border border-blue-100 dark:border-gray-800 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-blue-700 dark:text-pink-400 drop-shadow-sm transition-all duration-300">👤 Edit Your Profile</h2>
          {error && <div className="text-red-600 mb-2">{error}</div>}

          {currentAvatarUrl && (
            <div className="mb-4 flex justify-center">
              <img 
                src={currentAvatarUrl} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="number"
              placeholder="Age"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <input
              type="text"
              placeholder="University"
              value={form.university}
              onChange={(e) => setForm({ ...form, university: e.target.value })}
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Budget Range (e.g. ₦100k - ₦300k)"
              value={form.budget_range}
              onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Religion"
              value={form.religion}
              onChange={(e) => setForm({ ...form, religion: e.target.value })}
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            <select
              value={form.lifestyle}
              onChange={(e) => setForm({ ...form, lifestyle: e.target.value })}
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Lifestyle</option>
              <option value="quiet">Quiet</option>
              <option value="party">Party</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <textarea
            placeholder="About Me"
            value={form.about_me}
            onChange={(e) => setForm({ ...form, about_me: e.target.value })}
            className="border p-2 w-full mt-4 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            rows={3}
          ></textarea>

          <div className="mt-4">
            <label className="block mb-2 font-medium text-gray-900 dark:text-white">Update Profile Picture</label>
            <input type="file" onChange={(e) => setProfilePic(e.target.files[0])} />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 bg-gradient-to-r from-pink-500 to-yellow-500 dark:from-blue-700 dark:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg hover:scale-105 hover:from-pink-600 hover:to-yellow-600 dark:hover:from-blue-800 dark:hover:to-purple-800 transition-all text-lg font-semibold w-full mb-2 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Update Profile"}
          </button>
        </div>
      </div>
    </div>
  );
} 