-- Database Migration: AI Video Tutor Module
-- Setup tables for video lessons, scripts, slides, diagrams, animations, quizzes, and tracking

-- 1. Video Lessons
CREATE TABLE IF NOT EXISTS video_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    mode VARCHAR(50) NOT NULL, -- 'beginner', 'exam_prep', 'lab', 'interview'
    avatar VARCHAR(50) NOT NULL, -- 'professor', 'scientist', 'expert', 'instructor', 'mentor'
    voice VARCHAR(50) NOT NULL,
    language VARCHAR(50) NOT NULL,
    duration_seconds INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('generating', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Lesson Scripts
CREATE TABLE IF NOT EXISTS lesson_scripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES video_lessons(id) ON DELETE CASCADE,
    section_name VARCHAR(100) NOT NULL, -- 'intro', 'concept', 'visualization', 'diagram', 'application', 'summary'
    narration_text TEXT NOT NULL,
    avatar_animation VARCHAR(100) NOT NULL, -- 'gesturing', 'pointing', 'explaining', 'nodding'
    sequence_order INT NOT NULL
);

-- 3. Lesson Slides
CREATE TABLE IF NOT EXISTS lesson_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES video_lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    bullet_points TEXT[] NOT NULL,
    duration_seconds INT NOT NULL,
    sequence_order INT NOT NULL
);

-- 4. Lesson Diagrams
CREATE TABLE IF NOT EXISTS lesson_diagrams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES video_lessons(id) ON DELETE CASCADE,
    diagram_type VARCHAR(50) NOT NULL, -- 'logic_circuit', 'topology', 'schema', 'flowchart'
    mermaid_code TEXT NOT NULL,
    sequence_order INT NOT NULL
);

-- 5. Lesson Animations
CREATE TABLE IF NOT EXISTS lesson_animations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES video_lessons(id) ON DELETE CASCADE,
    animation_type VARCHAR(50) NOT NULL, -- 'signal_flow', 'packet_transmission', 'sorting', 'traversal', 'simulation'
    config_json JSONB NOT NULL,
    sequence_order INT NOT NULL
);

-- 6. Lesson Quizzes
CREATE TABLE IF NOT EXISTS lesson_quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES video_lessons(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options TEXT[] NOT NULL,
    correct_option INT NOT NULL,
    explanation TEXT NOT NULL
);

-- 7. Learning Profiles
CREATE TABLE IF NOT EXISTS learning_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weak_topics TEXT[] NOT NULL DEFAULT '{}',
    strong_topics TEXT[] NOT NULL DEFAULT '{}',
    learning_speed VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (learning_speed IN ('slow', 'normal', 'fast')),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Student Progress
CREATE TABLE IF NOT EXISTS student_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES video_lessons(id) ON DELETE CASCADE,
    completion_rate DOUBLE PRECISION NOT NULL DEFAULT 0.0 CHECK (completion_rate >= 0.0 AND completion_rate <= 100.0),
    quiz_score INT, -- score in percentage (0-100)
    watch_time_seconds INT NOT NULL DEFAULT 0,
    last_watched TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_lesson UNIQUE (student_id, lesson_id)
);

-- 9. Video Watch History
CREATE TABLE IF NOT EXISTS video_watch_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES video_lessons(id) ON DELETE CASCADE,
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Saved Lessons
CREATE TABLE IF NOT EXISTS saved_lessons (
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES video_lessons(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, lesson_id)
);

-- 11. AI Interactions
CREATE TABLE IF NOT EXISTS ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES video_lessons(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    interaction_type VARCHAR(50) NOT NULL, -- 'interrupt_doubt', 'general_query'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
