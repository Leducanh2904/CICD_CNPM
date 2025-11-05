const userService = require("../services/user.service");
const { ErrorHandler } = require("../helpers/error");
const { hashPassword } = require("../helpers/hashPassword");

const getAllUsers = async (req, res) => {
  const results = await userService.getAllUsers();
  res.status(200).json(results);
};

const createUser = async (req, res) => {
  const { username, password, email, fullname } = req.body;
  const hashedPassword = hashPassword(password);

  const user = await userService.createUser({
    username,
    hashedPassword,
    email,
    fullname,
  });

  res.status(201).json({
    status: "success",
    user,
  });
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  if (+id === req.user.id || req.user.roles.includes("admin")) {
    try {
      const user = await userService.getUserById(id);
      return res.status(200).json(user);
    } catch (error) {
      throw new ErrorHandler(error.statusCode, "User not found");
    }
  }
  throw new ErrorHandler(401, "Unauthorized");
};

const getUserProfile = async (req, res) => {
  const { id } = req.user;

  const user = await userService.getUserById(id);

  return res.status(200).json(user);
};

const updateUser = async (req, res) => {
  const { username, email, fullname, address, city, state, country } = req.body;
  if (+req.params.id === req.user.id || req.user.roles.includes("admin")) {
    try {
      const results = await userService.updateUser({
        username,
        email,
        fullname,
        address,
        city,
        state,
        country,
        id: req.params.id,
      });
      return res.status(201).json(results);
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  }
  throw new ErrorHandler(401, "Unauthorized");
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (+id === req.user.id || req.user.roles.includes("admin")) {
    try {
      const result = await userService.deleteUser(id);
      res.status(200).json(result);
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  }
  throw new ErrorHandler(401, "Unauthorized");
};

const allowedRoles = ['user', 'admin', 'seller'];  
const getUsersByRole = async (req, res) => {
  const { role } = req.query;
  let results;
  if (role) {
    if (!allowedRoles.includes(role)) {
      throw new ErrorHandler(400, `Unsupported role: ${role}. Allowed: ${allowedRoles.join(', ')}`);
    }
    results = await userService.getUsersByRole(role);
  } else {
    results = await userService.getAllUsers();
  }
  res.status(200).json(results);
};

const lockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;  // Require reason
    if (!reason) {
      return res.status(400).json({ error: 'Lock reason is required' });
    }
    const updated = await userService.updateStatus({ id, status: 'locked', reason });
    res.json({ success: true, user: updated });
  } catch (error) {
    console.error('Controller Error in lockUser:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const unlockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;  // Require reason
    if (!reason) {
      return res.status(400).json({ error: 'Unlock reason is required' });
    }
    const updated = await userService.updateStatus({ id, status: 'active', reason });
    res.json({ success: true, user: updated });
  } catch (error) {
    console.error('Controller Error in unlockUser:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const getAvailableSellers = async (req, res) => {
  try {
    const sellers = await userService.getSellersWithoutStore();
    res.status(200).json(sellers);
  } catch (error) {
    console.error('Controller Error in getAvailableSellers:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  getUsersByRole,
  lockUser,
  unlockUser,
  getAvailableSellers
};