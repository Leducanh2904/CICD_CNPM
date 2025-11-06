app.get('/api/health', (req, res) => res.status(200).send('ok'));
app.head('/api/health', (req, res) => res.sendStatus(200));
const { ErrorHandler } = require("../helpers/error");

module.exports = (req, res, next) => {
  const { roles } = req.user;
  if (roles && roles.includes("admin")) {
    req.user = {
      ...req.user,
      roles,
    };
    return next();
  } else {
    throw new ErrorHandler(401, "require admin role");
  }
};
