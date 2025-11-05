require("dotenv").config({ path: __dirname + "/.env" });
const http = require("http");
const app = require("./app");
const { logger } = require("./utils/logger");
const multer = require('multer'); 

const upload = multer({ dest: 'uploads/' });

app.use(upload.any());

const server = http.createServer(app);

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => logger.info(`Magic happening on port: ${PORT}`));