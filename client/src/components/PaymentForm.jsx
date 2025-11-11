import { Button, HelperText } from "@windmill/react-ui";
import { useCart } from "context/CartContext";
import { formatCurrency } from "helpers/formatCurrency";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PulseLoader from "react-spinners/PulseLoader";
import toast from "react-hot-toast";
import OrderService from "services/order.service";
import PaymentService from "services/payment.service";
import OrderSummary from "./OrderSummary";

const PaymentForm = ({ previousStep, addressData }) => {  
  const { cartSubtotal, cartTotal, cartData, setCartData, clearCart } = useCart();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);
  const [orderRef, setOrderRef] = useState(null);
  const navigate = useNavigate();

  // Base URL cho images từ backend (dùng cho OrderSummary nếu cần pass down)
  const BASE_IMAGE_URL = 'http://localhost:10000';

  const createQR = async () => {
    setError(null);
    setIsProcessing(true);

    try {
      const ref = `ORDER-${Date.now()}`;
      setOrderRef(ref);

      // Tạo QR ngẫu nhiên từ fullname + total (ngẫu nhiên bằng random string) - chỉ demo, chưa tạo order
      const randomStr = Math.random().toString(36).substring(7);  // Random string
      const qrData = encodeURIComponent(`${addressData.fullname || 'User'}, Pay ${formatCurrency(cartTotal)} - Ref: ${ref} - Random: ${randomStr}`);
      // Override qrUrl với data mới (ngẫu nhiên)
      const newQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;
      setQrUrl(newQrUrl);

      // toast.success("QR đã tạo! Quét để thanh toán (demo).");
    } catch (error) {
      setError(error.message || "Lỗi tạo QR");
      toast.error("Lỗi, vui lòng thử lại");
    } finally {
      setIsProcessing(false);
    }
  };

  // Tự động tạo QR khi component mount (chỉ QR, chưa insert DB)
  useEffect(() => {
    if (!qrUrl && !isProcessing) {
      createQR();
    }
  }, [qrUrl, isProcessing]);

  const handlePaymentSuccess = async () => {
    if (!orderRef) {
      toast.error("Chưa tạo QR");
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      // Bước 1: Tạo order pending (insert DB)
      await OrderService.createOrder(cartSubtotal, cartTotal, orderRef, "qr", addressData); 
      toast.success("Đặt hàng thành công!");

      // Clear cart ngay sau tạo order thành công
      await clearCart();

      // Bước 2: Tạo payment intent
      await PaymentService.createIntent({
        amount: cartTotal,
        orderRef: orderRef,
      });

      // Bước 3: Verify payment (giả sử verify sau khi quét QR)
      await PaymentService.verify(orderRef);

      toast.success("Thanh toán thành công! Hóa đơn đã lưu.");
      navigate("/confirmation", { state: { orderRef } });
    } catch (error) {
      // Kiểm tra nếu là Axios error để lấy response
      if (error.response) {
        setError(`Lỗi ${error.response.status}: ${error.response.data?.message || error.message}`);
      } else {
        setError(error.message || "Lỗi thanh toán không xác định");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full md:w-1/2">
      <h1 className="text-3xl font-semibold text-center mb-2">Checkout</h1>
      <OrderSummary baseImageUrl={BASE_IMAGE_URL} />  {/* Pass BASE_IMAGE_URL xuống OrderSummary để fix ảnh */}

      <h1 className="font-medium text-2xl mb-4">Thanh Toán Bằng QR </h1>
      <div className="text-center mb-4 p-4 border rounded bg-gray-50">
        <p className="text-gray-600 mb-2">Quét mã QR để thanh toán</p>
        {isProcessing && !qrUrl ? (
          <div className="mx-auto border rounded mb-2 w-48 h-48 bg-gray-200 flex items-center justify-center">
            <PulseLoader size={20} color="#3B82F6" />
          </div>
        ) : !qrUrl ? (
          <div className="mx-auto border rounded mb-2 w-48 h-48 bg-gray-200 flex items-center justify-center">
            Đang tạo QR...
          </div>
        ) : (
          <img 
            src={qrUrl} 
            alt="QR Code Payment" 
            className="mx-auto border rounded mb-2" 
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/200?text=QR+Demo';
            }}
          />
        )}
        <p className="text-sm text-gray-500">Tổng: {formatCurrency(cartSubtotal)}</p>
        <Button 
          onClick={handlePaymentSuccess} 
          disabled={isProcessing || !qrUrl} 
          size="small" 
          className="mt-2 bg-green-500 hover:bg-green-600"
        >
          {isProcessing ? <PulseLoader size={10} color="#fff" /> : "Thanh Toán"}
        </Button>
      </div>

      {error && <HelperText valid={false}>{error}</HelperText>}
      <div className="flex justify-between py-4">
        <Button onClick={previousStep} layout="outline" size="small">
          Back
        </Button>
      </div>
    </div>
  );
};

export default PaymentForm;