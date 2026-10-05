IF COL_LENGTH('medical_requests', 'preferred_date') IS NULL
    ALTER TABLE medical_requests ADD preferred_date DATE NULL;
IF COL_LENGTH('medical_requests', 'preferred_time') IS NULL
    ALTER TABLE medical_requests ADD preferred_time NVARCHAR(20) NULL;
