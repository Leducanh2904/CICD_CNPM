import API from "api/axios.config";

class ProductService {
  getProducts(page) {
    return API.get(`/products/?page=${page}`);
  }
  getProduct(id) {
    return API.get(`/products/id/${id}`); 
  }
  getProductBySlug(slug) {
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
    return API.get(`/products/name/${name}`); 
  }

  getStoreProducts(storeId, page) {
    return API.get(`/stores/${storeId}/products?page=${page}`);
  }
}

export default new ProductService();