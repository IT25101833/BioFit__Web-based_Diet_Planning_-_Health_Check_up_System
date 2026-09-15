ALTER TABLE health_assessments ADD client_code VARCHAR(40);
ALTER TABLE health_assessments ADD advisor_name VARCHAR(120);
ALTER TABLE health_assessments ADD follow_up_required BIT DEFAULT 0;
ALTER TABLE health_assessments ADD related_alert_id VARCHAR(40);
ALTER TABLE health_assessments ADD observations_json VARCHAR(MAX);
ALTER TABLE health_assessments ADD professional_notes VARCHAR(MAX);

ALTER TABLE health_risk_alerts ADD client_code VARCHAR(40);
ALTER TABLE health_risk_alerts ADD client_name VARCHAR(120);
ALTER TABLE health_risk_alerts ADD priority VARCHAR(40) DEFAULT 'Medium';
ALTER TABLE health_risk_alerts ADD reason VARCHAR(2000);
ALTER TABLE health_risk_alerts ADD assigned_advisor VARCHAR(120);
ALTER TABLE health_risk_alerts ADD related_assessment_id VARCHAR(40);
ALTER TABLE health_risk_alerts ADD details_json VARCHAR(MAX);

ALTER TABLE health_profiles ADD client_code VARCHAR(40);
ALTER TABLE health_profiles ADD programme_label VARCHAR(200);
ALTER TABLE health_profiles ADD assigned_coach VARCHAR(120);
ALTER TABLE health_profiles ADD assigned_nutrition VARCHAR(120);
ALTER TABLE health_profiles ADD next_checkup_at DATETIME2;
ALTER TABLE health_profiles ADD record_json VARCHAR(MAX);

ALTER TABLE support_tickets ADD activity_json VARCHAR(MAX);
ALTER TABLE support_tickets ADD waiting_on VARCHAR(120);
ALTER TABLE support_tickets ADD escalation_json VARCHAR(MAX);
ALTER TABLE support_tickets ADD resolution_json VARCHAR(MAX);

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
    payload_json VARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    message VARCHAR(MAX),
    status VARCHAR(40) NOT NULL DEFAULT 'Open',
    assigned_to VARCHAR(120),
    responses_json VARCHAR(MAX),
    received_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE client_feedback (
    id VARCHAR(40) PRIMARY KEY,
    client_user_id BIGINT,
    client_id VARCHAR(40),
    client_name VARCHAR(120),
    type VARCHAR(40),
    subject VARCHAR(300),
    message VARCHAR(MAX),
    status VARCHAR(40) NOT NULL DEFAULT 'Open',
    assigned_to VARCHAR(120),
    related_service VARCHAR(200),
    notes_json VARCHAR(MAX),
    complaint_lifecycle_json VARCHAR(MAX),
    submitted_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fitness_assessments_client ON fitness_assessments (client_user_id);
CREATE INDEX idx_inquiries_status ON client_inquiries (status);
CREATE INDEX idx_feedback_status ON client_feedback (status);
