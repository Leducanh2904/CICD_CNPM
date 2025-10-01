import API from "api/axios.config";

class ProductService {
  getProducts(page) {
    return API.get(`/products/?page=${page}`);
  }
  getProduct(id) {
    return API.get(`/products/id/${id}`);  // ✅ Fix: Route chính xác là /id/:id theo BE
  }
  getProductBySlug(slug) {
    // ✅ FIX: Thêm no-cache headers để tránh 304 (cache cũ) và force fetch fresh data
    return API.get(`/products/${slug}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }).then(response => {
      return response;
    }).catch(error => {
      throw error;
    });
  }
  getProductByName(name) {
    return API.get(`/products/name/${name}`);  // ✅ Fix: Route chính xác là /name/:name theo BE
  }
}

export default new ProductService();