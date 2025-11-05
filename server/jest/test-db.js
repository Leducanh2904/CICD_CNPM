// server/__tests__/integration/setup/test-db.js
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { PostgreSqlContainer } = require("@testcontainers/postgresql");

let container;

async function startDbAndSeed() {
  container = await new PostgreSqlContainer("postgres:16")
    .withDatabase("testdb")
    .withUsername("testuser")
    .withPassword("testpass")
    .start();

  const connectionString = container.getConnectionUri(); // pg uri chuẩn

  const client = new Client({ connectionString });
  await client.connect();
  const sql = fs.readFileSync(path.join(__dirname, "init.sql"), "utf8");
  await client.query(sql);
  await client.end();

  return { connectionString, container };
}

async function stopDb() {
  if (container) await container.stop();
}

module.exports = { startDbAndSeed, stopDb };
