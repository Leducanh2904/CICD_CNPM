const { getAllStoresDb, getStoreByIdDb } = require("../db/store.db");
const { ErrorHandler } = require("../helpers/error");

class StoreService {
  getAllStores = async (page) => {
    const limit = 12;
    const offset = (page - 1) * limit;
    try {
      const stores = await getAllStoresDb({ limit, offset });
      console.log("Store service all stores:", stores.length); // Log
      return {
        success: true,
        data: stores,  // ✅ Đảm bảo nest data
        total: stores.length,  // Tạm
      };
    } catch (error) {
      console.error("Store service error:", error);
      throw new ErrorHandler(500, error.message);
    }
  };

  getStoreById = async (id) => {
    try {
      const store = await getStoreByIdDb(id);
      if (!store) {
        throw new ErrorHandler(404, "Store not found");
      }
      console.log("Store service by ID:", store.name); // Log
      return {
        success: true,
        data: store,
      };
    } catch (error) {
      console.error("Store service by ID error:", error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };
}

module.exports = new StoreService();