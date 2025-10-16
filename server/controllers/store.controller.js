const storeService = require("../services/store.service");

const getAllStores = async (req, res) => {
  const { page = 1 } = req.query;
  try {
    const result = await storeService.getAllStores(parseInt(page));
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

<<<<<<< Updated upstream
module.exports = {
  getAllStores,
  getStoreById,
=======
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

module.exports = {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
>>>>>>> Stashed changes
};