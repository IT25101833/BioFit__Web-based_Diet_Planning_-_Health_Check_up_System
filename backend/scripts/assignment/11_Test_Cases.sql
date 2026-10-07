/*
================================================================================
BioFit — Script 11: Test cases (integrity, procedure, trigger)
================================================================================
Requires execution. Capture success AND failure outputs for the report.
================================================================================
*/

USE biofit;
GO

SET NOCOUNT ON;

DECLARE @c1 BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.client1@biofit.demo');
DECLARE @coach BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.coach@biofit.demo');
DECLARE @newId VARCHAR(40);

PRINT '===== T01 Valid procedure call (expect SUCCESS) =====';
BEGIN TRY
    EXEC dbo.sp_CreateAppointment
        @ClientUserId = @c1,
        @ProfessionalUserId = @coach,
        @ServiceType = N'Fitness Consultation',
        @AppointmentDate = '2026-12-15',
        @AppointmentTime = N'03:00 PM',
        @Notes = N'Assignment test booking',
        @NewAppointmentId = @newId OUTPUT;
    PRINT 'Created appointment id = ' + COALESCE(@newId, N'(null)');
END TRY
BEGIN CATCH
    PRINT 'T01 UNEXPECTED FAILURE: ' + ERROR_MESSAGE();
END CATCH
GO

PRINT '===== T02 Duplicate slot (expect FAILURE 50007) =====';
DECLARE @c1 BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.client1@biofit.demo');
DECLARE @coach BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.coach@biofit.demo');
DECLARE @newId VARCHAR(40);
BEGIN TRY
    EXEC dbo.sp_CreateAppointment
        @ClientUserId = @c1,
        @ProfessionalUserId = @coach,
        @ServiceType = N'Fitness Consultation',
        @AppointmentDate = '2026-12-15',
        @AppointmentTime = N'03:00 PM',
        @NewAppointmentId = @newId OUTPUT;
    PRINT 'T02 UNEXPECTED SUCCESS';
END TRY
BEGIN CATCH
    PRINT 'T02 EXPECTED FAILURE: ' + ERROR_MESSAGE();
END CATCH
GO

PRINT '===== T03 Invalid client (expect FAILURE 50005) =====';
DECLARE @coach BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.coach@biofit.demo');
DECLARE @newId VARCHAR(40);
BEGIN TRY
    EXEC dbo.sp_CreateAppointment
        @ClientUserId = -1,
        @ProfessionalUserId = @coach,
        @ServiceType = N'Fitness Consultation',
        @AppointmentDate = '2026-12-20',
        @AppointmentTime = N'10:00 AM',
        @NewAppointmentId = @newId OUTPUT;
    PRINT 'T03 UNEXPECTED SUCCESS';
END TRY
BEGIN CATCH
    PRINT 'T03 EXPECTED FAILURE: ' + ERROR_MESSAGE();
END CATCH
GO

PRINT '===== T04 CHECK: negative payment (expect FAILURE) =====';
BEGIN TRY
    INSERT INTO dbo.payments (id, user_id, amount, currency, status, method_label, description, created_at)
    VALUES (
        N'asgn-pay-bad',
        (SELECT id FROM dbo.users WHERE email = N'asgn.client1@biofit.demo'),
        -10.00, N'LKR', N'Paid', N'Card', N'Should fail', SYSUTCDATETIME()
    );
    PRINT 'T04 UNEXPECTED SUCCESS';
END TRY
BEGIN CATCH
    PRINT 'T04 EXPECTED FAILURE: ' + ERROR_MESSAGE();
END CATCH
GO

PRINT '===== T05 CHECK: invalid appointment status (expect FAILURE) =====';
BEGIN TRY
    INSERT INTO dbo.appointments (
        id, client_user_id, client_name, service_type, appointment_date, appointment_time, status, audience, created_at, updated_at
    )
    VALUES (
        N'asgn-apt-bad',
        (SELECT id FROM dbo.users WHERE email = N'asgn.client1@biofit.demo'),
        N'Asha Perera', N'Test', '2026-12-01', N'09:00 AM', N'WeirdStatus', N'CLIENT', SYSUTCDATETIME(), SYSUTCDATETIME()
    );
    PRINT 'T05 UNEXPECTED SUCCESS';
