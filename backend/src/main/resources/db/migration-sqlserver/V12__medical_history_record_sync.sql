-- Link medical history rows that were generated from a health record so later saves update them.

IF COL_LENGTH('medical_history_entries', 'source_health_record_id') IS NULL
    ALTER TABLE medical_history_entries ADD source_health_record_id BIGINT NULL;
IF COL_LENGTH('medical_history_entries', 'source_field') IS NULL
    ALTER TABLE medical_history_entries ADD source_field NVARCHAR(40) NULL;
IF COL_LENGTH('medical_history_entries', 'source_index') IS NULL
    ALTER TABLE medical_history_entries ADD source_index INT NULL;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'idx_mhe_source' AND object_id = OBJECT_ID('medical_history_entries')
)
    CREATE INDEX idx_mhe_source ON medical_history_entries(source_health_record_id, source_field);
