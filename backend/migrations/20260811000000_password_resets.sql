-- Add password_resets table to handle magic link resets
CREATE TABLE password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE NOT NULL
);

-- Index to quickly lookup tokens for a user, or when counting for rate limiting
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
