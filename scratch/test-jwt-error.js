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

// Simulate an invalid token (e.g. from the old secret)
const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjcGR2cWp0cW13YmNnc2R0cXFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1OTg0MTEsImV4cCI6Mjk5NzE3NDQxMX0.invalid-signature";

const customFetch = async (url, options) => {
  options = options || {};
  options.headers = options.headers || {};
  options.headers['Authorization'] = `Bearer ${invalidToken}`;
  const res = await fetch(url, options);
  console.log('Fetch Status:', res.status);
  const text = await res.clone().text();
  console.log('Fetch Body:', text);
  return res;
};

const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: customFetch
  }
});

async function test() {
  const { data, error } = await supabase
    .from('me_item_types')
    .select(`
      id,
      name
    `);
  console.log('Error:', error);
}

test();
