const {
  createUserDb,
  getUserByEmailDb,
  createUserGoogleDb,
  changeUserPasswordDb,
  getUserByIdDb,
  updateUserDb,
  deleteUserDb,
  getAllUsersDb,
  getUserByUsernameDb,
  getUsersByRoleDb,  
  getTotalUsersDb,
  updateStatusDb,  // Existing
  getSellersWithoutStoreDb,  // ✅ Thêm import nếu chưa có
} = require("../db/user.db");
const { ErrorHandler } = require("../helpers/error");

class UserService {
  createUser = async (user) => {
    try {
      return await createUserDb(user);
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };
  getUserByEmail = async (email) => {
    try {
      const user = await getUserByEmailDb(email);
      return user;
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };
  getUserByUsername = async (username) => {
    try {
      const user = await getUserByUsernameDb(username);
      return user;
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };
  getUserById = async (id) => {
    try {
      const user = await getUserByIdDb(id);
      user.password = undefined;
      user.google_id = undefined;
      user.cart_id = undefined;
      return user;
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };
  createGoogleAccount = async (user) => {
    try {
      return await createUserGoogleDb(user);
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };
  changeUserPassword = async (password, email) => {
    try {
      return await changeUserPasswordDb(password, email);
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };
  updateUser = async (user) => {
    const { email, username, id } = user;
    const errors = {};
    try {
      const getUser = await getUserByIdDb(id);
      const findUserByEmail = await getUserByEmailDb(email);
      const findUserByUsername = await getUserByUsernameDb(username);
      const emailChanged =
        email && getUser.email.toLowerCase() !== email.toLowerCase();
      const usernameChanged =
        username && getUser.username.toLowerCase() !== username.toLowerCase();

      if (emailChanged && typeof findUserByEmail === "object") {
        errors["email"] = "Email is already taken";
      }
      if (usernameChanged && typeof findUserByUsername === "object") {
        errors["username"] = "Username is already taken";
      }

      if (Object.keys(errors).length > 0) {
        throw new ErrorHandler(403, errors);
      }

      return await updateUserDb(user);
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };

  deleteUser = async (id) => {
    try {
      return await deleteUserDb(id);
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };

getAllUsers = async () => {
  try {
    let results = await getAllUsersDb(); 
    results = results.filter(user => user.roles !== 'admin');
    return results;
  } catch (error) {
    throw new ErrorHandler(error.statusCode || 500, error.message);
  }
};

  getUsersByRole = async (role) => {
    try {
      return await getUsersByRoleDb(role);  
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };

  getTotalUsers = async () => {
    try {
      return await getTotalUsersDb();
    } catch (error) {
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  updateStatus = async ({ id, status, reason }) => {
    try {
      if (!['locked', 'active'].includes(status)) {
        throw new ErrorHandler(400, 'Status must be "locked" or "active"');
      }
      if (!reason || reason.trim().length < 10) {
        throw new ErrorHandler(400, 'Reason must be at least 10 characters');
      }
      const updatedUser = await updateStatusDb({
        id,
        status,
        lockReason: status === 'locked' ? reason : null,
        unlockReason: status === 'active' ? reason : null,
      });
      // Hide sensitive fields
      updatedUser.password = undefined;
      updatedUser.google_id = undefined;
      updatedUser.cart_id = undefined;
      return updatedUser;
    } catch (error) {
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  // ✅ THÊM: Method này VÀO TRONG class (indent 2 spaces, trước } đóng class)
  getSellersWithoutStore = async () => {
    try {
      return await getSellersWithoutStoreDb();
    } catch (error) {
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };
}  // ✅ Đóng class SAU method mới

module.exports = new UserService();