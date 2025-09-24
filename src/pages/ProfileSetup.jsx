import React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import DarkModeToggle from "../components/common/DarkModeToggle";
import Navbar from "../components/common/Navbar";
import config from "../config/api.js";

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
    phone: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState("");

  useEffect(() => {
    if (user) {
      // Pre-fill form with existing user data
      setForm({
        full_name: user.full_name || "",
        age: user.age || "",
        gender: user.gender || "male",
        university: user.university || "",
        department: user.department || "",
        budget_range: user.budget_range || "",
        religion: user.religion || "",
        lifestyle: user.lifestyle || "",
        about_me: user.about_me || "",
        phone: user.phone || "",
      });
      setCurrentAvatarUrl(user.avatar_url || "");
    }
  }, [user]);

  const handleSubmit = async () => {
    setError("");
    setSaving(true);
    let avatarUrl = currentAvatarUrl;

    try {
      // Upload profile picture if selected
      if (profilePic) {
        const formData = new FormData();
        formData.append("avatar", profilePic);
        
        const uploadResponse = await fetch(config.getUrl(config.endpoints.upload.avatar), {
          method: "POST",
          credentials: "include",
          body: formData
        });
        
        const uploadData = await uploadResponse.json();
        
        if (!uploadResponse.ok) {
          setError(uploadData.error || "Failed to upload profile picture.");
          setSaving(false);
          return;
        }
        
        avatarUrl = uploadData.avatar_url;
      }

      // Update profile data
      const updateResponse = await fetch(config.getUrl(config.endpoints.profile.update), {
        method: "POST",
        headers: config.getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          ...form,
          avatar_url: avatarUrl
        })
      });

      const updateData = await updateResponse.json();
      
      if (!updateResponse.ok) {
        setError(updateData.error || "Failed to save profile.");
        setSaving(false);
        return;
      }

      // Success - redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/signup-login");
    return null;
  }

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
            <input
              type="text"
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
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
            disabled={saving}
            className="mt-6 bg-gradient-to-r from-pink-500 to-yellow-500 dark:from-blue-700 dark:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg hover:scale-105 hover:from-pink-600 hover:to-yellow-600 dark:hover:from-blue-800 dark:hover:to-purple-800 transition-all text-lg font-semibold w-full mb-2 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Update Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}