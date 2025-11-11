const bcrypt = require("bcryptjs");
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
      const { password, email, fullname, username, isSeller } = user;
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

        const roles = isSeller ? 'seller' : 'user';

        const newUser = await createUserDb({
          username,
          password: hashedPassword,
          email,
          fullname,
          roles,
        });

        const { id: cart_id } = await createCartDb(newUser.user_id);

        const token = jwt.sign(
          { id: newUser.user_id, roles, cart_id },
          process.env.SECRET,
          { expiresIn: "15m" }
        );

        const refreshToken = await this.signRefreshToken({
          id: newUser.user_id,
          roles,
          cart_id,
        });

        return {
          token,
          refreshToken,
          user: {
            id: newUser.user_id,
            fullname: newUser.fullname,
            username: newUser.username,
            email: newUser.email,
            phone: newUser.phone,
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
      // ✅ THÊM: Check locked status
      if (user.account_status === 'locked') {
        throw new ErrorHandler(403, "Tài khoản đã bị khóa. Hãy liên hệ admin để biết thêm chi tiết.");
      }
      const {
        password: dbPassword,
        user_id,
        roles,
        cart_id,
        fullname,
        username,
      } = user;

      const isCorrectPassword = await bcrypt.compare(password, dbPassword);
      if (!isCorrectPassword) {
        throw new ErrorHandler(403, "Email or password incorrect.");
      }

      const token = await this.signToken({ id: user_id, roles, cart_id });
      const refreshToken = await this.signRefreshToken({ id: user_id, roles, cart_id });

      return {
        token,
        refreshToken,
        user: { 
          id: user_id, 
          fullname, 
          username, 
          email, 
          phone: user.phone 
        },
      };
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  }

  async signToken(data) {
    try {
      return jwt.sign(data, process.env.SECRET, { expiresIn: "15m" });
    } catch (error) {
      logger.error(error);
      throw new ErrorHandler(500, "An error occurred");
    }
  }

  async signRefreshToken(data) {
    try {
      return jwt.sign(data, process.env.REFRESH_SECRET, { expiresIn: "1h" });
    } catch (error) {
      logger.error(error);
      throw new ErrorHandler(500, error.message);
    }
  }

  async googleLogin(token) {
    try {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const { sub, email, name } = payload;

      let user = await getUserByEmailDb(email);
      
      if (!user) {
        const defaultUsername = email.split('@')[0];
        user = await createUserGoogleDb({
          sub,
          defaultUsername,
          email,
          name,
        });
        
        await createCartDb(user.user_id);
      }

      const token = await this.signToken({ 
        id: user.user_id, 
        roles: user.roles, 
        cart_id: user.cart_id 
      });
      const refreshToken = await this.signRefreshToken({ 
        id: user.user_id, 
        roles: user.roles, 
        cart_id: user.cart_id 
      });

      return {
        token,
        refreshToken,
        user: {
          id: user.user_id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          phone: user.phone,
        },
      };
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  }

  async forgotPassword(email) {
    try {
      const user = await getUserByEmailDb(email);
      if (!user) {
        throw new ErrorHandler(404, "Email not found");
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = await bcrypt.hash(resetToken, 10);
      
      await createResetTokenDb({
        user_id: user.user_id,
        token: hashedToken,
        expires_at: moment().add(1, 'hour').format(),
      });

      await mail.sendResetPasswordEmail(email, resetToken);
      
      return { message: "Reset password email sent" };
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const resetToken = await isValidTokenDb(token);
      if (!resetToken || moment().isAfter(resetToken.expires_at)) {
        throw new ErrorHandler(400, "Invalid or expired token");
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await changeUserPasswordDb(hashedPassword, resetToken.email);
      await deleteResetTokenDb(token);
      await setTokenStatusDb(token, 'used');

      return { message: "Password reset successfully" };
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  }
}

module.exports = new AuthService();