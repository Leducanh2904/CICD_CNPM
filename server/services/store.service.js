const { getAllStoresDb, getStoreByIdDb, createStoreDb, updateStoreDb, deleteStoreDb, getStoreByOwnerDb, getTotalStoresDb } = require("../db/store.db");  // ✅ Thêm getTotalStoresDb vào import
const pool = require("../config");
const { ErrorHandler } = require("../helpers/error");

class StoreService {
  getAllStores = async (page, search) => {  // ✅ Add search param
    const limit = 10;
    const offset = (page - 1) * limit;
    try {
      const stores = await getAllStoresDb({ limit, offset, search });  // ✅ Truyền search vào DB
      console.log("Store service all stores:", stores.length);
      return {
        success: true,
        data: stores,
        totalPages: Math.ceil(50 / limit),
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
      if (!store) {
        throw new ErrorHandler(404, "Store not found");
      }
      console.log("Store service by ID:", store.name);
      return {
        success: true,
        data: store,
      };
    } catch (error) {
      console.error("Store service by ID error:", error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  // ✅ Add (for product check)
  getStoreByOwner = async (ownerId) => {
    try {
      const store = await getStoreByOwnerDb(ownerId);
      if (!store) {
        throw new ErrorHandler(404, "Store not found for owner");
      }
      return store;
    } catch (error) {
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  createStore = async (data) => {
    try {
      // Fix: Case-insensitive check roles (khớp db query lower())
      console.log("ownerid",data.owner_id);
      const { rows: [owner] } = await pool.query("SELECT roles FROM users WHERE user_id = $1", [data.owner_id]);
      if (!owner || owner.roles.toLowerCase() !== 'seller') {  // Thêm .toLowerCase()
        console.warn("Invalid owner roles:", owner?.roles);  // Log để debug nếu fail
        throw new ErrorHandler(400, "Owner must be a seller");
      }
      const store = await createStoreDb(data);
      return {
        success: true,
        data: store,
      };
    } catch (error) {
      console.error("Store service create error:", error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  updateStore = async (id, data) => {
    try {
      if (data.owner_id) {
        // Fix: Case-insensitive check nếu thay owner
        const { rows: [owner] } = await pool.query("SELECT roles FROM users WHERE user_id = $1", [data.owner_id]);
        if (!owner || owner.roles.toLowerCase() !== 'seller') {  // Thêm .toLowerCase()
          console.warn("Invalid owner roles:", owner?.roles);
          throw new ErrorHandler(400, "Owner must be a seller");
        }
      }
      const store = await updateStoreDb({ id, ...data });
      return {
        success: true,
        data: store,
      };
    } catch (error) {
      console.error("Store service update error:", error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  deleteStore = async (id) => {
    try {
      await deleteStoreDb(id);
      return {
        success: true,
        message: "Store deleted successfully",
      };
    } catch (error) {
      console.error("Store service delete error:", error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  // ✅ Thêm method này VÀO TRONG class (indent 2 spaces)
  getTotalStores = async () => {
    try {
      return await getTotalStoresDb();
    } catch (error) {
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };
}  // ✅ Đóng class ở đây, SAU method mới

module.exports = new StoreService();