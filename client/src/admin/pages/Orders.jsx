import { useEffect, useState } from "react";
import adminApi from "../api/adminApi";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = async (page = 1) => {
    setLoading(true);
    setCurrentPage(page);
    try {
      const res = await adminApi.get(`/api/orders/admin/all?page=${page}`);
      const data = res.data?.items ?? res.data;
      setOrders(Array.isArray(data) ? data : []);
      setTotalPages(res.data?.totalPages || Math.ceil((res.data?.total || 0) / 10));
    } catch (err) {
      console.error("Load orders error:", err?.response || err);
      alert("Cannot load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

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
        <h1 className="text-2xl font-bold">Manage Orders</h1>
        <button onClick={() => load(1)} className="px-4 py-2 border rounded">Refresh</button>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading orders...</div>
      ) : (
        <>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">ID</th>
                <th className="border p-2">User</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Total</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="border p-2">#{o.id}</td>
                  <td className="border p-2">{o.user_name || o.user_email || 'N/A'}</td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded text-sm ${o.status === 'completed' ? 'bg-green-200' : o.status === 'pending' ? 'bg-yellow-200' : 'bg-red-200'}`}>
                      {o.status || 'Pending'}
                    </span>
                  </td>
                  <td className="border p-2">${o.amount }</td>
                  <td className="border p-2">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="border p-2">
                    {/* <button className="mr-2 px-2 py-1 bg-blue-500 text-white rounded text-sm">View</button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && <Pagination />}
          {orders.length === 0 && <p className="text-center py-4">No orders found.</p>}
        </>
      )}
    </div>
  );
}