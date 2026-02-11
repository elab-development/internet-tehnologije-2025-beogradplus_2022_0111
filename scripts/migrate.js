const fs = require('fs');
const path = require('path');

require('dotenv').config();

const { Client } = require('pg');

const migrationsDir = path.resolve(__dirname, '..', 'migrations');
const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!dbUrl) {
  console.error('Missing DATABASE_URL or SUPABASE_DB_URL in environment.');
  console.error('Set it in .env or export it before running npm run migrate.');
  process.exit(1);
}

if (!fs.existsSync(migrationsDir)) {
  console.error(`Migrations folder not found: ${migrationsDir}`);
  process.exit(1);
}

const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort();

if (files.length === 0) {
  console.log('No migration files found.');
  process.exit(0);
}

const disableSsl = process.env.DISABLE_SSL === '1';
const isLocal =
  dbUrl.includes('localhost') ||
  dbUrl.includes('127.0.0.1') ||
  dbUrl.includes('::1');
const useSsl = !disableSsl && !isLocal;

const client = new Client({
  connectionString: dbUrl,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

async function run() {
  await client.connect();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    if (!sql.trim()) {
      console.log(`Skipping empty migration: ${file}`);
      continue;
    }

    console.log(`Running migration: ${file}`);
    await client.query(sql);
  }

  await client.end();
  console.log('All migrations completed.');
}

run().catch((err) => {
  console.error('Migration failed.');
  console.error(err?.message || err);
  process.exit(1);
});
