import { useState } from "react";
import adminApi from "../api/adminApi";

export default function ProductForm({ onSaved, initial = null, onCancel }) {
  const [name, setName] = useState(initial?.name || "");
  const [price, setPrice] = useState(initial?.price || "");
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [description, setDescription] = useState(initial?.description || "");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("price", price);
      fd.append("stock", stock);
      fd.append("description", description);
      if (file) fd.append("image", file); 

      let res;
      if (initial && (initial.id || initial.slug)) {
        const ident = initial.id ?? initial.slug;
        res = await adminApi.put(`/api/products/${ident}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // create
        res = await adminApi.post("/api/products", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onSaved && onSaved(res.data);
    } catch (err) {
      console.error("Save product error:", err?.response || err);
      alert(err?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 p-4 border rounded bg-white">
      <div>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full p-2 border" />
      </div>
      <div className="flex gap-2">
        <input required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" className="p-2 border flex-1" />
        <input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock" className="p-2 border w-32" />
      </div>
      <div>
        <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Description" className="w-full p-2 border" />
      </div>
      <div>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">
          Cancel
        </button>
      </div>
    </form>
  );
}
