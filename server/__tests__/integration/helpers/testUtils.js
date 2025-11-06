// server/__tests__/integration/helpers/testUtils.js
const path = require("path");
const fs = require("fs");

function loadApp() {
  const candidates = [
    path.join(__dirname, "../../../app.js"),
    path.join(__dirname, "../../../app"),
    path.join(__dirname, "../../../index.js"),
    path.join(__dirname, "../../../index"),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p) || fs.existsSync(`${p}.js`)) {
      const mod = require(p);
      if (typeof mod === "function" && typeof mod.use === "function") return mod;            // module.exports = app
      if (mod && typeof mod.app === "function" && typeof mod.app.use === "function") return mod.app; // exports.app = app
      if (mod && mod.default && typeof mod.default.use === "function") return mod.default;  // export default app
    }
  }
  throw new Error("Không load được Express app. Hãy export app từ server/app.js (module.exports = app).");
}

const API_PREFIX = "/api";

function randomUser(seed = Date.now()) {
  const num = Math.floor(Math.random() * 1e6);
  return {
    email: `test_${seed}_${num}@example.com`,
    username: `u_${seed}_${num}`,
    password: "Passw0rd!",
    fullname: "Test User",
  };
}

const request = require("supertest");

async function signupAndMaybeLogin(agent, user) {
  const signupRes = await agent.post(`${API_PREFIX}/auth/signup`).send(user);
  if (signupRes.status < 400 && signupRes.body && signupRes.body.token) {
    return { token: signupRes.body.token, userId: signupRes.body.user?.id, res: signupRes };
  }
  const loginRes = await agent
    .post(`${API_PREFIX}/auth/login`)
    .send({ email: user.email, password: user.password });
  return { token: loginRes.body?.token, userId: loginRes.body?.user?.id, res: loginRes };
}

module.exports = {
  loadApp,  // chỉ load sau khi mock/ENV sẵn sàng
  API_PREFIX,
  randomUser,
  signupAndMaybeLogin,
  request,
};
