
const jwt = require("jsonwebtoken");
const { ErrorHandler } = require("../helpers/error");

const verifyToken = (req, res, next) => {
 try {
  let header = req.header("auth-token") || req.header("authorization");
    if (!header) return next(new ErrorHandler(401, "Token missing"));

    // Hỗ trợ cả "Bearer <token>"
   let token = header.startsWith("Bearer ") ? header.slice(7) : header;

    const decoded = jwt.verify(token, process.env.SECRET);
   req.user = decoded;                // { id, roles, cart_id, iat, exp }
   // Alias để tương thích code cũ
    if (!req.user.user_id) req.user.user_id = decoded.id;

    next();
  } catch (err) {
    next(new ErrorHandler(401, err.message || "Invalid Token"));
  }
};

module.exports = verifyToken;
