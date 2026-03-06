const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
    console.log("🚀 Seeding Official 16-Module Progressive Curriculum...");

    // 1. Define Tracks (Courses)
    const tracks = [
        { id: 'T1', title: 'Foundations & Wellbeing', description: 'Mindset, health, and leadership for teen mothers.', category: 'Track 1', track_number: 1, color_code: '#8B5CF6', image_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e' },
        { id: 'T2', title: 'Digital Income Skills', description: 'ALX-aligned high-demand digital skills.', category: 'Track 2', track_number: 2, color_code: '#EC4899', image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f' },
        { id: 'T3', title: 'Money & Business', description: 'Financial literacy and entrepreneurship.', category: 'Track 3', track_number: 3, color_code: '#F97316', image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f' }
    ];

    // 2. Define Modules (Lessons)
    const modules = [
        // Track 1: Foundations & Wellbeing (ALX Mindset & Leadership)
        { track: 'T1', label: '1.1', title: 'Self-Leadership & Confidence', seq: 1, weeks: 3, grant: 50, desc: 'Growth mindset and setting goals as a young mother.', video: 'https://www.youtube.com/embed/fD1512_X8N0' }, // ALX Leadership
        { track: 'T1', label: '1.2', title: 'Mental Health & Resilience', seq: 2, weeks: 2, grant: 0, is_wb: true, desc: 'Coping strategies and building a support network.', video: 'https://www.youtube.com/embed/RKpXmN86Xps' }, // TED Resilience
        { track: 'T1', label: '1.3', title: 'Hygiene & Child Wellbeing', seq: 3, weeks: 2, grant: 0, is_wb: true, desc: 'Health basics for mother and child.', video: 'https://www.youtube.com/embed/unh_vTCO_pY' }, // UNICEF Health
        { track: 'T1', label: '1.4', title: 'Job Readiness', seq: 4, weeks: 2, grant: 0, desc: 'CV writing and interview skills.', video: 'https://www.youtube.com/embed/HG68Ymazo18' }, // Google Career Certs

        // Track 2: Digital Income Skills (Space & Tech)
        { track: 'T2', label: '2.1', title: 'Digital Literacy & AI Tools', seq: 5, weeks: 4, grant: 30, desc: 'Using smartphones and ChatGPT for work.', video: 'https://www.youtube.com/embed/mEjv6-2m-T8' }, // AI for Beginners
        { track: 'T2', label: '2.2', title: 'Virtual Assistant Skills', seq: 6, weeks: 4, grant: 50, desc: 'Remote admin and task management.', video: 'https://www.youtube.com/embed/P_KxO05WvYo' }, // VA Guide
        { track: 'T2', label: '2.3', title: 'Exploration: Mars & Beyond', seq: 7, weeks: 4, grant: 50, desc: 'Science and the future of human exploration.', video: 'https://www.youtube.com/embed/unh_vTCO_pY' }, // NASA Mars
        { track: 'T2', label: '2.4', title: 'Graphic Design Basics', seq: 8, weeks: 3, grant: 0, desc: 'Visual branding using free tools like Canva.', video: 'https://www.youtube.com/embed/un50Bs4BvZ8' }, // Canva Tutorial
        { track: 'T2', label: '2.5', title: 'Data Entry & AI Work', seq: 9, weeks: 3, grant: 0, desc: 'Fiverr, Upwork, and AI data labeling.', video: 'https://www.youtube.com/embed/bX_uMoC1xY4' }, // Freelancing 101
        { track: 'T2', label: '2.6', title: 'Freelancing & First Client', seq: 10, weeks: 4, grant: 100, desc: 'Track 2 Graduation & client acquisition.', video: 'https://www.youtube.com/embed/vO6MizV_324' }, // Client Management

        // Track 3: Money & Business (Financial Literacy)
        { track: 'T3', label: '3.1', title: 'Financial Literacy', seq: 11, weeks: 3, grant: 30, desc: 'Understanding money, banking and crypto.', video: 'https://www.youtube.com/embed/4j2emMn7UaI' }, // Personal Finance
        { track: 'T3', label: '3.2', title: 'Saving & Budgeting', seq: 12, weeks: 2, grant: 0, desc: 'Building the habit of saving when money is tight.', video: 'https://www.youtube.com/embed/9XInK0xQW6U' }, // Budgeting Basics
        { track: 'T3', label: '3.3', title: 'Blockchain & The Future', seq: 13, weeks: 2, grant: 0, desc: 'How crypto and blockchain change the world.', video: 'https://www.youtube.com/embed/K8_L8S-i-N8' }, // Blockchain Explained
        { track: 'T3', label: '3.4', title: 'Branding & Pricing', seq: 14, weeks: 3, grant: 50, desc: 'Pricing your services and personal branding.', video: 'https://www.youtube.com/embed/7X8mXOnv9XQ' }, // Value-based Pricing
        { track: 'T3', label: '3.5', title: 'Starting a Small Business', seq: 15, weeks: 4, grant: 0, desc: 'Lean startup methods for teen mothers.', video: 'https://www.youtube.com/embed/ZiaS29C9xS8' }, // Startup Fundamentals
        { track: 'T3', label: '3.6', title: 'Long-Term Thinking', seq: 16, weeks: 2, grant: 200, desc: 'Programme Graduation and financial life planning.', video: 'https://www.youtube.com/embed/pW-6x7nHPuo' } // Success mindset
    ];

    // Cleaning up first
    await supabase.from('quizzes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert Tracks
    const trackMap = {};
    for (const t of tracks) {
        const { data, error } = await supabase.from('courses').insert([{
            title: t.title,
            description: t.description,
            category: t.category,
            track_number: t.track_number,
            color_code: t.color_code,
            image_url: t.image_url
        }]).select();
        if (error) console.error(error);
        trackMap[t.id] = data[0].id;
    }

    // Insert Modules
    for (const m of modules) {
        let outcomes = [];
        if (m.track === 'T1') {
            outcomes = ["Believe in your potential", "Set mother-child health goals", "Build emotional resilience"];
        } else if (m.track === 'T2') {
            outcomes = ["Master AI efficiency", "Navigate freelance platforms", "Design visual marketing assets"];
        } else {
            outcomes = ["Understand wealth creation", "Manage a business budget", "Build long-term assets"];
        }

        const { data: lesson, error } = await supabase.from('lessons').insert([{
            course_id: trackMap[m.track],
            track_label: m.label,
            title: m.title,
            content: m.desc,
            sequence_number: m.seq,
            duration_weeks: m.weeks,
            grant_amount: m.grant,
            is_wellbeing: m.is_wb || false,
            video_url: m.video,
            learning_outcomes: outcomes
        }]).select();

        if (error) {
            console.error(error);
            continue;
        }

        // Insert a dummy quiz for each
        await supabase.from('quizzes').insert([{
            lesson_id: lesson[0].id,
            question: `What is the key takeaway of ${m.title}?`,
            options: ['Growth and Resilience', 'Doing nothing', 'Waiting'],
            correct_answer: 'Growth and Resilience'
        }]);
    }

    console.log("✅ Full 16-Module Curriculum Seeded!");
}

seed();
