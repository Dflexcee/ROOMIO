import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import PageWrapper from "../components/common/PageWrapper";
import BecomeVerifiedForm from "../components/user/BecomeVerifiedForm";
import DarkModeToggle from "../components/common/DarkModeToggle";
import Navbar from "../components/common/Navbar";
import { useNavigate } from "react-router-dom";
import config from "../config/api.js";

export default function PostRoom() {
  const { user, loading } = useAuth();
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    rent: "",
    location: "",
    gender_preference: "",
    role: "",
    conditions: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    setUploadProgress(0);
    
    if (!user || !form.title.trim() || !form.rent || !form.location.trim() || !form.gender_preference || !form.role) {
      setError("Please fill all required fields.");
      setSubmitting(false);
      return;
    }
    
    if (images.length === 0) {
      setError("Please upload at least one image.");
      setSubmitting(false);
      return;
    }
    
    const rentValue = Number(form.rent);
    if (isNaN(rentValue) || rentValue <= 0) {
      setError("Please enter a valid rent amount.");
      setSubmitting(false);
      return;
    }

    try {
      // Upload images to PHP API
      const uploadedUrls = [];
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        if (!file.type.startsWith("image/")) {
          setError("Only image files are allowed.");
          setSubmitting(false);
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError("Each image must be less than 5MB.");
          setSubmitting(false);
          return;
        }
        
        const formData = new FormData();
        formData.append("image", file);
        formData.append("user_id", user.id);
        
        const uploadResponse = await fetch(config.getUrl(config.endpoints.upload.roomImage), {
          method: "POST",
          credentials: "include",
          body: formData
        });
        
        const uploadData = await uploadResponse.json();
        
        if (!uploadResponse.ok) {
          setError("Failed to upload one or more images: " + uploadData.error);
          setSubmitting(false);
          return;
        }
        
        uploadedUrls.push(uploadData.image_url);
        setUploadProgress(Math.round(((uploadedUrls.length) / images.length) * 100));
      }

      // Create room
      const createResponse = await fetch(config.getUrl(config.endpoints.rooms.create), {
        method: "POST",
        headers: config.getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          ...form,
          rent: rentValue,
          images: uploadedUrls,
          status: "pending"
        })
      });

      const createData = await createResponse.json();
      
      if (createResponse.ok) {
        alert("Room submitted! Pending approval.");
        setForm({ title: "", description: "", rent: "", location: "", gender_preference: "", role: "", conditions: "" });
        setImages([]);
        navigate("/my-rooms");
      } else {
        setError("Failed to submit room: " + createData.error);
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
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

  // Only allow verified users to post
  if (user.verification_status !== "verified") {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
        <div className="flex justify-center pt-4">
          <DarkModeToggle />
        </div>
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in">
            <h2 className="text-2xl font-extrabold mb-3 text-blue-700 dark:text-pink-400 text-center">🔐 Verification Required</h2>
            <p className="text-gray-600 text-sm mb-4 text-center">
              To post a room, you must complete verification as a tenant, agent, or landlord.
            </p>
            <BecomeVerifiedForm userId={user.id} onSuccess={() => window.location.reload()} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <div className="flex justify-center pt-4">
        <DarkModeToggle />
      </div>
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400 drop-shadow-sm transition-all duration-300 text-center">✍️ Post a Room</h2>
          {error && <div className="text-red-600 mb-2 text-center">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Room Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="number"
              placeholder="Rent (₦)"
              value={form.rent}
              onChange={(e) => setForm({ ...form, rent: e.target.value })}
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            <select
              value={form.gender_preference}
              onChange={(e) => setForm({ ...form, gender_preference: e.target.value })}
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Gender Preference</option>
              <option value="male">Male Only</option>
              <option value="female">Female Only</option>
              <option value="any">Any</option>
            </select>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Who are you?</option>
              <option value="tenant">Tenant</option>
              <option value="agent">Agent</option>
              <option value="landlord">Landlord</option>
            </select>
          </div>
          <textarea
            placeholder="Room Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border p-2 w-full mb-3 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            rows={3}
          ></textarea>
          {/* Image Previews */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {Array.from(images).map((file, idx) => (
                <div key={idx} className="relative inline-block">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`preview-${idx}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => setImages(Array.from(images).filter((_, i) => i !== idx))}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow hover:bg-red-700"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={e => setImages(Array.from(e.target.files))}
            className="mb-3"
          />
          <textarea
            placeholder="Any special conditions?"
            value={form.conditions}
            onChange={(e) => setForm({ ...form, conditions: e.target.value })}
            className="border p-2 w-full mb-4 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
            rows={2}
          />
          {submitting && (
            <div className="w-full mb-4">
              <div className="bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="text-center text-sm mt-1 text-blue-700">{uploadProgress}%</div>
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-gradient-to-r from-green-500 to-blue-600 dark:from-blue-700 dark:to-purple-700 text-white px-6 py-2 rounded-full shadow-lg hover:scale-105 transition text-lg font-semibold w-full disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Room"}
          </button>
        </div>
      </div>
    </div>
  );
} 