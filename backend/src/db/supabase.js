const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  console.error('[Supabase] FATAL: Required env vars not set:');
  if (!url) console.error('  - SUPABASE_URL is missing');
  if (!key) console.error('  - SUPABASE_SECRET_KEY is missing');
  console.error('[Supabase] Add these in your Render/Railway dashboard → Environment tab');
  process.exit(1);
}

const supabase = createClient(url, key);

module.exports = supabase;
