import API from "api/axios.config";

class OrderService {
  createOrder(amount, itemTotal, ref, paymentMethod, addressData) {
    return API.post("/orders/create", {
      amount,
      itemTotal,
      ref,
      paymentMethod,
      addressData,
    });
  }
  getAllOrders(page) {
    return API.get(`/orders/?page=${page}`);
  }
  getOrder(id) {
    return API.get(`/orders/${id}`);
  }
  updateOrderStatus(ref, status) {
    return API.patch(`/orders/${ref}/status`, { status });
  }
}

export default new OrderService();
