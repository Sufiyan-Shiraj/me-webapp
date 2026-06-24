const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function test() {
  // Login to local server to get token
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'amr', password: 'amr2000' })
  });

  const { token, user } = await loginRes.json();
  console.log('Login success:', !!token);

  const customFetch = (url, options) => {
    options = options || {};
    options.headers = options.headers || {};
    options.headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, options);
  };

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      fetch: customFetch
    }
  });

  const { data, error } = await supabase
    .from('me_item_types')
    .select(`
      id,
      name,
      quantity,
      unit,
      item_id,
      is_archived,
      me_items (
        id,
        name,
        is_archived
      )
    `);
  console.log('Error:', error);
  console.log('Data length:', data ? data.length : null);
}

test();
