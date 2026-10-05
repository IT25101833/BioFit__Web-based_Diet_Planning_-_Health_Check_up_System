-- Link medical history rows that were generated from a health record so later saves update them.

ALTER TABLE medical_history_entries ADD COLUMN source_health_record_id BIGINT;
ALTER TABLE medical_history_entries ADD COLUMN source_field VARCHAR(40);
ALTER TABLE medical_history_entries ADD COLUMN source_index INT;

CREATE INDEX idx_mhe_source ON medical_history_entries(source_health_record_id, source_field);
