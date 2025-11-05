const {
  getUsersByRole, 
  createUser,
  deleteUser,
  getUserById,
  updateUser,
  getUserProfile,
  lockUser,  
  unlockUser,  
  getAvailableSellers,
} = require("../controllers/users.controller");
const router = require("express").Router();
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyToken = require("../middleware/verifyToken");

router.use(verifyToken);
router.route("/").get(verifyAdmin, getUsersByRole).post(verifyAdmin, createUser);  
router.route("/profile").get(getUserProfile);
router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

// New: Lock/Unlock user
router.route("/:id/lock").post(verifyToken, verifyAdmin, lockUser);
router.route("/:id/unlock").post(verifyToken, verifyAdmin, unlockUser);

// New: Available sellers without store
router.route("/sellers/available").get(verifyToken, verifyAdmin, getAvailableSellers);

module.exports = router;