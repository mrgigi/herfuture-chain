-- Light LMS: Courses Table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT DEFAULT 'General',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Light LMS: Lessons Table (Modules)
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT, -- Markdown or JSON content
    video_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Light LMS: Quizzes Table
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings
    correct_answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Light LMS: Student Progress Table
CREATE TABLE student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'started', -- 'started', 'completed'
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(participant_id, lesson_id)
);

-- Insert a Seed Course for Testing (Fintech 101)
INSERT INTO courses (title, description, category) 
VALUES ('Fintech & Crypto 101', 'Learn the basics of digital finance and how to manage your blockchain wallet.', 'Fundamentals');

-- Insert Seed Lessons
DO $$
DECLARE
    course_id UUID;
BEGIN
    SELECT id INTO course_id FROM courses LIMIT 1;
    
    INSERT INTO lessons (course_id, title, content, video_url, order_index)
    VALUES 
    (course_id, 'What is a Crypto Wallet?', 'A wallet is your digital purse for the blockhain.', 'https://www.youtube.com/embed/YVgfHZMFEA8', 1),
    (course_id, 'Sending your first Transaction', 'Learn how to send cUSD safely.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 2);
END $$;
