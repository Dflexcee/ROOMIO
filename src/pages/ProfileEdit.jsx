import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import DarkModeToggle from "../components/common/DarkModeToggle";

export default function ProfileEdit() {
  const [form, setForm] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data?.user?.id;
      if (!uid) return;
      setUserId(uid);
      const { data: profile } = await supabase.from("users").select("*").eq("id", uid).single();
      if (profile) {
        setForm(profile);
        setLoading(false);
      }
    });
  }, []);

  const handleUpdate = async () => {
    setSaving(true);
    let avatarUrl = form.avatar_url;
    if (profilePic) {
      const filename = `profile-${userId}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filename, profilePic);
      if (!uploadError) {
        const { data } = supabase.storage.from("avatars").getPublicUrl(filename);
        avatarUrl = data.publicUrl;
      }
    }
    const { error } = await supabase.from("users").update({
      ...form,
      avatar_url: avatarUrl,
    }).eq("id", userId);
    setSaving(false);
    if (!error) {
      alert("Profile updated!");
    }
  };

  if (loading) return <div className="p-6 text-center text-lg text-blue-700 dark:text-pink-400">Loading profile...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors px-4">
      <div className="absolute top-6 right-8">
        <DarkModeToggle />
      </div>
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in mt-16">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400 drop-shadow-sm text-center">👤 Edit My Profile</h2>
        <div className="flex flex-col items-center mb-6">
          <img
            src={form.avatar_url || "/default-avatar.png"}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 dark:border-pink-400 mb-2 shadow-lg"
          />
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Update Profile Picture</label>
          <input type="file" onChange={(e) => setProfilePic(e.target.files[0])} className="mb-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={form.full_name || ""}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="number"
            placeholder="Age"
            value={form.age || ""}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            placeholder="University"
            value={form.university || ""}
            onChange={(e) => setForm({ ...form, university: e.target.value })}
            className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            placeholder="Department"
            value={form.department || ""}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            placeholder="Budget Range"
            value={form.budget_range || ""}
            onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
            className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
          />
          <select
            value={form.gender || ""}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <select
            value={form.lifestyle || ""}
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
          className="border p-2 w-full mt-4 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
          rows={3}
          value={form.about_me || ""}
          onChange={(e) => setForm({ ...form, about_me: e.target.value })}
        ></textarea>
        <button
          onClick={handleUpdate}
          disabled={saving}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow font-semibold transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
} 