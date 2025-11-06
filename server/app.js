const express = require("express");
const path = require("path");
const routes = require("./routes");
const unknownEndpoint = require("./middleware/unKnownEndpoint");

const app = express();
app.use(express.json());

// health check phải trước unknownEndpoint
app.get("/api/health", (req, res) => res.status(200).send("ok"));
app.head("/api/health", (req, res) => res.sendStatus(200));

// phục vụ ảnh tĩnh sau khi upload
app.use("/images", express.static(path.join(__dirname, "public/images")));

// mount tất cả router con dưới /api
app.use("/api", routes);

app.use(unknownEndpoint);
module.exports = app;
