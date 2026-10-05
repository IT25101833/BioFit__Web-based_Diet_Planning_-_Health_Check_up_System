-- OTP email verification columns for client registration.
-- Existing accounts are treated as already verified so login is not disrupted.
ALTER TABLE users ADD COLUMN email_otp_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN email_otp_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN email_otp_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN email_otp_last_sent_at TIMESTAMP;

UPDATE users SET email_verified = TRUE WHERE email_verified = FALSE;