END TRY
BEGIN CATCH
    PRINT 'T05 EXPECTED FAILURE: ' + ERROR_MESSAGE();
END CATCH
GO

PRINT '===== T06 FK: invalid user_id on payment (expect FAILURE) =====';
BEGIN TRY
    INSERT INTO dbo.payments (id, user_id, amount, currency, status, method_label, created_at)
    VALUES (N'asgn-pay-orphan', 999999999, 100.00, N'LKR', N'Paid', N'Card', SYSUTCDATETIME());
    PRINT 'T06 UNEXPECTED SUCCESS';
END TRY
BEGIN CATCH
    PRINT 'T06 EXPECTED FAILURE: ' + ERROR_MESSAGE();
END CATCH
GO

PRINT '===== T07 Trigger: single INSERT audit =====';
DECLARE @c1 BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.client1@biofit.demo');
DECLARE @before INT = (SELECT COUNT(*) FROM dbo.audit_logs WHERE action = N'HEALTH_METRIC_INSERT');
INSERT INTO dbo.health_metrics (user_id, metric_type, value_num, unit, recorded_at, source, created_at)
VALUES (@c1, N'WEIGHT', 68.10, N'kg', SYSUTCDATETIME(), N'TRIGGER_TEST', SYSUTCDATETIME());
DECLARE @after INT = (SELECT COUNT(*) FROM dbo.audit_logs WHERE action = N'HEALTH_METRIC_INSERT');
PRINT CONCAT('T07 audit INSERT rows delta = ', @after - @before, N' (expect >= 1)');
SELECT TOP 3 id, user_id, action, entity_type, entity_id, details, created_at
FROM dbo.audit_logs
WHERE action LIKE N'HEALTH_METRIC%'
ORDER BY id DESC;
GO

PRINT '===== T08 Trigger: multi-row INSERT (set-based) =====';
DECLARE @c2 BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.client2@biofit.demo');
DECLARE @before INT = (SELECT COUNT(*) FROM dbo.audit_logs WHERE action = N'HEALTH_METRIC_INSERT');
INSERT INTO dbo.health_metrics (user_id, metric_type, value_num, unit, recorded_at, source, created_at)
VALUES
(@c2, N'WEIGHT', 81.50, N'kg', DATEADD(MINUTE, -2, SYSUTCDATETIME()), N'TRIGGER_TEST', SYSUTCDATETIME()),
(@c2, N'WEIGHT', 81.40, N'kg', DATEADD(MINUTE, -1, SYSUTCDATETIME()), N'TRIGGER_TEST', SYSUTCDATETIME()),
(@c2, N'HYDRATION', 2.0, N'L', SYSUTCDATETIME(), N'TRIGGER_TEST', SYSUTCDATETIME());
DECLARE @after INT = (SELECT COUNT(*) FROM dbo.audit_logs WHERE action = N'HEALTH_METRIC_INSERT');
PRINT CONCAT('T08 multi-row audit delta = ', @after - @before, N' (expect 3)');
GO

PRINT '===== T09 Function BMI =====';
SELECT dbo.fn_CalculateBMI(170, 68) AS expect_about_23_53;
GO

PRINT '===== T10 Views smoke =====';
SELECT TOP 5 * FROM dbo.vw_AppointmentDetails;
SELECT TOP 5 * FROM dbo.vw_UserHealthSummary;
SELECT TOP 5 * FROM dbo.vw_PaymentSummary;
SELECT TOP 5 * FROM dbo.vw_ActiveSubscriptions;
GO

PRINT '===== T11 Orphan FK verification (should return 0 rows) =====';
SELECT N'payments' AS src, p.id
FROM dbo.payments p
LEFT JOIN dbo.users u ON u.id = p.user_id
WHERE u.id IS NULL
UNION ALL
SELECT N'appointments_client', a.id
FROM dbo.appointments a
LEFT JOIN dbo.users u ON u.id = a.client_user_id
WHERE a.client_user_id IS NOT NULL AND u.id IS NULL;
GO

PRINT 'Script 11 complete.';
GO
