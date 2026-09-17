-- Medical Advisor CRUD (SQL Server)

CREATE TABLE medical_history_entries (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    client_code NVARCHAR(40) NULL,
    client_name NVARCHAR(120) NULL,
    record_type NVARCHAR(40) NOT NULL,
    condition_name NVARCHAR(200) NULL,
    allergy_info NVARCHAR(500) NULL,
    description NVARCHAR(2000) NULL,
    severity NVARCHAR(40) NULL,
    recorded_date DATE NULL,
    status NVARCHAR(20) NOT NULL CONSTRAINT DF_mhe_status DEFAULT 'Active',
    created_by_user_id BIGINT NULL,
    created_by_name NVARCHAR(120) NULL,
    deactivated_at DATETIME2 NULL,
    deactivated_by_user_id BIGINT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_mhe_created DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_mhe_updated DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_mhe_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_mhe_user ON medical_history_entries(user_id);
CREATE INDEX idx_mhe_status ON medical_history_entries(status);
CREATE INDEX idx_mhe_client_code ON medical_history_entries(client_code);

CREATE TABLE safety_validations (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    client_code NVARCHAR(40) NULL,
    client_name NVARCHAR(120) NULL,
    reference_type NVARCHAR(40) NULL,
    reference_id NVARCHAR(80) NULL,
    result_status NVARCHAR(40) NOT NULL,
    warnings_json NVARCHAR(MAX) NULL,
    advisor_notes NVARCHAR(2000) NULL,
    validated_by_user_id BIGINT NULL,
    validated_by_name NVARCHAR(120) NULL,
    validated_at DATETIME2 NOT NULL CONSTRAINT DF_sv_validated DEFAULT SYSUTCDATETIME(),
    created_at DATETIME2 NOT NULL CONSTRAINT DF_sv_created DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_sv_updated DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_sv_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_sv_user ON safety_validations(user_id);
CREATE INDEX idx_sv_result ON safety_validations(result_status);

IF COL_LENGTH('health_profiles', 'is_active') IS NULL
    ALTER TABLE health_profiles ADD is_active BIT NOT NULL CONSTRAINT DF_hp_active DEFAULT 1;
IF COL_LENGTH('health_profiles', 'deleted_at') IS NULL
    ALTER TABLE health_profiles ADD deleted_at DATETIME2 NULL;
IF COL_LENGTH('health_profiles', 'deleted_by_user_id') IS NULL
    ALTER TABLE health_profiles ADD deleted_by_user_id BIGINT NULL;

IF COL_LENGTH('health_risk_alerts', 'is_active') IS NULL
    ALTER TABLE health_risk_alerts ADD is_active BIT NOT NULL CONSTRAINT DF_hra_active DEFAULT 1;
IF COL_LENGTH('health_risk_alerts', 'deleted_at') IS NULL
    ALTER TABLE health_risk_alerts ADD deleted_at DATETIME2 NULL;
