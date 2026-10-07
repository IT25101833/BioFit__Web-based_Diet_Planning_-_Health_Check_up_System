/*
================================================================================
BioFit — Script 12: Execution plan analysis helpers
================================================================================
Part D optimization | Requires execution in SSMS

How to capture evidence (do this in SSMS — do not invent plans):
1. Click "Include Actual Execution Plan" (Ctrl+M).
2. Run each batch below.
3. Screenshot the plan graphical view + open operator properties.
4. Note: Index Seek vs Scan, Nested Loops / Hash Match, Key Lookup.

Explain in viva:
- IX_payments_user_paid supports GROUP BY user spend queries.
- IX_health_metrics_user_recorded supports LAG/latest-weight patterns.
- IX_appointments_pro_date supports conflict checks in sp_CreateAppointment.
================================================================================
*/

USE biofit;
GO

PRINT '--- Plan A: Paid spend per user (benefits from IX_payments_user_paid) ---';
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

SELECT
    u.email,
    COUNT(*) AS paid_count,
    SUM(p.amount) AS total_paid
FROM dbo.payments AS p
INNER JOIN dbo.users AS u ON u.id = p.user_id
WHERE p.status = N'Paid'
GROUP BY u.email
ORDER BY total_paid DESC;

SET STATISTICS IO OFF;
SET STATISTICS TIME OFF;
GO

PRINT '--- Plan B: Latest-style weight metrics (IX_health_metrics_user_recorded) ---';
SET STATISTICS IO ON;

SELECT
    hm.user_id,
    hm.value_num,
    hm.recorded_at,
    LAG(hm.value_num) OVER (PARTITION BY hm.user_id ORDER BY hm.recorded_at) AS prev_weight
FROM dbo.health_metrics AS hm
WHERE hm.metric_type = N'WEIGHT';

SET STATISTICS IO OFF;
GO

PRINT '--- Plan C: Professional conflict lookup (IX_appointments_pro_date) ---';
DECLARE @pro BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.coach@biofit.demo');

SET STATISTICS IO ON;

SELECT id, client_user_id, appointment_date, appointment_time, status
FROM dbo.appointments
WHERE professional_user_id = @pro
  AND appointment_date = '2026-09-12'
  AND appointment_time = N'10:00 AM'
  AND status <> N'Cancelled';

SET STATISTICS IO OFF;
GO

PRINT '--- Index catalogue (evidence of created indexes) ---';
SELECT
    i.name AS index_name,
    OBJECT_NAME(i.object_id) AS table_name,
    i.type_desc,
    i.is_unique
FROM sys.indexes AS i
WHERE i.name IN (
    N'IX_payments_user_paid',
    N'IX_subscriptions_user_status',
    N'IX_appointments_pro_date',
    N'IX_health_metrics_user_recorded',
    N'IX_wpe_exercise',
    N'ux_appointments_booking_reference'
)
ORDER BY table_name, index_name;
GO

PRINT 'Script 12 complete. Paste REAL plans/IO stats into the report only after running.';
GO
