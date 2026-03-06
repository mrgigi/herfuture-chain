-- Add curriculum metadata to the LMS tables
ALTER TABLE courses ADD COLUMN IF NOT EXISTS track_number INTEGER;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS color_code TEXT;

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS sequence_number INTEGER;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration_weeks INTEGER;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS grant_amount NUMERIC DEFAULT 0;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_wellbeing BOOLEAN DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS track_label TEXT; -- e.g., '1.1', '2.3'

-- Clear old data to make room for the official curriculum
DELETE FROM quizzes;
DELETE FROM student_progress;
DELETE FROM lessons;
DELETE FROM courses;
