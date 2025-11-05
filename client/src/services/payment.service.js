import API from "api/axios.config";

class PaymentService {
  createIntent(data) {
    return API.post("/payment/create-intent", data);
  }
  verify(orderRef) {
    return API.post("/payment/verify", { orderRef });
  }
}

export default new PaymentService();