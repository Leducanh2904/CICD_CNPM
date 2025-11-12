import { useState } from "react";
import sellerApi from "../api/sellerApi";

export default function OrderAction({ order, onUpdated }) {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus) => {
    // ✅ Optimistic: Update UI ngay (fallback nếu fail)
    onUpdated && onUpdated({ ...order, status: newStatus });

    setLoading(true);
    try {
      const res = await sellerApi.patch(`/orders/${order.ref}/status`, { status: newStatus });
      if (res.status === 200) {
        onUpdated && onUpdated(res.data); // Update with real full order
      } else {
        // Rollback optimistic if not 200
        onUpdated && onUpdated(order);
        throw new Error("Unexpected response");
      }
    } catch (err) {
      console.error("Update order status error:", err?.response?.data || err);
      // ✅ No alert: Chỉ log, UI fallback to old (or keep optimistic if partial OK)
      // Rollback to original
      onUpdated && onUpdated(order);
    } finally {
      setLoading(false);
    }
  };

  if (order.status === "pending") {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => updateStatus("preparing")}
          className="px-2 py-1 bg-green-500 text-white rounded text-sm"
          disabled={loading}
        >
          {loading ? "..." : "Approve"}
        </button>
        <button
          onClick={() => updateStatus("canceled")}
          className="px-2 py-1 bg-red-600 text-white rounded text-sm"
          disabled={loading}
        >
          {loading ? "..." : "Deny"}
        </button>
      </div>
    );
  } else if (order.status === "preparing") {
    return (
      <button
        onClick={() => updateStatus("delivery")}
        className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
        disabled={loading}
      >
        {loading ? "..." : "Ready for Delivery"}
      </button>
    );
  }
  return null;
}