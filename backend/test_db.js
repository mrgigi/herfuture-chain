const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
  const { data: courses } = await supabase.from('courses').select('id').limit(1);
  if (!courses || !courses.length) return console.log('No courses');
  
  const { data: lessons } = await supabase.from('lessons').select('*').limit(1);
  console.log("Lesson Example:", JSON.stringify(lessons[0], null, 2));

  const { data: quizzes } = await supabase.from('quizzes').select('*').limit(1);
  console.log("Quiz Example:", JSON.stringify(quizzes[0], null, 2));
}

check();
