import React, { useEffect, useState } from "react";
import config from "../../config/api.js";
import PageWrapper from "../../components/common/PageWrapper";

export default function AdsManager() {
  const [ads, setAds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    target_link: "",
    image_url: "",
    ad_type: "popup",
    display_frequency: "once_per_session",
    target_audience: "all",
    priority: 0,
    display_duration: 5,
    skip_after_seconds: 3,
    display_interval_hours: 24,
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(config.getUrl('/admin/ads-management.php'), {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Fetch ads response:', data);

      if (data.success) {
        setAds(data.ads || []);
      } else {
        setError(data.error || "Failed to fetch ads");
      }
    } catch (err) {
      console.error('Fetch ads error:', err);
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      target_link: "",
      image_url: "",
      ad_type: "popup",
      display_frequency: "once_per_session",
      target_audience: "all",
      priority: 0,
      display_duration: 5,
      skip_after_seconds: 3,
      display_interval_hours: 24,
      active: true
    });
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
      image_url: ad.image_url || "",
      ad_type: ad.ad_type,
      display_frequency: ad.display_frequency,
      target_audience: ad.target_audience,
      priority: ad.priority || 0,
      display_duration: ad.display_duration || 5,
      skip_after_seconds: ad.skip_after_seconds || 3,
      display_interval_hours: ad.display_interval_hours || 24,
      active: ad.active === 1
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }

    if (!form.image_url.trim()) {
      alert("Image URL is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const adData = {
        ...form,
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
      console.log('Submit response:', data);

      if (data.success) {
        alert(editingAd ? "Ad updated successfully!" : "Ad created successfully!");
        setShowModal(false);
        resetForm();
        fetchAds();
      } else {
        alert("Error: " + (data.error || "Failed to save ad"));
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adId) => {
    if (!confirm("Are you sure you want to delete this ad?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(config.getUrl('/admin/ads-management.php'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: adId })
      });

      const data = await response.json();

      if (data.success) {
        alert("Ad deleted successfully!");
        fetchAds();
      } else {
        alert("Error: " + (data.error || "Failed to delete ad"));
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
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

      const data = await response.json();

      if (data.success) {
        fetchAds();
      } else {
        alert("Error: " + (data.error || "Failed to toggle ad status"));
      }
    } catch (err) {
      console.error('Toggle error:', err);
      alert("Error: " + err.message);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📢 Popup Ads Manager</h1>
            <p className="text-gray-600 mt-1">Create and manage popup advertisements</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            + Create New Ad
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && !showModal && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}

        {/* Ads List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map(ad => (
            <div key={ad.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              {/* Image */}
              <div className="h-48 bg-gray-100">
                <img
                  src={ad.image_url || '/default-ad.jpg'}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/default-ad.jpg'; }}
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 flex-1">{ad.title}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    ad.active === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {ad.active === 1 ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ad.description || 'No description'}</p>

                <div className="space-y-1 text-xs text-gray-500 mb-4">
                  <div>Type: <span className="font-medium">{ad.ad_type}</span></div>
                  <div>Audience: <span className="font-medium">{ad.target_audience}</span></div>
                  <div>Priority: <span className="font-medium">{ad.priority}</span></div>
                  {ad.target_link && (
                    <div className="truncate">Link: <span className="font-medium">{ad.target_link}</span></div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(ad)}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded transition ${
                      ad.active === 1
                        ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                        : 'bg-green-100 hover:bg-green-200 text-green-800'
                    }`}
                  >
                    {ad.active === 1 ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => openEditModal(ad)}
                    className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-semibold rounded transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-sm font-semibold rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && ads.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No ads yet</h3>
            <p className="text-gray-600 mb-4">Create your first popup advertisement to get started</p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Create Your First Ad
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingAd ? 'Edit Ad' : 'Create New Ad'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter ad title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter ad description"
                    rows={3}
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  {form.image_url && (
                    <div className="mt-2">
                      <img
                        src={form.image_url}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                        onError={(e) => { e.target.src = '/default-ad.jpg'; }}
                      />
                    </div>
                  )}
                </div>

                {/* Target Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={form.target_link}
                    onChange={(e) => setForm({ ...form, target_link: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Ad Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ad Type
                    </label>
                    <select
                      value={form.ad_type}
                      onChange={(e) => setForm({ ...form, ad_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="popup">Popup</option>
                      <option value="banner">Banner</option>
                      <option value="sidebar">Sidebar</option>
                    </select>
                  </div>

                  {/* Display Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Frequency
                    </label>
                    <select
                      value={form.display_frequency}
                      onChange={(e) => setForm({ ...form, display_frequency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="once_per_session">Once per session</option>
                      <option value="once_per_day">Once per day</option>
                      <option value="always">Always show</option>
                    </select>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Audience
                    </label>
                    <select
                      value={form.target_audience}
                      onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Users</option>
                      <option value="students">Students</option>
                      <option value="landlords">Landlords</option>
                      <option value="tenants">Tenants</option>
                      <option value="agents">Agents</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority (higher shows first)
                    </label>
                    <input
                      type="number"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                </div>

                {/* Display Duration & Skip Settings */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Display Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Duration (seconds)
                    </label>
                    <input
                      type="number"
                      value={form.display_duration}
                      onChange={(e) => setForm({ ...form, display_duration: parseInt(e.target.value) || 5 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="60"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-close after X seconds</p>
                  </div>

                  {/* Skip After */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skip After (seconds)
                    </label>
                    <input
                      type="number"
                      value={form.skip_after_seconds}
                      onChange={(e) => setForm({ ...form, skip_after_seconds: parseInt(e.target.value) || 3 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="30"
                    />
                    <p className="text-xs text-gray-500 mt-1">Skip button shows after X seconds</p>
                  </div>

                  {/* Display Interval */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interval (hours)
                    </label>
                    <input
                      type="number"
                      value={form.display_interval_hours}
                      onChange={(e) => setForm({ ...form, display_interval_hours: parseInt(e.target.value) || 24 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="720"
                    />
                    <p className="text-xs text-gray-500 mt-1">Wait X hours before showing again</p>
                  </div>
                </div>

                {/* Active */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700">
                    Active (show to users immediately)
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingAd ? 'Update Ad' : 'Create Ad')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
