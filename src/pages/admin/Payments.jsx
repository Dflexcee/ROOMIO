import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import PageWrapper from "../../components/common/PageWrapper";

export default function Payments() {
  const [features, setFeatures] = useState([]);
  const [form, setForm] = useState({ feature_name: "", unlock_price: 0, is_locked: false });
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [refresh]);

  const fetchSettings = async () => {
    const { data, error } = await supabase.from("payment_settings").select("*");
    if (!error) setFeatures(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("payment_settings").insert([form]);
    if (!error) {
      setForm({ feature_name: "", unlock_price: 0, is_locked: false });
      setRefresh(!refresh);
    }
  };

  const toggleLock = async (id, current) => {
    await supabase
      .from("payment_settings")
      .update({ is_locked: !current })
      .eq("id", id);
    setRefresh(!refresh);
  };

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4">💰 Payment Restrictions</h2>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow max-w-xl mb-6">
        <h3 className="font-semibold mb-2">Add New Feature Restriction</h3>
        <input
          type="text"
          placeholder="Feature Name (e.g. SEE_MORE_ROOMMATES)"
          value={form.feature_name}
          onChange={(e) => setForm({ ...form, feature_name: e.target.value })}
          className="border p-2 w-full mb-2"
          required
        />
        <input
          type="number"
          placeholder="Unlock Price (e.g. 1000)"
          value={form.unlock_price}
          onChange={(e) => setForm({ ...form, unlock_price: parseInt(e.target.value) })}
          className="border p-2 w-full mb-2"
          required
        />
        <label className="block mb-2">
          <input
            type="checkbox"
            checked={form.is_locked}
            onChange={(e) => setForm({ ...form, is_locked: e.target.checked })}
            className="mr-2"
          />
          Lock this feature?
        </label>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Save Restriction
        </button>
      </form>

      <h3 className="font-semibold text-lg mb-2">Current Feature Restrictions</h3>
      <table className="min-w-full bg-white shadow rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Feature</th>
            <th className="p-2 text-left">Price</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {features.map((f) => (
            <tr key={f.id} className="border-t">
              <td className="p-2">{f.feature_name}</td>
              <td className="p-2">₦{f.unlock_price}</td>
              <td className="p-2">{f.is_locked ? "Locked" : "Unlocked"}</td>
              <td className="p-2">
                <button
                  className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => toggleLock(f.id, f.is_locked)}
                >
                  {f.is_locked ? "Unlock" : "Lock"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageWrapper>
  );
} 