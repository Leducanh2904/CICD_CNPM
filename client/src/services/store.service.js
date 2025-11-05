import API from "api/axios.config";

const storeService = {
  getStores: (page) => API.get(`/stores?page=${page}`),
};

export default storeService;