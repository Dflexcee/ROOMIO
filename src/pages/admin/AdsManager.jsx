import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import PageWrapper from "../../components/common/PageWrapper";

export default function AdsManager() {
  const [ads, setAds] = useState([]);
  const [form, setForm] = useState({ title: "", target_link: "" });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .order("posted_on", { ascending: false });

    if (!error) setAds(data);
  };

  const handleUpload = async () => {
    if (!imageFile) return alert("Please select an image.");
    if (!form.title || !form.target_link) return alert("All fields are required.");
    setLoading(true);

    const filename = `${Date.now()}-${imageFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("ads")
      .upload(filename, imageFile);

    if (uploadError) {
      alert("Upload failed.");
      console.error(uploadError);
      setLoading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("ads")
      .getPublicUrl(filename);

    const { error: dbError } = await supabase.from("ads").insert([
      {
        title: form.title,
        image_url: publicUrlData.publicUrl,
        target_link: form.target_link,
        active: true
      },
    ]);

    if (!dbError) {
      alert("Ad uploaded successfully!");
      setForm({ title: "", target_link: "" });
      setImageFile(null);
      fetchAds();
    }

    setLoading(false);
  };

  const toggleActive = async (adId, currentStatus) => {
    const { error } = await supabase
      .from("ads")
      .update({ active: !currentStatus })
      .eq("id", adId);

    if (!error) fetchAds();
  };

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4">📢 Ads Manager</h2>

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