import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "../components/common/Navbar";
import PageWrapper from "../components/common/PageWrapper";

export default function EditRoom() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newImages, setNewImages] = useState([]); // For new uploads
  const [removingIdx, setRemovingIdx] = useState(null); // For removing images
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoom();
    // eslint-disable-next-line
  }, [id]);

  const fetchRoom = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      setRoom(data);
    } catch (err) {
      setError("Failed to load room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setRoom({ ...room, [e.target.name]: e.target.value });
  };

  const handleRemoveImage = (idx) => {
    setRoom({ ...room, images: room.images.filter((_, i) => i !== idx) });
  };

  const handleAddImages = (e) => {
    setNewImages([...newImages, ...Array.from(e.target.files)]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    setUploading(true);
    let updatedImages = room.images ? [...room.images] : [];
    try {
      // Upload new images to Supabase Storage
      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i];
        if (!file.type.startsWith("image/")) {
          setError("Only image files are allowed.");
          setUploading(false);
          setLoading(false);
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError("Each image must be less than 5MB.");
          setUploading(false);
          setLoading(false);
          return;
        }
        const filename = `room-${id}-${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("room-images").upload(filename, file, { upsert: true });
        if (uploadError) {
          setError("Failed to upload one or more images: " + uploadError.message);
          setUploading(false);
          setLoading(false);
          return;
        }
        const { data: image } = supabase.storage.from("room-images").getPublicUrl(filename);
        updatedImages.push(image.publicUrl);
      }
      // Update room in DB
      const { error } = await supabase
        .from("rooms")
        .update({
          title: room.title,
          rent: room.rent,
          location: room.location,
          description: room.description,
          status: room.status,
          images: updatedImages,
        })
        .eq("id", id);
      if (error) throw error;
      setSuccess("Room updated successfully!");
      setTimeout(() => navigate("/my-rooms"), 1200);
    } catch (err) {
      setError("Failed to update room. Please try again.");
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <Navbar />
      <PageWrapper>
        <div className="max-w-xl mx-auto mt-10 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400 text-center">Edit Room</h2>
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-600 mb-4">{error}</div>
          ) : room ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {success && <div className="text-green-600 text-center mb-2">{success}</div>}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={room.title || ""}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Rent (₦)</label>
                <input
                  type="number"
                  name="rent"
                  value={room.rent || ""}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={room.location || ""}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={room.description || ""}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows="4"
                ></textarea>
              </div>
              {/* Images Section */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Images</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {Array.isArray(room.images) && room.images.length > 0 ? (
                    room.images.map((img, idx) => (
                      <div key={idx} className="relative inline-block">
                        <img
                          src={img}
                          alt={`room-img-${idx}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow hover:bg-red-700"
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400">No images yet.</span>
                  )}
                </div>
                {/* New image uploads */}
                {newImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newImages.map((file, idx) => (
                      <div key={idx} className="relative inline-block">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview-${idx}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => setNewImages(newImages.filter((_, i) => i !== idx))}
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
                  onChange={handleAddImages}
                  className="mb-2"
                />
                {uploading && <div className="text-blue-600 text-xs">Uploading images...</div>}
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  name="status"
                  value={room.status || "pending"}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="flagged">Flagged</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 dark:from-blue-700 dark:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg hover:scale-105 hover:from-pink-600 hover:to-yellow-600 dark:hover:from-blue-800 dark:hover:to-purple-800 transition-all text-lg font-semibold disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          ) : null}
        </div>
      </PageWrapper>
    </div>
  );
} 