import API from "api/axios.config";

const storeService = {
  getStores: (page) =>
   API.get(`/stores?page=${page}`).then(res => {
      // Ưu tiên mảng ở các kiểu payload phổ biến
      const d = res.data;
      if (Array.isArray(d)) return d;
      if (Array.isArray(d?.data)) return d.data;
      if (Array.isArray(d?.stores)) return d.stores;
      return []; // fallback an toàn
    }),
};

export default storeService;