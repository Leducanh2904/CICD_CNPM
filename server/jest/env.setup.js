// server/__tests__/integration/setup/env.setup.js
process.env.NODE_ENV = 'test';

process.env.PGHOST = process.env.PGHOST || 'localhost';
process.env.PGPORT = process.env.PGPORT || '5432';
process.env.PGUSER = process.env.PGUSER || 'postgres';
process.env.PGPASSWORD = process.env.PGPASSWORD || 'newpassword';
process.env.PGDATABASE = process.env.PGDATABASE || 'pernstore';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
process.env.SECRET = process.env.SECRET || 'supersecretjwtkey';

// In case something still builds URL from pieces:
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}` +
    `@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
}
