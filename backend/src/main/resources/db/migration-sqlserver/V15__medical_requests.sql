IF OBJECT_ID('medical_requests', 'U') IS NULL
BEGIN
    CREATE TABLE medical_requests (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        client_user_id BIGINT NOT NULL,
        client_code NVARCHAR(40) NULL,
        client_name NVARCHAR(120) NULL,
        medical_advisor_id BIGINT NOT NULL,
        advisor_name NVARCHAR(120) NULL,
        reason NVARCHAR(200) NOT NULL,
        description NVARCHAR(2000) NOT NULL,
        status NVARCHAR(20) NOT NULL,
        rejection_reason NVARCHAR(500) NULL,
        requested_at DATETIME2 NOT NULL,
        responded_at DATETIME2 NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_mrq_created DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_mrq_updated DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_mrq_client FOREIGN KEY (client_user_id) REFERENCES users(id),
        CONSTRAINT fk_mrq_advisor FOREIGN KEY (medical_advisor_id) REFERENCES users(id)
    );
    CREATE INDEX idx_mrq_client ON medical_requests(client_user_id, requested_at);
    CREATE INDEX idx_mrq_advisor_status ON medical_requests(medical_advisor_id, status);
END
