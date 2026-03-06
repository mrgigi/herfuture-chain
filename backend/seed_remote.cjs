const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the backend .env
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log("🚀 Starting Remote Seed with Official Curriculum...");

    // 1. Clear existing LMS data
    await supabase.from('quizzes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Insert Official Tracks (Courses)
    const courses = [
        {
            title: 'Self-Leadership & Confidence',
            description: 'Who I am, what I want, and how I move toward it. Goals for young mothers.',
            category: 'Foundations',
            image_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1000'
        },
        {
            title: 'Digital Literacy & AI Tools',
            description: 'Foundation of everything digital—from smartphones to using ChatGPT for work.',
            category: 'Income Skills',
            image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000'
        },
        {
            title: 'Financial Literacy & Money',
            description: 'How money actually works—and how to make it work for you and your child.',
            category: 'Money & Business',
            image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1000'
        }
    ];

    const { data: createdCourses, error: courseError } = await supabase
        .from('courses')
        .insert(courses)
        .select();

    if (courseError) {
        console.error("Error creating courses:", courseError);
        return;
    }

    console.log(`✅ Created ${createdCourses.length} Achievement Tracks.`);

    // 3. Insert Lessons & Quizzes
    for (const course of createdCourses) {
        const { data: lessons, error: lessonError } = await supabase.from('lessons').insert([{
            course_id: course.id,
            title: `Intro to ${course.title}`,
            content: `Welcome to the ${course.title} module!`,
            video_url: 'https://www.youtube.com/embed/YVgfHZMFEA8',
            order_index: 1
        }]).select();

        if (lessonError) {
            console.error("Error creating lessons:", lessonError);
            continue;
        }

        await supabase.from('quizzes').insert([{
            lesson_id: lessons[0].id,
            question: `What is the focus of ${course.title}?`,
            options: ['Growth and Success', 'Watching TV', 'Waiting'],
            correct_answer: 'Growth and Success'
        }]);
    }

    console.log("🎊 Curriculum Seeded Successfully!");
}

seed();
