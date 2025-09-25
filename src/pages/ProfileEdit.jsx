import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import DarkModeToggle from "../components/common/DarkModeToggle";
import Navbar from "../components/common/Navbar";
import config from "../config/api.js";

export default function ProfileEdit() {
  const [form, setForm] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const { user, loading, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      console.log("Loading user data into form:", user);
      setForm({
        full_name: user.full_name || "",
        age: user.age || "",
        gender: user.gender || "",
        university: user.university || "",
        department: user.department || "",
        budget_range: user.budget_range || "",
        religion: user.religion || "",
        lifestyle: user.lifestyle || "",
        about_me: user.about_me || "",
        phone: user.phone || "",
        avatar_url: user.avatar_url || ""
      });
    }
  }, [user]);

  const handleUpdate = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    let avatarUrl = form.avatar_url;
    
    console.log("Starting profile update...", { profilePic, form });
    
    // Basic validation
    if (!form.full_name || form.full_name.trim() === "") {
      setError("Full name is required.");
      setSaving(false);
      return;
    }
    
    try {
      // Upload profile picture if selected
      if (profilePic) {
        console.log("Uploading profile picture...", profilePic);
        const formData = new FormData();
        formData.append("avatar", profilePic);
        
        const uploadResponse = await fetch(config.getUrl(config.endpoints.upload.avatar), {
          method: "POST",
          credentials: "include",
          body: formData
        });
        
        const uploadData = await uploadResponse.json();
        console.log("Upload response:", uploadData);
        
        if (!uploadResponse.ok) {
          setError("Failed to upload profile picture: " + uploadData.error);
          setSaving(false);
          return;
        }
        
        avatarUrl = uploadData.avatar_url;
        console.log("Avatar uploaded successfully:", avatarUrl);
      }

      // Update profile data
      console.log("Updating profile data...", { ...form, avatar_url: avatarUrl });
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
      console.log("Update response:", updateData);
      
      if (updateResponse.ok) {
        setSuccess(true);
        console.log("Profile updated successfully!");
        // Update the form with the returned user data
        if (updateData.user) {
          setForm({
            full_name: updateData.user.full_name || "",
            age: updateData.user.age || "",
            gender: updateData.user.gender || "",
            university: updateData.user.university || "",
            department: updateData.user.department || "",
            budget_range: updateData.user.budget_range || "",
            religion: updateData.user.religion || "",
            lifestyle: updateData.user.lifestyle || "",
            about_me: updateData.user.about_me || "",
            phone: updateData.user.phone || "",
            avatar_url: updateData.user.avatar_url || ""
          });
        }
        // Refresh user data in context
        if (refreshUser) {
          await refreshUser();
        }
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        console.error("Update failed:", updateData);
        setError(updateData.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-blue-100 dark:border-gray-800 animate-fade-in">
            <div className="text-lg text-blue-700 dark:text-pink-400 font-bold">Loading profile...</div>
          </div>
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
      <Navbar />
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center animate-pulse">
              <span className="text-green-500 mr-2">✓</span>
              Profile updated successfully! Your changes have been saved.
            </div>
          )}
          
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <span className="text-red-500 mr-2">⚠</span>
              {error}
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-blue-100 dark:border-gray-800 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-3xl p-6 text-white">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-2">👤 Edit Profile</h2>
              <p className="text-blue-100">Update your personal information and preferences</p>
            </div>

            <div className="p-6">
              {/* Profile Picture Section */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <img
                    src={form.avatar_url || "/default-avatar.png"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 dark:border-pink-400 shadow-lg"
                  />
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input 
                      type="file" 
                      onChange={(e) => {
                        console.log("File selected:", e.target.files[0]);
                        setProfilePic(e.target.files[0]);
                      }} 
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Click the camera icon to update your profile picture</p>
              </div>

              {/* Email (Read-only) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address (Cannot be changed)
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={form.full_name || ""}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    placeholder="Enter your age"
                    value={form.age || ""}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    value={form.gender || ""}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={form.phone || ""}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* University */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    University
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your university"
                    value={form.university || ""}
                    onChange={(e) => setForm({ ...form, university: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your department"
                    value={form.department || ""}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Budget Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget Range
                  </label>
                  <select
                    value={form.budget_range || ""}
                    onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">Select Budget Range</option>
                    <option value="0-50000">₦0 - ₦50,000</option>
                    <option value="50000-100000">₦50,000 - ₦100,000</option>
                    <option value="100000-200000">₦100,000 - ₦200,000</option>
                    <option value="200000-500000">₦200,000 - ₦500,000</option>
                    <option value="500000+">₦500,000+</option>
                  </select>
                </div>

                {/* Religion */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Religion
                  </label>
                  <select
                    value={form.religion || ""}
                    onChange={(e) => setForm({ ...form, religion: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">Select Religion</option>
                    <option value="christianity">Christianity</option>
                    <option value="islam">Islam</option>
                    <option value="hinduism">Hinduism</option>
                    <option value="buddhism">Buddhism</option>
                    <option value="other">Other</option>
                    <option value="none">None</option>
                  </select>
                </div>

                {/* Lifestyle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lifestyle
                  </label>
                  <select
                    value={form.lifestyle || ""}
                    onChange={(e) => setForm({ ...form, lifestyle: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">Select Lifestyle</option>
                    <option value="quiet">Quiet & Studious</option>
                    <option value="social">Social & Outgoing</option>
                    <option value="party">Party & Fun-loving</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>

              {/* About Me */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  About Me
                </label>
                <textarea
                  placeholder="Tell us about yourself, your interests, and what you're looking for in a roommate..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  rows={4}
                  value={form.about_me || ""}
                  onChange={(e) => setForm({ ...form, about_me: e.target.value })}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 