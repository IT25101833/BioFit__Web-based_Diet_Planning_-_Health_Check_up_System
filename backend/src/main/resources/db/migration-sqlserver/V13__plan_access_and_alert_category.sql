IF COL_LENGTH('health_risk_alerts', 'category') IS NULL
    ALTER TABLE health_risk_alerts ADD category NVARCHAR(40) NULL CONSTRAINT DF_hra_category DEFAULT 'General';
UPDATE health_risk_alerts SET category = 'General' WHERE category IS NULL;

IF OBJECT_ID('plan_access_requests', 'U') IS NULL
BEGIN
    CREATE TABLE plan_access_requests (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        client_user_id BIGINT NOT NULL,
        client_code NVARCHAR(40) NULL,
        client_name NVARCHAR(120) NULL,
        advisor_user_id BIGINT NOT NULL,
        advisor_name NVARCHAR(120) NULL,
        resource_type NVARCHAR(40) NOT NULL,
        status NVARCHAR(20) NOT NULL,
        requested_at DATETIME2 NOT NULL,
        responded_at DATETIME2 NULL,
        responded_by_user_id BIGINT NULL,
        rejection_reason NVARCHAR(500) NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_par_created DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_par_updated DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_par_client FOREIGN KEY (client_user_id) REFERENCES users(id),
        CONSTRAINT fk_par_advisor FOREIGN KEY (advisor_user_id) REFERENCES users(id)
    );
    CREATE INDEX idx_par_lookup ON plan_access_requests(advisor_user_id, client_user_id, resource_type);
    CREATE INDEX idx_par_resource_status ON plan_access_requests(resource_type, status);
END
