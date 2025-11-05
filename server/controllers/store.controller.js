const storeService = require("../services/store.service");

const getAllStores = async (req, res) => {
  const { page = 1, search } = req.query;  // ✅ Add search query param
  try {
    const result = await storeService.getAllStores(parseInt(page), search);  // ✅ Truyền search vào service
    console.log("Store controller all stores response:", result.data.length);
    res.json(result); 
  } catch (error) {
    console.error('Get all stores error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getStoreById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await storeService.getStoreById(id);
    console.log("Store controller by ID response:", result.data.name); 
    res.json(result);
  } catch (error) {
    console.error('Get store by id error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const createStore = async (req, res) => {
  console.log("Hit createStore controller: POST /api/stores, body:", req.body);  // Thêm log để confirm hit
  try {
    const { name, description, email, phone, owner_id, is_active } = req.body;
    const result = await storeService.createStore({
      name,
      description,
      email,
      phone,
      owner_id,
      is_active: is_active === 'true' || is_active === true,
    });
    res.status(201).json(result);
  } catch (error) {
    console.error('Create store error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const updateStore = async (req, res) => {
  const { id } = req.params;
  console.log(`Hit updateStore controller: PUT /api/stores/${id}, body:`, req.body);  // Thêm log để confirm hit
  try {
    const { name, description, email, phone, owner_id, is_active } = req.body;
    const result = await storeService.updateStore(id, {
      name,
      description,
      email,
      phone,
      owner_id,
      is_active: is_active === 'true' || is_active === true,
    });
    res.json(result);
  } catch (error) {
    console.error('Update store error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const deleteStore = async (req, res) => {
  const { id } = req.params;
  console.log(`Hit deleteStore controller: DELETE /api/stores/${id}`);  // Thêm log
  try {
    const result = await storeService.deleteStore(id);
    res.json(result);
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ✅ New: Get own store (with extra logging for debug)
const getMyStore = async (req, res) => {
  try {
    const ownerId = req.user.user_id || req.user.id;
    if (!ownerId) {
      console.error("🔍 No ownerId from req.user – check verifyToken");
      return res.status(401).json({ message: "User ID not found in token" });
    }
    const store = await storeService.getStoreByOwner(ownerId);
    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found for this seller" });
    }
    res.json({ success: true, data: store });  // ✅ Wrap consistent
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  getMyStore,
};