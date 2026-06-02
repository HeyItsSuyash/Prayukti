-- Phase 1 Migration: Foundation for Multi-Tenancy & Domains
-- Non-destructive changes to support the new Institutional OS architecture

-- 1. Create Institution Table
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255) UNIQUE,
    logo_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_institutions_slug ON institutions(slug);

-- 2. Create Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_dept_inst UNIQUE (institution_id, slug)
);

-- 3. Create Semesters Table
CREATE TABLE IF NOT EXISTS semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. "Fall 2026", "Semester 1"
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Labs Table
CREATE TABLE IF NOT EXISTS labs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_lab_inst UNIQUE (institution_id, slug)
);

-- 5. Create Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL, -- e.g. "CSE201"
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_course_inst UNIQUE (institution_id, code)
);

-- 6. Add Foreign Keys to Existing Tables (Nullable for Backwards Compatibility)

-- Users: Add institution link
ALTER TABLE users ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_users_institution_id ON users(institution_id);

-- Subjects: Map to Courses & Institutions
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_subjects_institution_id ON subjects(institution_id);

-- Experiments: Map to Labs, Courses, Institutions
ALTER TABLE experiments ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL;
ALTER TABLE experiments ADD COLUMN IF NOT EXISTS lab_id UUID REFERENCES labs(id) ON DELETE SET NULL;
ALTER TABLE experiments ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_experiments_institution_id ON experiments(institution_id);
CREATE INDEX IF NOT EXISTS idx_experiments_lab_id ON experiments(lab_id);

-- Analytics & Attendance: Map to Institutions
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL;
ALTER TABLE experiment_activities ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL;
ALTER TABLE teacher_alerts ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL;

-- 7. Create Default Institution
-- We insert a default institution to bind legacy data, if it doesn't already exist.
INSERT INTO institutions (id, name, slug, domain)
VALUES (uuid_generate_v4(), 'Default Institution', 'default', 'default.prayukti.org')
ON CONFLICT (slug) DO NOTHING;

-- End of Phase 1 Migration
