// server/middleware/verifyToken.js
const jwt = require("jsonwebtoken");
const { ErrorHandler } = require("../helpers/error");

const verifyToken = (req, res, next) => {
  const raw = req.header("auth-token") || req.header("Authorization");
  console.log("🔍 Incoming auth-token header:", raw);

  if (!raw) return next(new ErrorHandler(401, "No token provided"));

  const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;

  // ✅ Ưu tiên JWT_SECRET (nếu test), fallback sang SECRET (nếu server chạy thật)
  const secret = process.env.JWT_SECRET || process.env.SECRET || "testsecret";

  try {
    const decoded = jwt.verify(token, secret);
    // ✅ Chuẩn hoá luôn có cả user_id và id
    req.user = {
      ...decoded,
      user_id: decoded.user_id ?? decoded.id,
      id: decoded.id ?? decoded.user_id,
    };
    next();
  } catch (e) {
    console.error("❌ Token verification failed:", e.message);
    next(new ErrorHandler(401, "Invalid token"));
  }
};

module.exports = verifyToken;
