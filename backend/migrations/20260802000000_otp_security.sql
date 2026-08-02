-- Migration to enhance OTP security
ALTER TABLE users ADD COLUMN otp_hash VARCHAR;
ALTER TABLE users ADD COLUMN otp_attempts INT DEFAULT 0 NOT NULL;
ALTER TABLE users ADD COLUMN otp_resends INT DEFAULT 0 NOT NULL;
ALTER TABLE users ADD COLUMN otp_last_resent_at TIMESTAMP WITH TIME ZONE;

-- Move existing otp to otp_hash to avoid breaking if any, then drop otp
-- Actually we can just drop it because existing plaintext OTPs will be invalidated
ALTER TABLE users DROP COLUMN otp;
