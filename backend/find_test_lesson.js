const supabase = require('./src/services/supabaseService');
require('dotenv').config();

async function getTestLesson() {
    const { data: lesson } = await supabase
        .from('lessons')
        .select('id, title, grant_amount')
        .eq('track_label', '1.1')
        .single();

    console.log('Test Lesson:', lesson);
}

getTestLesson();
