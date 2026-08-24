CREATE TABLE IF NOT EXISTS teacher_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    full_name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    department VARCHAR,
    reason TEXT,
    status VARCHAR NOT NULL DEFAULT 'pending',
    reviewed_by UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ
);
