// server/services/store.service.js
const {
  getAllStoresDb,
  getStoreByIdDb,
  createStoreDb,
  updateStoreDb,
  deleteStoreDb,
  getStoreByOwnerDb,
  getTotalStoresDb,          // ✅ đã có
} = require("../db/store.db");

// ❗ Dùng pool hợp nhất (server/db/pool.js), KHÔNG dùng ../config nữa
const pool = require("../db/pool");
const { ErrorHandler } = require("../helpers/error");

class StoreService {
  // ✅ nhận search và phân trang đúng với tổng thực tế
  getAllStores = async (page = 1, search = "") => {
    const limit = 10;
    const offset = (page - 1) * limit;
    try {
      // Nên để DB layer nhận search để WHERE ... ILIKE
      const stores = await getAllStoresDb({ limit, offset, search });

      // Dùng tổng thực từ DB, không hard-code 50
      const total = await getTotalStoresDb({ search }); // -> trả về số nguyên
      const totalPages = Math.max(1, Math.ceil((Number(total) || 0) / limit));

      if (process.env.NODE_ENV === "test") {
        console.log("[StoreService] list:", { count: stores.length, total, page, totalPages, search });
      }

      return {
        success: true,
        data: stores,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      console.error("Store service error:", error);
      throw new ErrorHandler(500, error.message);
    }
  };

  getStoreById = async (id) => {
    try {
      const store = await getStoreByIdDb(id);
      if (!store) throw new ErrorHandler(404, "Store not found");
      if (process.env.NODE_ENV === "test") {
        console.log("Store service by ID:", store.name);
      }
      return { success: true, data: store };
    } catch (error) {
      console.error("Store service by ID error:", error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  // ✅ dùng khi product cần check store theo owner
  getStoreByOwner = async (ownerId) => {
    try {
      const store = await getStoreByOwnerDb(ownerId);
      if (!store) throw new ErrorHandler(404, "Store not found for owner");
      return store;
    } catch (error) {
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  createStore = async (data) => {
    try {
      // Case-insensitive roles
      const { rows: [owner] } = await pool.query(
        "SELECT roles FROM users WHERE user_id = $1",
        [data.owner_id]
      );

      if (!owner || String(owner.roles).toLowerCase() !== "seller") {
        console.warn("Invalid owner roles:", owner?.roles);
        throw new ErrorHandler(400, "Owner must be a seller");
      }

      const store = await createStoreDb(data);
      return { success: true, data: store };
    } catch (error) {
      console.error("Store service create error:", error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  updateStore = async (id, data) => {
    try {
      if (data.owner_id) {
        const { rows: [owner] } = await pool.query(
          "SELECT roles FROM users WHERE user_id = $1",
          [data.owner_id]
        );
        if (!owner || String(owner.roles).toLowerCase() !== "seller") {
          console.warn("Invalid owner roles:", owner?.roles);
          throw new ErrorHandler(400, "Owner must be a seller");
        }
      }
      const store = await updateStoreDb({ id, ...data });
      return { success: true, data: store };
    } catch (error) {
      console.error("Store service update error:", error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  deleteStore = async (id) => {
    try {
      await deleteStoreDb(id);
      return { success: true, message: "Store deleted successfully" };
    } catch (error) {
      console.error("Store service delete error:", error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  // ✅ tính tổng từ DB
  getTotalStores = async (params = {}) => {
    try {
      return await getTotalStoresDb(params);
    } catch (error) {
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };
}

module.exports = new StoreService();
