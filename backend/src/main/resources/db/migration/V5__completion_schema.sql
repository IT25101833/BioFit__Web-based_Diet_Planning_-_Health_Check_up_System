-- Extend health tables + support/coach completion tables

ALTER TABLE health_assessments ADD COLUMN client_code VARCHAR(40);
ALTER TABLE health_assessments ADD COLUMN advisor_name VARCHAR(120);
ALTER TABLE health_assessments ADD COLUMN follow_up_required BOOLEAN DEFAULT FALSE;
ALTER TABLE health_assessments ADD COLUMN related_alert_id VARCHAR(40);
ALTER TABLE health_assessments ADD COLUMN observations_json CLOB;
ALTER TABLE health_assessments ADD COLUMN professional_notes CLOB;

ALTER TABLE health_risk_alerts ADD COLUMN client_code VARCHAR(40);
ALTER TABLE health_risk_alerts ADD COLUMN client_name VARCHAR(120);
ALTER TABLE health_risk_alerts ADD COLUMN priority VARCHAR(40) DEFAULT 'Medium';
ALTER TABLE health_risk_alerts ADD COLUMN reason VARCHAR(2000);
ALTER TABLE health_risk_alerts ADD COLUMN assigned_advisor VARCHAR(120);
ALTER TABLE health_risk_alerts ADD COLUMN related_assessment_id VARCHAR(40);
ALTER TABLE health_risk_alerts ADD COLUMN details_json CLOB;

ALTER TABLE health_profiles ADD COLUMN client_code VARCHAR(40);
ALTER TABLE health_profiles ADD COLUMN programme_label VARCHAR(200);
ALTER TABLE health_profiles ADD COLUMN assigned_coach VARCHAR(120);
ALTER TABLE health_profiles ADD COLUMN assigned_nutrition VARCHAR(120);
ALTER TABLE health_profiles ADD COLUMN next_checkup_at TIMESTAMP;
ALTER TABLE health_profiles ADD COLUMN record_json CLOB;

ALTER TABLE support_tickets ADD COLUMN activity_json CLOB;
ALTER TABLE support_tickets ADD COLUMN waiting_on VARCHAR(120);
ALTER TABLE support_tickets ADD COLUMN escalation_json CLOB;
ALTER TABLE support_tickets ADD COLUMN resolution_json CLOB;

CREATE TABLE fitness_assessments (
    id VARCHAR(40) PRIMARY KEY,
    client_user_id BIGINT,
    client_id VARCHAR(40),
    client_name VARCHAR(120),
    coach_user_id BIGINT,
    coach_name VARCHAR(120),
    assessment_date DATE,
    type VARCHAR(80),
    status VARCHAR(40) DEFAULT 'Completed',
    next_assessment DATE,
    payload_json CLOB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE client_inquiries (
    id VARCHAR(40) PRIMARY KEY,
    client_user_id BIGINT,
    client_id VARCHAR(40),
    client_name VARCHAR(120),
    email VARCHAR(200),
    phone VARCHAR(40),
    subject VARCHAR(300) NOT NULL,
    category VARCHAR(80),
    message CLOB,
    status VARCHAR(40) NOT NULL DEFAULT 'Open',
    assigned_to VARCHAR(120),
    responses_json CLOB,
    received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE client_feedback (
    id VARCHAR(40) PRIMARY KEY,
    client_user_id BIGINT,
    client_id VARCHAR(40),
    client_name VARCHAR(120),
    type VARCHAR(40),
    subject VARCHAR(300),
    message CLOB,
    status VARCHAR(40) NOT NULL DEFAULT 'Open',
    assigned_to VARCHAR(120),
    related_service VARCHAR(200),
    notes_json CLOB,
    complaint_lifecycle_json CLOB,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fitness_assessments_client ON fitness_assessments (client_user_id);
CREATE INDEX idx_inquiries_status ON client_inquiries (status);
CREATE INDEX idx_feedback_status ON client_feedback (status);
