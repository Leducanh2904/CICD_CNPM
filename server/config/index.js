require('dotenv').config();
const { Pool } = require('pg');
const dns = require('dns');

const isProd = process.env.NODE_ENV === 'production';

// Ưu tiên DATABASE_URL (Supabase cung cấp), fallback về các biến rời
const database =
  process.env.NODE_ENV === 'test'
    ? process.env.POSTGRES_DB_TEST
    : process.env.POSTGRES_DB;

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}` +
  `@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${database}`;

// Pool với IPv4 + SSL cho Supabase/Render
const pool = new Pool({
  connectionString,
  ssl: isProd ? { rejectUnauthorized: false } : false, // Supabase cần SSL trong prod
  keepAlive: true,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  // ép DNS lookup trả về IPv4
  lookup: (host, _opts, cb) => dns.lookup(host, { family: 4, all: false }, cb),
});

module.exports = pool;
