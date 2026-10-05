CREATE TABLE medical_review_requests (
    id VARCHAR(40) PRIMARY KEY,
    client_user_id BIGINT NOT NULL,
    advisor_user_id BIGINT NOT NULL,
    advisor_name VARCHAR(200),
    review_date DATE NOT NULL,
    source_type VARCHAR(40) NOT NULL,
    source_record_id VARCHAR(80) NOT NULL,
    status VARCHAR(40) NOT NULL,
    appointment_id VARCHAR(40),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_mrr_client_status ON medical_review_requests (client_user_id, status);
CREATE INDEX idx_mrr_source ON medical_review_requests (source_type, source_record_id);
CREATE INDEX idx_mrr_advisor ON medical_review_requests (advisor_user_id);
