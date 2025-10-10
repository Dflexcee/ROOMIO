import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import FormTextArea from "../components/common/FormTextArea";
import LoadingButton from "../components/common/LoadingButton";
import Alert from "../components/common/Alert";
import LoadingSpinner from "../components/common/LoadingSpinner";
import config from "../config/api.js";

export default function ProfileEdit() {
  const [form, setForm] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const { user, loading, refreshUser } = useAuth();
  const { currency } = useCurrency();
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
        console.log("Profile updated successfully!", updateData);

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
      setError(error.message || "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
        <Navbar />
        <LoadingSpinner message="Loading profile..." />
      </div>
    );
  }

  if (!user) {
    navigate("/signup-login");
    return null;
  }

  const budgetOptions = [
    { value: "0-50000", label: `${currency.currency_symbol}0 - ${currency.currency_symbol}50,000` },
    { value: "50000-100000", label: `${currency.currency_symbol}50,000 - ${currency.currency_symbol}100,000` },
    { value: "100000-200000", label: `${currency.currency_symbol}100,000 - ${currency.currency_symbol}200,000` },
    { value: "200000-500000", label: `${currency.currency_symbol}200,000 - ${currency.currency_symbol}500,000` },
    { value: "500000+", label: `${currency.currency_symbol}500,000+` }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <Navbar />
      <div className="flex-1 p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Success/Error Messages */}
          <Alert
            type="success"
            message={success ? "Profile updated successfully! Your changes have been saved." : ""}
            onClose={() => setSuccess(false)}
          />
          <Alert
            type="error"
            message={error}
            onClose={() => setError("")}
          />

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
              <FormInput
                label="Email Address (Cannot be changed)"
                type="email"
                value={user.email}
                disabled
                className="mb-6"
              />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Full Name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.full_name || ""}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                />

                <FormInput
                  label="Age"
                  type="number"
                  placeholder="Enter your age"
                  value={form.age || ""}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />

                <FormSelect
                  label="Gender"
                  value={form.gender || ""}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" }
                  ]}
                  placeholder="Select Gender"
                />

                <FormInput
                  label="Phone Number"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={form.phone || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />

                <FormInput
                  label="University"
                  type="text"
                  placeholder="Enter your university"
                  value={form.university || ""}
                  onChange={(e) => setForm({ ...form, university: e.target.value })}
                />

                <FormInput
                  label="Department"
                  type="text"
                  placeholder="Enter your department"
                  value={form.department || ""}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />

                <FormSelect
                  label="Budget Range"
                  value={form.budget_range || ""}
                  onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
                  options={budgetOptions}
                  placeholder="Select Budget Range"
                />

                <FormSelect
                  label="Religion"
                  value={form.religion || ""}
                  onChange={(e) => setForm({ ...form, religion: e.target.value })}
                  options={[
                    { value: "christianity", label: "Christianity" },
                    { value: "islam", label: "Islam" },
                    { value: "hinduism", label: "Hinduism" },
                    { value: "buddhism", label: "Buddhism" },
                    { value: "other", label: "Other" },
                    { value: "none", label: "None" }
                  ]}
                  placeholder="Select Religion"
                />

                <FormSelect
                  label="Lifestyle"
                  value={form.lifestyle || ""}
                  onChange={(e) => setForm({ ...form, lifestyle: e.target.value })}
                  options={[
                    { value: "quiet", label: "Quiet & Studious" },
                    { value: "social", label: "Social & Outgoing" },
                    { value: "party", label: "Party & Fun-loving" },
                    { value: "mixed", label: "Mixed" }
                  ]}
                  placeholder="Select Lifestyle"
                />
              </div>

              {/* About Me */}
              <FormTextArea
                label="About Me"
                placeholder="Tell us about yourself, your interests, and what you're looking for in a roommate..."
                rows={4}
                value={form.about_me || ""}
                onChange={(e) => setForm({ ...form, about_me: e.target.value })}
                className="mt-6"
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <LoadingButton
                  onClick={handleUpdate}
                  loading={saving}
                  loadingText="Saving..."
                  variant="primary"
                  className="flex-1"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </LoadingButton>

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
