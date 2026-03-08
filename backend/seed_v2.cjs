const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
    console.log("🚀 Seeding High-Quality student-ready curriculum...");

    // 1. Clear existing
    console.log("Cleaning old data...");
    await supabase.from('quizzes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('modules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Insert Track 1
    const { data: track1, error: t1Err } = await supabase.from('courses').insert([{
        title: 'Foundations & Wellbeing',
        description: 'Empowering teen mothers with mindset, leadership, and essential life skills.',
        category: 'Track 1',
        track_number: 1,
        color_code: '#8B5CF6',
        is_published: true,
        image_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e'
    }]).select();

    if (t1Err) { console.error(t1Err); return; }
    const courseId = track1[0].id;

    // 3. Insert Module 1
    const { data: module1, error: m1Err } = await supabase.from('modules').insert([{
        course_id: courseId,
        title: 'Self-Leadership & Confidence',
        sequence_number: 1
    }]).select();

    if (m1Err) { console.error(m1Err); return; }
    const moduleId = module1[0].id;

    // 4. Define Lessons
    const lessons = [
        {
            title: 'Building your identity as a mother',
            desc: 'Understand how your new role as a mother can become a source of strength and motivation.',
            video: 'https://www.youtube.com/embed/P6M8K3Ivh48',
            outcomes: ['Identify personal strengths', 'Define motherhood goals', 'Build positive self-talk'],
            quiz: {
                question: 'What is the primary goal of this lesson regarding your identity?',
                options: ['To focus only on mistakes', 'To see motherhood as a source of strength', 'To wait for others to help'],
                correct_answer: 'To see motherhood as a source of strength'
            }
        },
        {
            title: 'The power of a growth mindset',
            desc: 'Learn how to view challenges as opportunities for growth rather than roadblocks.',
            video: 'https://www.youtube.com/embed/viiW8ZlPxsE',
            outcomes: ['Differentiate fixed vs growth mindset', 'reframe failures as lessons', 'Practice resilience'],
            quiz: {
                question: 'What defines a growth mindset?',
                options: ['Believing abilities can be developed', 'Thinking you are born with all skills', 'Giving up when it gets hard'],
                correct_answer: 'Believing abilities can be developed'
            }
        },
        {
            title: 'Mastering your time and energy',
            desc: 'Practical tools to balance childcare, household duties, and your personal growth journey.',
            video: 'https://www.youtube.com/embed/y2X7c9TUQJ8',
            outcomes: ['Create a daily schedule', 'Prioritize high-impact tasks', 'Manage energy levels'],
            quiz: {
                question: 'How should you approach "high-impact" tasks?',
                options: ['Do them when you are least tired', 'Leave them for the weekend', 'Ignore them'],
                correct_answer: 'Do them when you are least tired'
            }
        },
        {
            title: 'Finding your voice: Advocacy 101',
            desc: 'Know your rights and learn how to communicate your needs effectively to family and community.',
            video: 'https://www.youtube.com/embed/1v0Nf6Y6jYg',
            outcomes: ['Understand basic legal rights', 'Practice assertive communication', 'Identify support resources'],
            quiz: {
                question: 'What is a core part of being an advocate for yourself?',
                options: ['Staying silent', 'Communicating your needs clearly', 'Letting others decide for you'],
                correct_answer: 'Communicating your needs clearly'
            }
        },
        {
            title: 'Designing your daily success routine',
            desc: 'Create a repeatable system for learning and health that fits into your life as a mother.',
            video: 'https://www.youtube.com/embed/mEn976B-LQU',
            outcomes: ['Build a morning routine', 'Set realistic daily targets', 'Track progress'],
            quiz: {
                question: 'Why is a daily routine important for success?',
                options: ['To make life more boring', 'To build consistency and reduce stress', 'To impress others'],
                correct_answer: 'To build consistency and reduce stress'
            }
        }
    ];

    // 5. Insert Lessons & Quizzes
    for (let i = 0; i < lessons.length; i++) {
        const l = lessons[i];
        const lessonPayload = {
            course_id: courseId,
            module_id: moduleId,
            title: l.title,
            content: l.desc,
            video_url: l.video,
            sequence_number: i + 1,
            track_label: `1.${i + 1}`,
            grant_amount: i === lessons.length - 1 ? 150 : 30,
            is_wellbeing: true,
            learning_outcomes: l.outcomes
        };

        let { data: lesson, error: lErr } = await supabase.from('lessons').insert([lessonPayload]).select();

        if (lErr && lErr.code === 'PGRST204') {
            console.warn(`⚠️  Column 'learning_outcomes' missing. Retrying without it...`);
            delete lessonPayload.learning_outcomes;
            const retry = await supabase.from('lessons').insert([lessonPayload]).select();
            lesson = retry.data;
            lErr = retry.error;
        }

        if (lErr) {
            console.error(`❌ Lesson ${i} error:`, lErr.message);
            continue;
        }

        const lessonId = lesson[0].id;

        // Insert Quiz - Try both formats for maximum compatibility
        const quizPayload = {
            lesson_id: lessonId,
            question: l.quiz.question,
            options: l.quiz.options,
            correct_answer: l.quiz.correct_answer,
            data: l.quiz
        };

        const { error: qErr } = await supabase.from('quizzes').insert([quizPayload]);
        if (qErr) {
            console.warn(`⚠️  Quiz basic insert failed, retrying with just 'data' column...`);
            await supabase.from('quizzes').insert([{
                lesson_id: lessonId,
                data: l.quiz
            }]);
        }
    }

    console.log("✅ High-Quality Seed Complete!");
}

seed();
