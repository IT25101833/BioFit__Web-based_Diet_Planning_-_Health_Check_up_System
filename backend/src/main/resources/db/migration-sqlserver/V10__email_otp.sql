-- OTP email verification columns for client registration.
-- Existing accounts are treated as already verified so login is not disrupted.
ALTER TABLE users ADD email_otp_hash VARCHAR(255) NULL;
ALTER TABLE users ADD email_otp_expires_at DATETIME2 NULL;
ALTER TABLE users ADD email_otp_attempts INT NOT NULL CONSTRAINT DF_users_email_otp_attempts DEFAULT 0;
ALTER TABLE users ADD email_otp_last_sent_at DATETIME2 NULL;

UPDATE users SET email_verified = 1 WHERE email_verified = 0;
