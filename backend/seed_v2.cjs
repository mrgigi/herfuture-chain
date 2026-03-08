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

    // 2. Define Curriculum Data
    const curriculum = [
        {
            track: {
                title: 'Foundations & Wellbeing',
                description: 'Empowering teen mothers with mindset, leadership, and essential life skills.',
                category: 'Track 1',
                track_number: 1,
                color_code: '#8B5CF6',
                is_published: true,
                image_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e'
            },
            modules: [
                {
                    title: 'Self-Leadership & Confidence',
                    lessons: [
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
                    ]
                }
            ]
        },
        {
            track: {
                title: 'Digital Literacy & Web3',
                description: 'Master the tools of the modern economy and understand the future of internet ownership.',
                category: 'Track 2',
                track_number: 2,
                color_code: '#3B82F6',
                is_published: true,
                image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80'
            },
            modules: [
                {
                    title: 'The Digital World',
                    lessons: [
                        {
                            title: 'Introduction to the internet',
                            desc: 'Understand how the web works and how you can use it to find information and connect.',
                            video: 'https://www.youtube.com/embed/Dxcc6ycZ73M',
                            outcomes: ['Explain what the internet is', 'Use a browser effectively', 'Safety basics'],
                            quiz: {
                                question: 'What is the internet essentially?',
                                options: ['A giant box', 'A global network of computers', 'A television channel'],
                                correct_answer: 'A global network of computers'
                            }
                        },
                        {
                            title: 'Digital safety and security',
                            desc: 'Learn how to protect your identity and your data when using digital tools.',
                            video: 'https://www.youtube.com/embed/HxySrSbSY7o',
                            outcomes: ['Create strong passwords', 'Identify phishing attempts', 'Protect personal data'],
                            quiz: {
                                question: 'Which is a sign of a strong password?',
                                options: ['Using your birthday', 'Using just "password"', 'A mix of symbols, numbers, and letters'],
                                correct_answer: 'A mix of symbols, numbers, and letters'
                            }
                        },
                        {
                            title: 'What is blockchain?',
                            desc: 'A simple introduction to the technology behind HerFuture Chain.',
                            video: 'https://www.youtube.com/embed/SSo_EIwHSd4',
                            outcomes: ['Define blockchain basics', 'Understand transparency', 'Identify real-world uses'],
                            quiz: {
                                question: 'What is a core benefit of blockchain?',
                                options: ['It is slow', 'It is transparent and secure', 'It is owned by one person'],
                                correct_answer: 'It is transparent and secure'
                            }
                        }
                    ]
                }
            ]
        },
        {
            track: {
                title: 'Career & entrepreneurship',
                description: 'Build your path to financial independence through business and employment.',
                category: 'Track 3',
                track_number: 3,
                color_code: '#10B981',
                is_published: true,
                image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'
            },
            modules: [
                {
                    title: 'Business Essentials',
                    lessons: [
                        {
                            title: 'Identifying your business idea',
                            desc: 'How to turn a problem you see in your community into a business opportunity.',
                            video: 'https://www.youtube.com/embed/p9I2vN-5D0k',
                            outcomes: ['Spot market gaps', 'Validate a simple idea', 'Customer research'],
                            quiz: {
                                question: 'Where do the best business ideas usually come from?',
                                options: ['Solving a problem for someone', 'Guessing', 'Waiting for luck'],
                                correct_answer: 'Solving a problem for someone'
                            }
                        },
                        {
                            title: 'Marketing on a budget',
                            desc: 'Use social media and word-of-mouth to grow your brand without spending much.',
                            video: 'https://www.youtube.com/embed/u4zoM9YmYcI',
                            outcomes: ['Define your brand', 'Use Instagram/WhatsApp', 'Content creation tips'],
                            quiz: {
                                question: 'Which tool is great for marketing your business for free?',
                                options: ['Television ads', 'Social media', 'Billboards'],
                                correct_answer: 'Social media'
                            }
                        },
                        {
                            title: 'The HerFuture graduation path',
                            desc: 'How to use your grants to start or grow your business.',
                            video: 'https://www.youtube.com/embed/Ssh71hePR8Q',
                            outcomes: ['Financial planning', 'Using grant funds wisely', 'Growth targets'],
                            quiz: {
                                question: 'What is the best way to use your final grant?',
                                options: ['Spend it on toys', 'Invest it in your business growth', 'Hide it in a drawer'],
                                correct_answer: 'Invest it in your business growth'
                            }
                        }
                    ]
                }
            ]
        }
    ];

    // 3. Insert Curriculum
    for (const item of curriculum) {
        console.log(`\n📦 Seeding ${item.track.title}...`);

        const { data: track, error: tErr } = await supabase.from('courses').insert([item.track]).select();
        if (tErr) { console.error(`❌ Track ${item.track.title} error:`, tErr.message); continue; }
        const courseId = track[0].id;

        for (const modData of item.modules) {
            console.log(`  🔹 Module: ${modData.title}`);
            const { data: module, error: mErr } = await supabase.from('modules').insert([{
                course_id: courseId,
                title: modData.title,
                sequence_number: item.modules.indexOf(modData) + 1
            }]).select();
            if (mErr) { console.error(`  ❌ Module error:`, mErr.message); continue; }
            const moduleId = module[0].id;

            for (let i = 0; i < modData.lessons.length; i++) {
                const l = modData.lessons[i];
                const lessonPayload = {
                    course_id: courseId,
                    module_id: moduleId,
                    title: l.title,
                    content: l.desc,
                    video_url: l.video,
                    sequence_number: i + 1,
                    track_label: `${item.track.track_number}.${i + 1}`,
                    grant_amount: (item.track.track_number === 3 && i === modData.lessons.length - 1) ? 150 : 30,
                    is_wellbeing: item.track.track_number === 1,
                    learning_outcomes: l.outcomes
                };

                let { data: lesson, error: lErr } = await supabase.from('lessons').insert([lessonPayload]).select();

                if (lErr && lErr.code === 'PGRST204') {
                    delete lessonPayload.learning_outcomes;
                    const retry = await supabase.from('lessons').insert([lessonPayload]).select();
                    lesson = retry.data;
                    lErr = retry.error;
                }

                if (lErr) {
                    console.error(`    ❌ Lesson ${i} error:`, lErr.message);
                    continue;
                }

                const lessonId = lesson[0].id;

                const quizPayload = {
                    lesson_id: lessonId,
                    question: l.quiz.question,
                    options: l.quiz.options,
                    correct_answer: l.quiz.correct_answer,
                    data: l.quiz
                };

                const { error: qErr } = await supabase.from('quizzes').insert([quizPayload]);
                if (qErr) {
                    await supabase.from('quizzes').insert([{
                        lesson_id: lessonId,
                        data: l.quiz
                    }]);
                }
            }
        }
    }

    console.log("✅ High-Quality Seed Complete!");
}

seed();
