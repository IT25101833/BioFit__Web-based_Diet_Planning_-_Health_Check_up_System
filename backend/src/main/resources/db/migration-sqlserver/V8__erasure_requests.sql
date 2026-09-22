-- Right-to-erasure workflow (admin hard delete after soft delete) — SQL Server

CREATE TABLE erasure_requests (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    record_type NVARCHAR(40) NOT NULL,
    record_id BIGINT NOT NULL,
    client_user_id BIGINT NOT NULL,
    legal_basis NVARCHAR(500) NOT NULL,
    reason NVARCHAR(2000) NOT NULL,
    status NVARCHAR(20) NOT NULL CONSTRAINT DF_erasure_status DEFAULT 'PENDING',
    requested_by_user_id BIGINT NOT NULL,
    requested_at DATETIME2 NOT NULL CONSTRAINT DF_erasure_requested DEFAULT SYSUTCDATETIME(),
    reviewed_by_user_id BIGINT NULL,
    reviewed_at DATETIME2 NULL,
    review_notes NVARCHAR(2000) NULL,
    executed_by_user_id BIGINT NULL,
    executed_at DATETIME2 NULL,
    CONSTRAINT fk_erasure_client FOREIGN KEY (client_user_id) REFERENCES users(id),
    CONSTRAINT fk_erasure_requested_by FOREIGN KEY (requested_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_erasure_reviewed_by FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_erasure_executed_by FOREIGN KEY (executed_by_user_id) REFERENCES users(id)
);

CREATE INDEX idx_erasure_status ON erasure_requests(status);
CREATE INDEX idx_erasure_record ON erasure_requests(record_type, record_id);
CREATE INDEX idx_erasure_client ON erasure_requests(client_user_id);
