const fs = require("fs");
const path = require("path");

jest.setTimeout(30000);

const p = path.join(__dirname, ".it-env.json");
if (fs.existsSync(p)) {
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  for (const [k, v] of Object.entries(data)) {
    process.env[k] = v;               // GHI ĐÈ để chắc chắn
  }
}

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
