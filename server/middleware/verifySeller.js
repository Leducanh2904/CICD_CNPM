app.get('/api/health', (req, res) => res.status(200).send('ok'));
app.head('/api/health', (req, res) => res.sendStatus(200));
const { ErrorHandler } = require("../helpers/error");

module.exports = (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler(401, "Unauthorized"));
  }
  if (req.user.roles.toLowerCase() !== "seller") {
    return next(new ErrorHandler(403, "Access denied - Seller only"));
  }
  next();
};