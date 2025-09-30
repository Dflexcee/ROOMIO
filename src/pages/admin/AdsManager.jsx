import React, { useEffect, useState } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import config from "../../config/api.js";

export default function AdsManager() {
  const [ads, setAds] = useState([]);
  const [form, setForm] = useState({ title: "", target_link: "" });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await fetch(config.getUrl('/admin/ads.php'));
      const data = await response.json();
      
      if (response.ok) {
        setAds(data.ads || []);
      } else {
        setError("Failed to fetch ads");
      }
    } catch (err) {
      setError("Failed to fetch ads");
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return alert("Please select an image.");
    if (!form.title || !form.target_link) return alert("All fields are required.");
    
    setLoading(true);
    setError(null);

    try {
      // First upload the image
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

      // Then create the ad record
      const createResponse = await fetch(config.getUrl('/admin/ads.php'), {
        method: 'POST',
        headers: config.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          title: form.title,
          image_url: uploadData.image_url,
          target_link: form.target_link,
          active: true
        })
      });
      
      const createData = await createResponse.json();
      
      if (createResponse.ok) {
        alert("Ad uploaded successfully!");
        setForm({ title: "", target_link: "" });
        setImageFile(null);
        fetchAds();
      } else {
        throw new Error(createData.error || "Failed to create ad");
      }
    } catch (err) {
      setError(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (adId, currentStatus) => {
    try {
      const response = await fetch(config.getUrl('/admin/ads.php'), {
        method: 'PUT',
        headers: config.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          id: adId,
          active: !currentStatus
        })
      });
      
      if (response.ok) {
        fetchAds();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update ad status");
      }
    } catch (err) {
      setError("Failed to update ad status");
    }
  };

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4">📢 Ads Manager</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white p-4 rounded shadow mb-8 max-w-2xl">
        <h3 className="font-semibold mb-2">Upload New Ad</h3>
        <input
          type="text"
          placeholder="Ad Title"
          className="border p-2 w-full mb-2"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Target Link"
          className="border p-2 w-full mb-2"
          value={form.target_link}
          onChange={(e) => setForm({ ...form, target_link: e.target.value })}
        />
        <input
          type="file"
          accept="image/*"
          className="mb-3"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {loading ? "Uploading..." : "Upload Ad"}
        </button>
      </div>

      <h3 className="text-lg font-semibold mb-2">All Uploaded Ads</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ads.map((ad) => (
          <div key={ad.id} className="p-4 bg-white rounded shadow">
            <img src={ad.image_url} alt={ad.title} className="w-full h-32 object-cover rounded mb-2" />
            <h4 className="font-semibold">{ad.title}</h4>
            <p className="text-sm text-blue-600 break-words">{ad.target_link}</p>
            <div className="flex justify-between mt-3">
              <button
                onClick={() => toggleActive(ad.id, ad.active)}
                className={`px-4 py-1 rounded text-white ${
                  ad.active ? "bg-yellow-500" : "bg-gray-600"
                }`}
              >
                {ad.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
} 