import { useState } from "react";
import { normalizeToken } from "helpers/token";
import sellerApi from "../api/sellerApi";

export default function MenuForm({ onSaved, initial = null, onCancel, storeId }) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [price, setPrice] = useState(initial?.price || "");
  const [stock, setStock] = useState(initial?.stock || "");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");  // ✅ Add error state

const submit = async (e) => {
  e.preventDefault();
  const token = normalizeToken(localStorage.getItem("token"));
  if (!token) {
    alert("Please login as seller to save menu item.");
    return;
  }
  if (!storeId) {
    alert("Store ID not found. Please refresh.");
    return;
  }
  setLoading(true);
  setError("");  // Clear error
  try {
    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", description);
    fd.append("price", price.toString());  // ✅ Ensure string
    fd.append("stock", stock.toString());  // ✅ Ensure string
    fd.append("store_id", storeId.toString());  // ✅ Ensure string
    if (image) {
      fd.append("image", image);  // ✅ File object
      console.log("🔍 FormData image appended:", image.name);  // ✅ Debug
    }

    // ✅ Debug FormData (log entries)
    for (let pair of fd.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    // ✅ Thêm config headers để override default json, cho phép multipart auto
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };

    let res;
    if (initial && initial.id) {
      res = await sellerApi.put(`/api/products/${initial.slug}`, fd, config);  // ✅ Thêm config
    } else {
      res = await sellerApi.post("/api/products", fd, config);  // ✅ Thêm config
    }

    onSaved && onSaved(res.data);
  } catch (err) {
    console.error("Save menu item error:", err?.response?.data || err);
    const msg = err?.response?.data?.message || "Save failed";
    setError(msg);  // ✅ Set error for UI
    if (err.response?.status === 401 || err.response?.status === 403) {
      alert(`Auth failed: ${msg}. Relogin as seller.`);
    } else {
      alert(msg);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <form onSubmit={submit} className="space-y-3 p-4 border rounded bg-white">
      {error && <div className="p-2 bg-red-100 border border-red-400 rounded text-red-700">{error}</div>} 
      <div>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product Name"
          className="w-full p-2 border"
        />
      </div>
      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full p-2 border"
          rows={3}
        />
      </div>
      <div>
        <input
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price (VND)"
          type="number"
          step="0.01"
          className="w-full p-2 border"
        />
      </div>
      <div>
        <input
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Stock Quantity"
          type="number"
          min="0"
          className="w-full p-2 border"
        />
      </div>
      <div>
        <input
          type="file"
          onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
          accept="image/*"
          className="w-full p-2 border"
        />
        {initial?.image_url && <p className="text-sm text-gray-500 mt-1">Current: {initial.image_url}</p>}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Saving..." : initial ? "Update" : "Add Item"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}