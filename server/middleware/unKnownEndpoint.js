app.get('/api/health', (req, res) => res.status(200).send('ok'));
app.head('/api/health', (req, res) => res.sendStatus(200));
const { ErrorHandler } = require("../helpers/error");

// eslint-disable-next-line no-unused-vars
const unknownEndpoint = (request, response) => {
  throw new ErrorHandler(401, "unknown endpoint");
};

module.exports = unknownEndpoint;
