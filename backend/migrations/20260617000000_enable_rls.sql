-- Enable Row Level Security (RLS) on key tables

-- 1. users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_self_access ON users
    FOR ALL
    USING (id = current_setting('app.current_user_id')::uuid)
    WITH CHECK (id = current_setting('app.current_user_id')::uuid);

CREATE POLICY users_tenant_admin_access ON users
    FOR ALL
    USING (
        institution_id = current_setting('app.current_tenant_id', true)::uuid 
        AND current_setting('app.current_user_role', true) = 'admin'
    );

CREATE POLICY users_tenant_teacher_access ON users
    FOR SELECT
    USING (
        institution_id = current_setting('app.current_tenant_id', true)::uuid 
        AND current_setting('app.current_user_role', true) = 'teacher'
        AND role = 'student'
    );

-- 2. attendance_logs
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY attendance_self_access ON attendance_logs
    FOR ALL
    USING (student_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (student_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY attendance_tenant_teacher_admin ON attendance_logs
    FOR SELECT
    USING (
        institution_id = current_setting('app.current_tenant_id', true)::uuid 
        AND current_setting('app.current_user_role', true) IN ('teacher', 'admin')
    );

-- 3. subjects and experiments (Publicly readable within tenant, writable by admin/teachers)
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY subjects_tenant_read ON subjects
    FOR SELECT
    USING (
        institution_id IS NULL OR 
        institution_id = current_setting('app.current_tenant_id', true)::uuid
    );

CREATE POLICY subjects_tenant_write ON subjects
    FOR ALL
    USING (
        institution_id = current_setting('app.current_tenant_id', true)::uuid 
        AND current_setting('app.current_user_role', true) IN ('teacher', 'admin')
    );

ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY experiments_tenant_read ON experiments
    FOR SELECT
    USING (
        institution_id IS NULL OR 
        institution_id = current_setting('app.current_tenant_id', true)::uuid
    );

CREATE POLICY experiments_tenant_write ON experiments
    FOR ALL
    USING (
        institution_id = current_setting('app.current_tenant_id', true)::uuid 
        AND current_setting('app.current_user_role', true) IN ('teacher', 'admin')
    );
