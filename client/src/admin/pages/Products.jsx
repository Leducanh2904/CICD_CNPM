// client/src/admin/pages/Products.jsx
import { useEffect, useState } from "react";
import adminApi from "../api/adminApi";
import ProductForm from "../components/ProductForm";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // backend: GET /api/products?page=1
      const res = await adminApi.get("/api/products?page=1");
      const data = res.data?.data ?? res.data; // handle if API wraps in data
      setProducts(Array.isArray(data) ? data : (data.rows || []));
    } catch (err) {
      console.error("Load products error:", err?.response || err);
      alert("Cannot load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSaved = () => {
    setShowForm(false);
    setEditing(null);
    load();
  };

  const onDelete = async (p) => {
    if (!confirm(`Delete product "${p.name}"?`)) return;
    try {
      const ident = p.id ?? p.slug;
      await adminApi.delete(`/api/products/${ident}`);
      load();
    } catch (err) {
      console.error("Delete error:", err?.response || err);
      alert("Delete failed");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <div>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="px-3 py-1 bg-green-600 text-white rounded">Add product</button>
          <button onClick={load} className="ml-2 px-3 py-1 border rounded">Refresh</button>
        </div>
      </div>

      {showForm && (
        <div className="mb-4">
          <ProductForm initial={editing} onSaved={onSaved} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {loading ? <div>Loading...</div> : products.map(p => (
          <div key={p.id ?? p.slug} className="p-4 border rounded bg-white">
            <img
              src={p.image_url ? `${API_URL}${p.image_url}` : "https://via.placeholder.com/150"}
              alt={p.name}
              className="w-full h-40 object-contain mb-2"
            />
            <h3 className="font-semibold">{p.name}</h3>
            <div className="text-gray-600">{new Intl.NumberFormat("vi-VN").format(p.price)} đ</div>
            <div className="mt-2 flex gap-2">
              <button onClick={() => { setEditing(p); setShowForm(true); }} className="px-2 py-1 border rounded">Edit</button>
              <button onClick={() => onDelete(p)} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
