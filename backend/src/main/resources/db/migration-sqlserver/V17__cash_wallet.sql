IF OBJECT_ID('wallets', 'U') IS NULL
BEGIN
    CREATE TABLE wallets (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        client_user_id BIGINT NOT NULL,
        balance DECIMAL(12, 2) NOT NULL CONSTRAINT DF_wallets_balance DEFAULT 0,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_wallets_created DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_wallets_updated DEFAULT SYSUTCDATETIME(),
        CONSTRAINT uq_wallets_client UNIQUE (client_user_id),
        CONSTRAINT fk_wallets_client FOREIGN KEY (client_user_id) REFERENCES users(id)
    );
END

IF OBJECT_ID('wallet_topup_requests', 'U') IS NULL
BEGIN
    CREATE TABLE wallet_topup_requests (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        request_number NVARCHAR(40) NOT NULL,
        client_user_id BIGINT NOT NULL,
        client_code NVARCHAR(40) NULL,
        client_name NVARCHAR(120) NULL,
        wallet_id BIGINT NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        note NVARCHAR(500) NULL,
        status NVARCHAR(20) NOT NULL,
        rejection_reason NVARCHAR(500) NULL,
        receipt_stored_name NVARCHAR(180) NULL,
        receipt_original_name NVARCHAR(180) NULL,
        receipt_content_type NVARCHAR(80) NULL,
        receipt_size BIGINT NULL,
        receipt_uploaded_at DATETIME2 NULL,
        receipt_uploaded_by BIGINT NULL,
        approved_by BIGINT NULL,
        approved_by_name NVARCHAR(120) NULL,
        approved_at DATETIME2 NULL,
        rejected_by BIGINT NULL,
        rejected_by_name NVARCHAR(120) NULL,
        rejected_at DATETIME2 NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_topup_created DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_topup_updated DEFAULT SYSUTCDATETIME(),
        CONSTRAINT uq_topup_request_number UNIQUE (request_number),
        CONSTRAINT fk_topup_client FOREIGN KEY (client_user_id) REFERENCES users(id),
        CONSTRAINT fk_topup_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id)
    );
    CREATE INDEX idx_topup_client ON wallet_topup_requests(client_user_id, created_at);
    CREATE INDEX idx_topup_status ON wallet_topup_requests(status, created_at);
END

IF OBJECT_ID('wallet_transactions', 'U') IS NULL
BEGIN
    CREATE TABLE wallet_transactions (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        wallet_id BIGINT NOT NULL,
        payment_id NVARCHAR(40) NULL,
        top_up_request_id BIGINT NULL,
        type NVARCHAR(20) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        description NVARCHAR(200) NOT NULL,
        payment_method NVARCHAR(20) NOT NULL,
        reference NVARCHAR(40) NOT NULL,
        balance_after DECIMAL(12, 2) NOT NULL,
        status NVARCHAR(20) NOT NULL,
        created_by BIGINT NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_wtx_created DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_wtx_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id),
        CONSTRAINT fk_wtx_topup FOREIGN KEY (top_up_request_id) REFERENCES wallet_topup_requests(id)
    );
    CREATE INDEX idx_wtx_wallet ON wallet_transactions(wallet_id, created_at);
END
