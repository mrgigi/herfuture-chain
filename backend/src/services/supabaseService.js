const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials are missing from .env");
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

module.exports = supabase;
