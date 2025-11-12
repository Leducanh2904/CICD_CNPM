import { useEffect, useState } from "react";
import adminApi from "../api/adminApi";
import StoreForm from "../components/StoreForm";

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async (page = 1) => {
    setLoading(true);
    setCurrentPage(page);
    try {
      const res = await adminApi.get(`/stores?page=${page}`);
      const data = res.data?.data ?? res.data;
      setStores(Array.isArray(data) ? data : (data.stores || data.data || []));
      setTotalPages(res.data?.totalPages || Math.ceil((data?.length || 0) / 10));
    } catch (err) {
      console.error("Load stores error:", err?.response || err);
      alert("Cannot load stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  const onSaved = () => {
    setShowForm(false);
    setEditing(null);
    load(currentPage);
  };

  const onDelete = async (s) => {
    if (!confirm(`Delete store "${s.name}"?`)) return;
    try {
      // Fix: Add  prefix to match backend routes
      await adminApi.delete(`/stores/${s.id}`);
      load(currentPage);
    } catch (err) {
      console.error("Delete error:", err?.response || err);
      alert("Delete failed: " + (err?.response?.data?.message || err.message));
    }
  };

  const Pagination = () => (
    <div className="flex justify-center mt-4 gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => load(p)} className={`px-3 py-1 rounded ${p === currentPage ? 'bg-blue-600 text-white' : 'border'}`}>
          {p}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Stores</h1>
        <div>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="px-4 py-2 bg-green-600 text-white rounded">Add Store</button>
          <button onClick={() => load(1)} className="ml-2 px-4 py-2 border rounded">Refresh</button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border rounded bg-white">
          <StoreForm initial={editing} onSaved={onSaved} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">Loading stores...</div>
      ) : (
        <>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Name</th>
                <th className="border p-2">Owner</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">Active</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="border p-2 font-medium">{s.name}</td>
                  <td className="border p-2">{s.owner_name || 'N/A'}</td>
                  <td className="border p-2">{s.email || 'N/A'}</td>
                  <td className="border p-2">{s.phone || 'N/A'}</td>
                  <td className="border p-2">{s.is_active ? 'Yes' : 'No'}</td>
                  <td className="border p-2">
                    <button onClick={() => { setEditing(s); setShowForm(true); }} className="mr-2 px-2 py-1 bg-blue-500 text-white rounded text-sm">Edit</button>
                    <button onClick={() => onDelete(s)} className="px-2 py-1 bg-red-600 text-white rounded text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && <Pagination />}
          {stores.length === 0 && <p className="text-center py-4">No stores found.</p>}
        </>
      )}
    </div>
  );
}