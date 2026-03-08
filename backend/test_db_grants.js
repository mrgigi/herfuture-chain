const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: lessons } = await supabase.from('lessons').select('id, title, grant_amount, sequence_number, module_id').eq('module_id', '03ed29cd-2f5f-4450-b528-8070c2a86c97').order('sequence_number');
  console.log("Lessons in Module 1:", lessons);
}

check();
