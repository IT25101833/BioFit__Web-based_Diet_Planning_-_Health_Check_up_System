/*
================================================================================
BioFit — Script 02b: Hibernate/SQL Server LOB column alignment
Run after 02 if Spring Boot schema-validate fails on JSON/LOB columns.
- Support tickets use @JdbcTypeCode(LONG32NVARCHAR) → NVARCHAR(MAX)
- @Lob fields → VARCHAR(MAX)
================================================================================
*/

USE biofit;
GO

-- Support ticket JSON (LONG32NVARCHAR)
IF COL_LENGTH('dbo.support_tickets', 'messages_json') IS NOT NULL
    ALTER TABLE dbo.support_tickets ALTER COLUMN messages_json NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.support_tickets', 'activity_json') IS NOT NULL
    ALTER TABLE dbo.support_tickets ALTER COLUMN activity_json NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.support_tickets', 'escalation_json') IS NOT NULL
    ALTER TABLE dbo.support_tickets ALTER COLUMN escalation_json NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.support_tickets', 'resolution_json') IS NOT NULL
    ALTER TABLE dbo.support_tickets ALTER COLUMN resolution_json NVARCHAR(MAX) NULL;

-- @Lob mapped columns (VARCHAR(MAX) / CLOB)
IF COL_LENGTH('dbo.meal_plans', 'plan_json') IS NOT NULL
    ALTER TABLE dbo.meal_plans ALTER COLUMN plan_json VARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.workout_plans', 'plan_json') IS NOT NULL
    ALTER TABLE dbo.workout_plans ALTER COLUMN plan_json VARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.exercises', 'instructions') IS NOT NULL
    ALTER TABLE dbo.exercises ALTER COLUMN instructions VARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.fitness_assessments', 'payload_json') IS NOT NULL
    ALTER TABLE dbo.fitness_assessments ALTER COLUMN payload_json VARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.health_assessments', 'observations_json') IS NOT NULL
    ALTER TABLE dbo.health_assessments ALTER COLUMN observations_json VARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.health_assessments', 'professional_notes') IS NOT NULL
    ALTER TABLE dbo.health_assessments ALTER COLUMN professional_notes VARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.health_profiles', 'record_json') IS NOT NULL
    ALTER TABLE dbo.health_profiles ALTER COLUMN record_json VARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.health_risk_alerts', 'details_json') IS NOT NULL
    ALTER TABLE dbo.health_risk_alerts ALTER COLUMN details_json VARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.client_inquiries', 'message') IS NOT NULL
    ALTER TABLE dbo.client_inquiries ALTER COLUMN message VARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.client_inquiries', 'responses_json') IS NOT NULL
    ALTER TABLE dbo.client_inquiries ALTER COLUMN responses_json VARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.client_feedback', 'message') IS NOT NULL
    ALTER TABLE dbo.client_feedback ALTER COLUMN message VARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.client_feedback', 'notes_json') IS NOT NULL
    ALTER TABLE dbo.client_feedback ALTER COLUMN notes_json VARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.client_feedback', 'complaint_lifecycle_json') IS NOT NULL
    ALTER TABLE dbo.client_feedback ALTER COLUMN complaint_lifecycle_json VARCHAR(MAX) NULL;

PRINT 'Script 02b complete — LOB column types aligned for Hibernate validate.';
GO
