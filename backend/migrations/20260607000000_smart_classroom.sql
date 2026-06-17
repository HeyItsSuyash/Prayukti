-- Database Migration: Smart Classroom Module
-- Drop existing tables to align with clean type system and fields

DROP TABLE IF EXISTS timetables CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS classroom_attendance CASCADE;
DROP TABLE IF EXISTS announcement_comments CASCADE;
DROP TABLE IF EXISTS announcement_reactions CASCADE;
DROP TABLE IF EXISTS announcement_bookmarks CASCADE;
DROP TABLE IF EXISTS classroom_resources CASCADE;
DROP TABLE IF EXISTS ai_conversations CASCADE;
DROP TABLE IF EXISTS knowledge_base CASCADE;
DROP TABLE IF EXISTS participation_events CASCADE;
DROP TABLE IF EXISTS engagement_scores CASCADE;
DROP TABLE IF EXISTS ai_insights CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;

-- 1. Timetables
CREATE TABLE timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL, -- 'Monday', 'Tuesday', ...
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_link VARCHAR(255) NOT NULL,
    recurring BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Schedules (Live Classes)
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_name VARCHAR(255) NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT NOT NULL,
    room_link VARCHAR(255) NOT NULL,
    batch VARCHAR(100),
    recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern VARCHAR(100), -- 'weekly', 'daily', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Classroom Attendance
CREATE TABLE classroom_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    join_time TIMESTAMP WITH TIME ZONE,
    leave_time TIMESTAMP WITH TIME ZONE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_auto BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_schedule UNIQUE (student_id, schedule_id)
);

-- 4. Announcements
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Announcement Comments
CREATE TABLE announcement_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Announcement Reactions
CREATE TABLE announcement_reactions (
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction VARCHAR(50) NOT NULL,
    PRIMARY KEY (announcement_id, user_id, reaction)
);

-- 7. Announcement Bookmarks
CREATE TABLE announcement_bookmarks (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, announcement_id)
);

-- 8. Classroom Resources
CREATE TABLE classroom_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('pdf', 'notes', 'link', 'video')),
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. AI Conversations
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher')),
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    feedback_score INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Living Knowledge Base
CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    ai_answer TEXT NOT NULL,
    teacher_answer TEXT,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    confidence_score DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('approved', 'pending_review', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Participation Events
CREATE TABLE participation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- e.g., 'class_join', 'resource_view', 'ai_tutor_interact', etc.
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Engagement Scores
CREATE TABLE engagement_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    score_type VARCHAR(20) NOT NULL CHECK (score_type IN ('daily', 'weekly', 'monthly')),
    score INT NOT NULL CHECK (score >= 0 AND score <= 100),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_subject_score UNIQUE (student_id, subject_id, score_type, date)
);

-- 13. AI Insights
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL, -- e.g., 'disengaged', 'high_performer', 'at_risk', 'learning_trend'
    message TEXT NOT NULL,
    confidence DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
