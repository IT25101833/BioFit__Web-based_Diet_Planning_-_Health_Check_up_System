/*
================================================================================
BioFit — Script 04: Indexes (justified)
Supports assignment queries and sp_CreateAppointment conflict checks.
================================================================================
Part D optimization | Re-runnable
================================================================================
*/

USE biofit;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_payments_user_paid' AND object_id = OBJECT_ID(N'dbo.payments')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_payments_user_paid
        ON dbo.payments (user_id, paid_at)
        INCLUDE (amount, status, currency);
    PRINT 'Created IX_payments_user_paid';
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_subscriptions_user_status' AND object_id = OBJECT_ID(N'dbo.subscriptions')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_subscriptions_user_status
        ON dbo.subscriptions (user_id, status)
        INCLUDE (plan_name, renews_on, amount);
    PRINT 'Created IX_subscriptions_user_status';
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_appointments_pro_date' AND object_id = OBJECT_ID(N'dbo.appointments')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_appointments_pro_date
        ON dbo.appointments (professional_user_id, appointment_date, appointment_time)
        INCLUDE (status, client_user_id, service_type);
    PRINT 'Created IX_appointments_pro_date';
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_health_metrics_user_recorded' AND object_id = OBJECT_ID(N'dbo.health_metrics')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_health_metrics_user_recorded
        ON dbo.health_metrics (user_id, recorded_at)
        INCLUDE (metric_type, value_num, unit);
    PRINT 'Created IX_health_metrics_user_recorded';
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_wpe_exercise' AND object_id = OBJECT_ID(N'dbo.workout_plan_exercises')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_wpe_exercise
        ON dbo.workout_plan_exercises (exercise_id)
        INCLUDE (workout_plan_id, day_label, sequence_no);
    PRINT 'Created IX_wpe_exercise';
END
GO

PRINT 'Script 04 complete.';
PRINT 'Trade-off: faster reads for ranking/trends/booking checks; slightly slower INSERT/UPDATE.';
GO
