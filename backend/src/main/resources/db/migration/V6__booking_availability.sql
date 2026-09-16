-- Autonomous booking: professional user link + staff availability windows

ALTER TABLE appointments ADD COLUMN professional_user_id BIGINT;

CREATE TABLE staff_availability (
    id VARCHAR(40) PRIMARY KEY,
    professional_id VARCHAR(40) NOT NULL,
    professional_user_id BIGINT,
    kind VARCHAR(20) NOT NULL,
    day_of_week INT,
    specific_date DATE,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    reason VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_avail_pro ON staff_availability (professional_id);
CREATE INDEX idx_staff_avail_user ON staff_availability (professional_user_id);
CREATE INDEX idx_appointments_pro_user ON appointments (professional_user_id);
