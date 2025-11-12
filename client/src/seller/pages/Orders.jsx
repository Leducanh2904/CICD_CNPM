import { useEffect, useState } from "react";
import sellerApi from "../api/sellerApi";
import OrderAction from "../components/OrderAction";
import { formatCurrency } from "../../helpers/formatCurrency";

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [storeLoading, setStoreLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // ✅ For order details modal
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false); // ✅ Loading for details

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await sellerApi.get("/stores/my");
        const storeData = res.data.data || res.data; // ✅ Handle wrap or direct
        setStoreId(storeData.id);
      } catch (err) {
        console.error("Load store error:", err?.response || err);
        alert("Bạn hãy liên hệ admin để đăng ký cửa hàng");
      } finally {
        setStoreLoading(false);
      }
    };
    fetchStore();
  }, []);

  const load = async (page = 1) => {
    if (!storeId) return;
    setLoading(true);
    setCurrentPage(page);
    try {
      const res = await sellerApi.get(`/orders/seller/my?page=${page}`);
      const data = res.data?.items ?? res.data;
      setOrders(Array.isArray(data) ? data : []);
      setTotalPages(res.data?.totalPages || Math.ceil((res.data?.total || 0) / 10)); // ✅ Fix pagination
    } catch (err) {
      console.error("Load orders error:", err?.response || err);
      alert("Cannot load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) load(1);
  }, [storeId]);

  // ✅ Fetch order details for modal (now backend supports)
const fetchOrderDetails = async (orderId) => {
    setOrderDetailsLoading(true);
    try {
      const res = await sellerApi.get(`/orders/${orderId}`);
      setSelectedOrder(res.data);
    } catch (err) {
      console.error("Load order details error:", err?.response?.data || err);
      // ✅ Enhanced fallback: Basic from list + dummy items if needed
      const basicOrder = orders.find(o => o.id === orderId);
      setSelectedOrder(basicOrder ? { ...basicOrder, items: [{ name: 'Item (details unavailable)', quantity: 1, line_total: basicOrder.amount }] } : null);
      // No alert: Silent fallback
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  // ✅ Fix: Update state with full returned order (backend now returns full)
const onUpdated = (updatedOrder) => {
    if (updatedOrder && updatedOrder.status) {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
      load(currentPage);
    }
  };

  const openOrderDetails = (order) => {
    fetchOrderDetails(order.id);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
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

  // ✅ Enhanced Order Details Modal (show items, address)
  const OrderDetailsModal = ({ order, onClose, loading }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Order #{order?.id}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>
          {loading ? (
            <p className="text-center py-4">Loading details...</p>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                <p><strong>User:</strong> {order?.user_name || order?.user_email || 'N/A'}</p>
                <p><strong>Phone:</strong> {order?.phone || 'N/A'}</p>
                <p><strong>Total:</strong> {formatCurrency(order?.amount || order?.total)}</p>
                <p><strong>Status:</strong>
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${order?.status === 'completed' ? 'bg-green-200' : order?.status === 'preparing' ? 'bg-blue-200' : order?.status === 'pending' ? 'bg-yellow-200' : order?.status === 'canceled' ? 'bg-red-200' : 'bg-gray-200'}`}>
                    {order?.status || 'Pending'}
                  </span>
                </p>
                {order?.addressData && (
                  <div>
                    <strong>Delivery Address:</strong>
                    <p className="ml-2">{order.addressData.full_name}, {order.addressData.address} ({order.addressData.city}, {order.addressData.country})</p>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <h3 className="font-bold mb-2">Items to Prepare:</h3>
                {order?.items && order.items.length > 0 ? (
                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="border-b pb-2">
                        <div className="flex justify-between">
                          <span>{item.name || item.item_name} (x{item.quantity})</span>
                          <span>{formatCurrency(item.line_total)}</span>
                        </div>
                        {item.description && <p className="text-sm text-gray-600 ml-2">{item.description}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                <p className="text-gray-500">No items details available (contact user if needed)</p>                )}
              </div>  
              <button onClick={onClose} className="w-full px-4 py-2 bg-blue-600 text-white rounded">Close</button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (storeLoading) return <div className="text-center py-4">Loading store...</div>;

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
                <th className="border p-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="border p-2">#{o.id}</td>
                  <td className="border p-2">{o.user_name || o.user_email || 'N/A'}</td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded text-sm ${o.status === 'completed' ? 'bg-green-200' : o.status === 'preparing' ? 'bg-blue-200' : o.status === 'pending' ? 'bg-yellow-200' : o.status === 'canceled' ? 'bg-red-200' : 'bg-gray-200'}`}>
                      {o.status || 'Pending'}
                    </span>
                  </td>
                  <td className="border p-2">{formatCurrency(o.amount)}</td>
                  <td className="border p-2">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="border p-2">
                    <OrderAction order={o} onUpdated={onUpdated} />
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => openOrderDetails(o)}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                      title="View details"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && <Pagination />}
          {orders.length === 0 && <p className="text-center py-4">No orders found.</p>}
        </>
      )}
      {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={closeOrderDetails} loading={orderDetailsLoading} />}
    </div>
  );
}