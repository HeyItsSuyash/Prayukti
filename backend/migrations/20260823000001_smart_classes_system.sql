CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL,
    class_name VARCHAR NOT NULL,
    subject VARCHAR NOT NULL,
    section VARCHAR NOT NULL,
    semester INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS class_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL,
    student_id UUID NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS class_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL,
    email VARCHAR NOT NULL,
    invited_by UUID NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS class_join_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL,
    student_id UUID NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS smart_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    topic VARCHAR NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    description TEXT,
    status VARCHAR NOT NULL DEFAULT 'scheduled',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    attached_resource_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS smart_class_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    smart_class_id UUID NOT NULL,
    student_id UUID NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    active_seconds INTEGER NOT NULL DEFAULT 0,
    status VARCHAR NOT NULL DEFAULT 'active',
    attendance_status VARCHAR NOT NULL DEFAULT 'absent'
);

CREATE TABLE IF NOT EXISTS smart_class_quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    smart_class_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    title VARCHAR NOT NULL,
    questions JSONB NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL,
    student_id UUID NOT NULL,
    answers JSONB NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
