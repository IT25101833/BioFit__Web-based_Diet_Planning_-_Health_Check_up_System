IF OBJECT_ID(N'dbo.wellness_centres', N'U') IS NULL
BEGIN
    CREATE TABLE wellness_centres (
        id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        name VARCHAR(160) NOT NULL,
        status VARCHAR(32) NOT NULL CONSTRAINT DF_wellness_centres_status DEFAULT 'ACTIVE',
        created_at DATETIME2 NOT NULL CONSTRAINT DF_wellness_centres_created DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_wellness_centres_updated DEFAULT SYSUTCDATETIME(),
        CONSTRAINT uk_wellness_centres_name UNIQUE (name)
    );
END
GO

IF COL_LENGTH('users', 'wellness_centre_id') IS NULL
    ALTER TABLE users ADD wellness_centre_id BIGINT NULL;
GO

IF COL_LENGTH('users', 'last_login_at') IS NULL
    ALTER TABLE users ADD last_login_at DATETIME2 NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_users_wellness_centre')
    ALTER TABLE users ADD CONSTRAINT fk_users_wellness_centre
        FOREIGN KEY (wellness_centre_id) REFERENCES wellness_centres (id);
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'idx_users_wellness_centre' AND object_id = OBJECT_ID(N'dbo.users'))
    CREATE INDEX idx_users_wellness_centre ON users (wellness_centre_id);
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'idx_users_created_at' AND object_id = OBJECT_ID(N'dbo.users'))
    CREATE INDEX idx_users_created_at ON users (created_at);
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'idx_users_last_login_at' AND object_id = OBJECT_ID(N'dbo.users'))
    CREATE INDEX idx_users_last_login_at ON users (last_login_at);
GO
