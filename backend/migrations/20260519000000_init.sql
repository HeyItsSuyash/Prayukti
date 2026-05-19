-- Create Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    otp VARCHAR(10),
    otp_expiry TIMESTAMP WITH TIME ZONE,
    is_verified BOOLEAN DEFAULT FALSE,
    enrollment_no VARCHAR(50),
    branch VARCHAR(100),
    year INT,
    semester INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    slug VARCHAR(100) UNIQUE,
    subject_id VARCHAR(50) UNIQUE,
    experiments_count INT DEFAULT 0,
    branch VARCHAR(100) DEFAULT 'Common',
    semester INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subjects_slug ON subjects(slug);
CREATE INDEX IF NOT EXISTS idx_subjects_subject_id ON subjects(subject_id);

-- 3. User Assigned Subjects table (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_assigned_subjects (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, subject_id)
);

-- 4. Experiments table
CREATE TABLE IF NOT EXISTS experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) DEFAULT 'experimental' CHECK (type IN ('learning', 'experimental')),
    difficulty VARCHAR(20) DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Maintenance', 'Draft')),
    description TEXT,
    estimated_time VARCHAR(50),
    prerequisites TEXT[] DEFAULT '{}',
    thumbnail_url VARCHAR(255),
    theory TEXT,
    algorithm TEXT,
    code_template TEXT,
    language VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_experiments_slug ON experiments(slug);
CREATE INDEX IF NOT EXISTS idx_experiments_subject_id ON experiments(subject_id);

-- 5. Experiment Testcases table
CREATE TABLE IF NOT EXISTS experiment_testcases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
    input TEXT,
    output TEXT
);

CREATE INDEX IF NOT EXISTS idx_testcases_experiment_id ON experiment_testcases(experiment_id);

-- 6. Exams table
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id VARCHAR(50) NOT NULL,
    experiment_id VARCHAR(50) NOT NULL,
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    duration_minutes INT NOT NULL CHECK (duration_minutes >= 1),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exams_teacher_id ON exams(teacher_id);

-- 7. Exam Assigned Students table (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS exam_assigned_students (
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (exam_id, student_id)
);

-- 8. Exam Sessions table
CREATE TABLE IF NOT EXISTS exam_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'time_up')),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INT DEFAULT 0,
    warnings INT DEFAULT 0,
    tab_switches INT DEFAULT 0,
    activity_log TEXT[] DEFAULT '{}',
    completed BOOLEAN DEFAULT FALSE,
    submission_data JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT unique_exam_student UNIQUE (exam_id, student_id)
);

-- 9. Attendance Logs table
CREATE TABLE IF NOT EXISTS attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_email VARCHAR(255),
    subject_id VARCHAR(255) DEFAULT 'BCS-000',
    subject_name VARCHAR(255) DEFAULT 'None',
    lab_id VARCHAR(255),
    login_time TIMESTAMP WITH TIME ZONE NOT NULL,
    logout_time TIMESTAMP WITH TIME ZONE,
    session_duration DOUBLE PRECISION DEFAULT 0.0,
    activity_score INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('present', 'inactive', 'absent', 'in_progress')),
    ip_address VARCHAR(45),
    date VARCHAR(10) NOT NULL, -- YYYY-MM-DD
    is_suspicious BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance_logs(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_login_time ON attendance_logs(login_time);

-- 10. Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Experiment Activities table
CREATE TABLE IF NOT EXISTS experiment_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
    experiment_name VARCHAR(255),
    run_count INT DEFAULT 1,
    time_spent INT DEFAULT 0,
    result_generated BOOLEAN DEFAULT FALSE,
    last_run_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_experiment UNIQUE (student_id, experiment_id)
);

CREATE INDEX IF NOT EXISTS idx_exp_act_student ON experiment_activities(student_id);

-- 12. Resources table
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('video', 'notes', 'pdf')),
    title VARCHAR(255) NOT NULL,
    url TEXT,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resources_experiment_id ON resources(experiment_id);

-- 13. Settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Suspicious Activities table
CREATE TABLE IF NOT EXISTS suspicious_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(50) CHECK (reason IN ('NO_EXPERIMENT_RUN', 'SHORT_SESSION', 'CONCURRENT_LOGIN')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45)
);

CREATE INDEX IF NOT EXISTS idx_suspicious_student_time ON suspicious_activities(student_id, timestamp);

-- 15. Teacher Alerts table
CREATE TABLE IF NOT EXISTS teacher_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) CHECK (alert_type IN ('MISSED_EXPERIMENTS', 'LOW_ATTENDANCE', 'SHORT_SESSION', 'SUSPICIOUS_ACTIVITY')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_alerts_student_resolved ON teacher_alerts(student_id, resolved);
