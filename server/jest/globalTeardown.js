const { stopDb } = require("./test-db");
module.exports = async () => {
  await stopDb();
};
