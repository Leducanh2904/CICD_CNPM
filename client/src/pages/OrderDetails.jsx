import { Badge, Card, CardBody } from "@windmill/react-ui";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "helpers/formatCurrency";
import Layout from "layout/Layout";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import orderService from "services/order.service";

const OrderDetails = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Base URL cho images từ backend
  const getBackendBase = () => {
    if (import.meta.env.PROD) {
      const env = import.meta.env.VITE_API_URL || '';
      if (env) return env.replace(/\/api\/?$/, '').replace(/\/$/, '');
      if (typeof window !== 'undefined') return window.location.origin;
      return '';
    }
    return 'http://localhost:10000';
  };

  const BASE_IMAGE_URL = getBackendBase();

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await orderService.getOrder(id);
        console.log("Fetched order data:", res.data);  // Debug: Xem structure API trả về
        setOrder(res.data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Không thể tải chi tiết đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="my-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="my-4">
          <h1 className="font-bold text-2xl text-red-500">Lỗi</h1>
          <p>{error || "Đơn hàng không tồn tại"}</p>
        </div>
      </Layout>
    );
  }

  // Merge with state.order for fallback
  const fullOrder = { ...state?.order, ...order };
  const { ref, amount, total, status = "pending", created_at: date, items = [] } = fullOrder;
  const itemsCount = total || items.length || 0;
  const formattedDate = date && typeof date === 'string' ? format(parseISO(date), "d MMM, yyyy") : new Date().toLocaleDateString();

  return (
    <Layout>
      <div className="my-4">
        <h1 className="font-bold text-2xl">Order Details</h1>
        <p>Order no: #{ref || id || fullOrder.order_id}</p>
        <p>{`${itemsCount} items`}</p>
        <p>
          Status: <Badge type="success">{status}</Badge>
        </p>
        <p>Total Amount: {formatCurrency(amount || total || 0)}</p>
        <p>Placed on: {formattedDate}</p>
        <div className="border-t-2">
          <h1 className="font-bold text-xl">Items in your order</h1>
          {items.length > 0 ? (
            items.map((item) => (
              <Card key={item.id || item.product_id} className="flex my-4 p-2 md:flex-row flex-col">
                <img
                  className="sm:w-full md:w-1/2 lg:w-1/3 object-contain md:object-cover"
                  loading="lazy"
                  decoding="async"
                  src={`${BASE_IMAGE_URL}${item.image_url || '/placeholder-image.jpg'}`}
                  alt={item.name || item.item_name}
                />
                <CardBody>
                  <h1 className="font-semibold text-gray-600">{item.name || item.item_name}</h1>
                  <p className="mb-2">{formatCurrency(item.price || item.unit_price || 0)}</p>
                  <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                  <p className="mt-2">Quantity: {item.quantity}</p>
                  {item.line_total && <p className="mt-1 font-semibold">Subtotal: {formatCurrency(item.line_total)}</p>}
                </CardBody>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 mt-2">Không có sản phẩm nào trong đơn hàng này.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetails;