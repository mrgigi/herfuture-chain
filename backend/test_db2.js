const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const lessonId = '3e450056-8e4c-4168-86e8-cb9d03f91dc1';
  console.log(`Checking lesson ID: ${lessonId}`);
  
  const { data: lesson, error } = await supabase.from('lessons').select('*').eq('id', lessonId).single();
  console.log("Found specific lesson:", lesson ? lesson.title : "null (Error: " + (error?.message || 'none') + ")");

  const { data: allLessons } = await supabase.from('lessons').select('id, title, course_id').limit(5);
  console.log("Sample lessons:", allLessons);
  
  const { data: courses } = await supabase.from('courses').select('id, title').limit(5);
  console.log("Sample courses:", courses);
}

check();
