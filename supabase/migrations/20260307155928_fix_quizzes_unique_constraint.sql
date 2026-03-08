-- Ensure quizzes table has a unique constraint on lesson_id for upsert to work
ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_lesson_id_key;
ALTER TABLE quizzes ADD CONSTRAINT quizzes_lesson_id_key UNIQUE (lesson_id);
