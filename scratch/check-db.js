const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('Checking database counts...');
  
  const { data: sales, error: salesError } = await supabase
    .from('me_sales')
    .select('sale_id');
  
  if (salesError) {
    console.error('Sales Error:', salesError);
  } else {
    const uniqueSales = new Set(sales.map(s => s.sale_id)).size;
    console.log('Total Sales (unique sale_id):', uniqueSales);
  }

  const { count: customerCount, error: customerError } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });

  if (customerError) {
    console.error('Customer Error:', customerError);
  } else {
    console.log('Total Customers:', customerCount);
  }
}

checkData();
