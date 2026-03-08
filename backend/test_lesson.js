const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
  const lessonId = '3e450056-8e4c-4168-86e8-cb9d03f91dc1';
  console.log(`Checking lesson ID: ${lessonId}`);
  
  const { data, error } = await supabase.from('lessons').select('*').eq('id', lessonId).single();
  
  if (error) {
     console.error("Error fetching:", error.message);
  } else {
     console.log("Found lesson:", data ? data.title : "null");
  }
}

check();
