import API from "api/axios.config";

const storeService = {
  getStores: (page = 1) =>
    API.get(`/stores?page=${page}`).then((res) => {
      const d = res.data;
      const list =
        Array.isArray(d) ? d :
        Array.isArray(d?.data) ? d.data :
        Array.isArray(d?.stores) ? d.stores : [];

      return {
        list,
        total: Number(d?.total ?? (Array.isArray(list) ? list.length : 0)),
        limit: Number(d?.limit ?? 12),
        page: Number(d?.page ?? page ?? 1),
      };
    }),
};

export default storeService;
