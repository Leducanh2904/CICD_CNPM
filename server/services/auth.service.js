const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  setTokenStatusDb,
  createResetTokenDb,
  deleteResetTokenDb,
  isValidTokenDb,
} = require("../db/auth.db");
const validateUser = require("../helpers/validateUser");
const { ErrorHandler } = require("../helpers/error");
const { changeUserPasswordDb } = require("../db/user.db");
const {
  getUserByEmailDb,
  getUserByUsernameDb,
  createUserDb,
  createUserGoogleDb,
} = require("../db/user.db");
const { createCartDb } = require("../db/cart.db");
const mail = require("./mail.service");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const moment = require("moment");
const { logger } = require("../utils/logger");
let curDate = moment().format();

class AuthService {
  async signUp(user) {
    try {
      const { password, email, fullname, username } = user;
      if (!email || !password || !fullname || !username) {
        throw new ErrorHandler(401, "all fields required");
      }

      if (validateUser(email, password)) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const userByEmail = await getUserByEmailDb(email);
        const userByUsername = await getUserByUsernameDb(username);

        if (userByEmail) throw new ErrorHandler(401, "email taken already");
        if (userByUsername) throw new ErrorHandler(401, "username taken already");

        // ✅ FIX: Tạo user
        const newUser = await createUserDb({
          ...user,
          password: hashedPassword,
        });

        // ✅ FIX: Tạo cart với newUser.user_id (không newUser.id)
        const { id: cart_id } = await createCartDb(newUser.user_id);

        // gán role mặc định nếu DB chưa set
        const roles = newUser.roles || "user";

        // ✅ FIX: Token dùng newUser.user_id thay newUser.id
        const token = jwt.sign(
          { id: newUser.user_id, roles, cart_id },  // id = user_id
          process.env.SECRET,
          { expiresIn: "15m" }
        );

        const refreshToken = await this.signRefreshToken({
          id: newUser.user_id,  // FIX
          roles,
          cart_id,
        });

        return {
          token,
          refreshToken,
          user: {
            id: newUser.user_id,  // FIX: Trả user.id = user_id
            fullname: newUser.fullname,
            username: newUser.username,
            email: newUser.email,
          },
        };
      } else {
        throw new ErrorHandler(401, "Input validation error");
      }
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  }

  async login(email, password) {
    try {
      if (!validateUser(email, password)) {
        throw new ErrorHandler(403, "Invalid login");
      }

      const user = await getUserByEmailDb(email);
      if (!user) throw new ErrorHandler(403, "Email or password incorrect.");
      if (user.google_id && !user.password) {
        throw new ErrorHandler(403, "Login in with Google");
      }
      const {
        password: dbPassword,
        user_id,  // ✅ FIX: Destruct user_id thay id
        roles,
        cart_id,
        fullname,
        username,
      } = user;

      const isCorrectPassword = await bcrypt.compare(password, dbPassword);
      if (!isCorrectPassword) {
        throw new ErrorHandler(403, "Email or password incorrect.");
      }

      // ✅ FIX: Token dùng user_id
      const token = await this.signToken({ id: user_id, roles, cart_id });
      const refreshToken = await this.signRefreshToken({ id: user_id, roles, cart_id });

      return {
        token,
        refreshToken,
        user: { id: user_id, fullname, username, email },  // FIX: user.id = user_id
      };
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  }

  // ✅ Giữ nguyên signToken (sử dụng id từ data)
  async signToken(data) {
    try {
      return jwt.sign(data, process.env.SECRET, { expiresIn: "15m" });
    } catch (error) {
      logger.error(error);
      throw new ErrorHandler(500, "An error occurred");
    }
  }

  // ✅ Giữ nguyên signRefreshToken
  async signRefreshToken(data) {
    try {
      return jwt.sign(data, process.env.REFRESH_SECRET, { expiresIn: "1h" });
    } catch (error) {
      logger.error(error);
      throw new ErrorHandler(500, error.message);
    }
  }

  // ✅ Giữ nguyên các hàm khác (googleLogin, forgotPassword, resetPassword, etc.)
  // ... (paste tất cả code còn lại của file cũ vào đây, ví dụ googleLogin nếu có)
  // Ví dụ placeholder cho các hàm khác:
  // async googleLogin(...) { ... }
  // async forgotPassword(...) { ... }
  // async resetPassword(...) { ... }
  // etc.
}

module.exports = new AuthService();