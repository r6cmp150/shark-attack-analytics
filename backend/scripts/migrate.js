require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'kbjqxaukyawcmcyjoiey';

const client = new Client({
  connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL');

  const files = process.argv.slice(2);
  for (const file of files) {
    const sql = fs.readFileSync(path.resolve(file), 'utf8');
    console.log(`\nRunning: ${file}`);
    await client.query(sql);
    console.log(`Done: ${file}`);
  }

  await client.end();
  console.log('\nAll done.');
}

run().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
