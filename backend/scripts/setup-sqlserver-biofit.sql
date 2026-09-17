-- Run this in SSMS while connected with Windows Authentication (as admin)
-- Database: master

-- 1) Ensure biofit database exists
IF DB_ID(N'biofit') IS NULL
    CREATE DATABASE biofit;
GO

-- 2) Create SQL login used by the BioFit backend
USE master;
GO
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'biofit_app')
BEGIN
    CREATE LOGIN biofit_app WITH PASSWORD = N'BioFit@2026!', CHECK_POLICY = OFF;
END
ELSE
BEGIN
    ALTER LOGIN biofit_app WITH PASSWORD = N'BioFit@2026!', CHECK_POLICY = OFF;
END
GO

-- 3) Map login into biofit and grant rights
USE biofit;
GO
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'biofit_app')
    CREATE USER biofit_app FOR LOGIN biofit_app;
GO
ALTER ROLE db_owner ADD MEMBER biofit_app;
GO

PRINT 'biofit_app is ready. Next: enable Mixed Mode auth if needed, then start the backend with sqlserver profile.';
GO
