import { useEffect, useState } from "react";
import sellerApi from "../api/sellerApi";
import MenuForm from "../components/MenuForm";
import { formatCurrency } from "../../helpers/formatCurrency";

export default function SellerMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [storeLoading, setStoreLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await sellerApi.get("/api/stores/my");
        const storeData = res.data.data || res.data;  // ✅ Handle wrap
        setStoreId(storeData.id);
      } catch (err) {
        console.error("Load store error:", err?.response || err);
        alert("Bạn hãy liên hệ admin để đăng ký cửa hàng.");
        const addbutton = document.getElementById('addbutton');
        addbutton.disabled = true;
        addbutton.style.backgroundColor = 'lightgray';
      } finally {
        setStoreLoading(false);
      }
    };
    fetchStore();
  }, []);
  const BASE_IMAGE_URL = 'http://localhost:9000';
  const load = async (page = 1) => {
    if (!storeId) return;
    setLoading(true);
    setCurrentPage(page);
    try {
      const res = await sellerApi.get(`/api/products/stores/${storeId}/products?page=${page}`);
      const data = res.data?.data ?? res.data;
      setMenuItems(Array.isArray(data) ? data : (data.products || data.data || []));
      setTotalPages(res.data?.totalPages || Math.ceil((res.data?.totalItems || 0) / 12));
    } catch (err) {
      console.error("Load menu error:", err?.response || err);
      alert("Bạn hãy liên hệ admin để đăng ký cửa hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) load(1);
  }, [storeId]);

  const onSaved = () => {
    setShowForm(false);
    setEditing(null);
    load(currentPage);  // ✅ Refetch to sync
  };

  const onDelete = async (item) => {
    if (!confirm(`Delete item "${item.name}"?`)) return;
    try {
      await sellerApi.delete(`/api/products/${item.slug}`);
      load(currentPage);  // ✅ Refetch after delete
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

  if (storeLoading) return <div className="text-center py-4">Loading store...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Menu</h1>
        <div>
          <button id="addbutton" onClick={() => { setEditing(null); setShowForm(true); }} className="px-4 py-2 bg-green-600 text-white rounded">Add Item</button>
          <button onClick={() => load(1)} className="ml-2 px-4 py-2 border rounded">Refresh</button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border rounded bg-white">
          <MenuForm initial={editing} onSaved={onSaved} onCancel={() => { setShowForm(false); setEditing(null); }} storeId={storeId} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">Loading menu items...</div>
      ) : (
        <>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Name</th>
                <th className="border p-2">Price</th>
                <th className="border p-2">Stock</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Image</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border p-2 font-medium">{item.name}</td>
                  <td className="border p-2">{formatCurrency(item.price)}</td>
                  <td className="border p-2">{item.stock}</td>
                  <td className="border p-2 max-w-xs truncate">{item.description}</td>
                  <td className="border p-2">
                    {item.image_url ? <img src={`${BASE_IMAGE_URL}${item.image_url || '/placeholder-image.jpg'}`} alt={item.name} className="w-12 h-12 object-cover rounded" /> : 'No image'}
                  </td>
                  <td className="border p-2">
                    <button onClick={() => { setEditing(item); setShowForm(true); }} className="mr-2 px-2 py-1 bg-blue-500 text-white rounded text-sm">Edit</button>
                    <button onClick={() => onDelete(item)} className="px-2 py-1 bg-red-600 text-white rounded text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && <Pagination />}
          {menuItems.length === 0 && <p className="text-center py-4">No menu items found. Add some!</p>}
        </>
      )}
    </div>
  );
}