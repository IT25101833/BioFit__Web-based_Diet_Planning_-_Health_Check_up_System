-- Autonomous booking: professional user link + staff availability windows

ALTER TABLE appointments ADD professional_user_id BIGINT NULL;

CREATE TABLE staff_availability (
    id VARCHAR(40) PRIMARY KEY,
    professional_id VARCHAR(40) NOT NULL,
    professional_user_id BIGINT NULL,
    kind VARCHAR(20) NOT NULL,
    day_of_week INT NULL,
    specific_date DATE NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    reason VARCHAR(200) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE INDEX idx_staff_avail_pro ON staff_availability (professional_id);
CREATE INDEX idx_staff_avail_user ON staff_availability (professional_user_id);
CREATE INDEX idx_appointments_pro_user ON appointments (professional_user_id);
