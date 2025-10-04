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

module.exports = {
  getAllStores,
  getStoreById,
};