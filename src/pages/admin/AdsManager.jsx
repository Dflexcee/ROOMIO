import React, { useEffect, useState } from "react";
import config from "../../config/api.js";

export default function AdsManager() {
  const [ads, setAds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    target_link: "",
    ad_type: "popup",
    display_frequency: "once_per_session",
    target_audience: "all",
    priority: 0,
    active: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await fetch(config.getUrl('/admin/ads-management.php'), {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setAds(data.ads || []);
      } else {
        setError("Failed to fetch ads");
      }
    } catch (err) {
      setError("Failed to fetch ads: " + err.message);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      target_link: "",
      ad_type: "popup",
      display_frequency: "once_per_session",
      target_audience: "all",
      priority: 0,
      active: true
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingAd(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (ad) => {
    setEditingAd(ad);
    setForm({
      title: ad.title,
      description: ad.description || "",
      target_link: ad.target_link || "",
      ad_type: ad.ad_type,
      display_frequency: ad.display_frequency,
      target_audience: ad.target_audience,
      priority: ad.priority,
      active: ad.active === 1
    });
    setImagePreview(ad.image_url);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }

    if (!editingAd && !imageFile) {
      alert("Please select an image");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let imageUrl = editingAd ? editingAd.image_url : null;

      // Upload image if new file selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadResponse = await fetch(config.getUrl('/upload/ad-image.php'), {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || "Failed to upload image");
        }

        imageUrl = uploadData.image_url;
      }

      // Create or update ad
      const adData = {
        ...form,
        image_url: imageUrl,
        active: form.active ? 1 : 0
      };

      if (editingAd) {
        adData.id = editingAd.id;
      }

      const response = await fetch(config.getUrl('/admin/ads-management.php'), {
        method: editingAd ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(adData)
      });

      const data = await response.json();

      if (data.success) {
        alert(editingAd ? "Ad updated successfully!" : "Ad created successfully!");
        setShowModal(false);
        resetForm();
        fetchAds();
      } else {
        throw new Error(data.error || "Failed to save ad");
      }
    } catch (err) {
      setError(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adId) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;

    try {
      const response = await fetch(config.getUrl('/admin/ads-management.php'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: adId })
      });

      const data = await response.json();

      if (data.success) {
        alert("Ad deleted successfully");
        fetchAds();
      } else {
        alert("Failed to delete ad: " + data.error);
      }
    } catch (err) {
      alert("Failed to delete ad: " + err.message);
    }
  };

  const toggleActive = async (ad) => {
    try {
      const response = await fetch(config.getUrl('/admin/ads-management.php'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: ad.id,
          active: ad.active === 1 ? 0 : 1
        })
      });

      if (response.ok) {
        fetchAds();
      }
    } catch (err) {
      alert("Failed to update ad status");
    }
  };

  const getClickRate = (ad) => {
    if (ad.total_views === 0) return '0%';
    return ((ad.total_clicks / ad.total_views) * 100).toFixed(1) + '%';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📢 Popup Ads Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage popup advertisements for user dashboards
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          + Create New Ad
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Ads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => (
          <div key={ad.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="relative">
              <img
                src={ad.image_url}
                alt={ad.title}
                className="w-full h-48 object-cover"
              />
              {ad.active === 1 ? (
                <span className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                  ACTIVE
                </span>
              ) : (
                <span className="absolute top-2 right-2 px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded">
                  INACTIVE
                </span>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                {ad.title}
              </h3>
              {ad.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {ad.description}
                </p>
              )}

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">
                    {ad.ad_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Frequency:</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-xs">
                    {ad.display_frequency.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Target:</span>
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">
                    {ad.target_audience}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {ad.priority}
                  </span>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 mb-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {ad.total_views || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Views</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {ad.total_clicks || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Clicks</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {getClickRate(ad)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">CTR</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(ad)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(ad)}
                  className={`flex-1 px-3 py-2 rounded transition text-sm font-semibold ${
                    ad.active === 1
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {ad.active === 1 ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ads.length === 0 && !error && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No ads created yet. Click "Create New Ad" to get started.
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
            </h3>

            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ad Image *
                </label>
                {imagePreview && (
                  <div className="mb-2">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded border" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter ad title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Enter ad description"
                />
              </div>

              {/* Target Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Link
                </label>
                <input
                  type="text"
                  value={form.target_link}
                  onChange={(e) => setForm({ ...form, target_link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com"
                />
              </div>

              {/* Ad Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ad Type
                </label>
                <select
                  value={form.ad_type}
                  onChange={(e) => setForm({ ...form, ad_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="popup">Popup</option>
                  <option value="banner">Banner</option>
                  <option value="sidebar">Sidebar</option>
                </select>
              </div>

              {/* Display Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Frequency
                </label>
                <select
                  value={form.display_frequency}
                  onChange={(e) => setForm({ ...form, display_frequency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="once_per_session">Once per session</option>
                  <option value="once_per_day">Once per day</option>
                  <option value="always">Always show</option>
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Audience
                </label>
                <select
                  value={form.target_audience}
                  onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Users</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Unverified Only</option>
                  <option value="tenant">Tenants</option>
                  <option value="landlord">Landlords</option>
                  <option value="agent">Agents</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority (higher shows first)
                </label>
                <input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Active Toggle */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active (show to users immediately)
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingAd ? 'Update Ad' : 'Create Ad')}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}