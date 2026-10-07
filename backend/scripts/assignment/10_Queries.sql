/*
================================================================================
BioFit — Script 10: SQL Query Portfolio (QUERY 01–15)
================================================================================
Part D | Each query: purpose header. Capture result grids in SSMS for report.
         DO NOT fabricate outputs — mark “requires execution” until run.
================================================================================
*/

USE biofit;
GO

PRINT '========== QUERY 01 — Simple SELECT ==========';
PRINT 'Purpose: List active wellness programmes.';
SELECT id, name, type, status, capacity, enrolled, start_date, end_date
FROM dbo.wellness_programmes
WHERE status = N'Active'
ORDER BY name;
GO

PRINT '========== QUERY 02 — INNER JOIN ==========';
PRINT 'Purpose: Appointments with client email.';
SELECT
    a.id,
    a.service_type,
    a.appointment_date,
    a.appointment_time,
    a.status,
    u.email AS client_email,
    u.first_name + N' ' + u.last_name AS client_name
FROM dbo.appointments AS a
INNER JOIN dbo.users AS u ON u.id = a.client_user_id
ORDER BY a.appointment_date, a.appointment_time;
GO

PRINT '========== QUERY 03 — Multi-table JOIN ==========';
PRINT 'Purpose: Enrolments with programme + client.';
SELECT
    e.id AS enrolment_id,
    e.status AS enrolment_status,
    e.progress,
    p.name AS programme_name,
    p.type AS programme_type,
    u.email AS client_email
FROM dbo.programme_enrolments AS e
INNER JOIN dbo.wellness_programmes AS p ON p.id = e.programme_id
INNER JOIN dbo.users AS u ON u.id = e.client_user_id
ORDER BY p.name, u.email;
GO

PRINT '========== QUERY 04 — LEFT JOIN ==========';
PRINT 'Purpose: Clients with or without payments.';
SELECT
    u.id,
    u.email,
    u.first_name + N' ' + u.last_name AS client_name,
    COUNT(p.id) AS payment_rows,
    SUM(CASE WHEN p.status = N'Paid' THEN p.amount ELSE 0 END) AS total_paid
FROM dbo.users AS u
INNER JOIN dbo.user_roles AS ur ON ur.user_id = u.id
INNER JOIN dbo.roles AS r ON r.id = ur.role_id AND r.name = N'CLIENT'
LEFT JOIN dbo.payments AS p ON p.user_id = u.id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.email, u.first_name, u.last_name
ORDER BY total_paid DESC;
GO

PRINT '========== QUERY 05 — Aggregation ==========';
PRINT 'Purpose: Total Paid revenue.';
SELECT
    COUNT(*) AS paid_payment_count,
    SUM(amount) AS total_revenue_lkr,
    AVG(amount) AS avg_payment_lkr,
    MIN(amount) AS min_payment,
    MAX(amount) AS max_payment
FROM dbo.payments
WHERE status = N'Paid';
GO

PRINT '========== QUERY 06 — GROUP BY ==========';
PRINT 'Purpose: Paid spend per client.';
SELECT
    u.email,
    COUNT(*) AS paid_count,
    SUM(p.amount) AS total_paid
FROM dbo.payments AS p
INNER JOIN dbo.users AS u ON u.id = p.user_id
WHERE p.status = N'Paid'
GROUP BY u.email
ORDER BY total_paid DESC;
GO

PRINT '========== QUERY 07 — HAVING ==========';
PRINT 'Purpose: Clients whose Paid total exceeds 10000 LKR.';
SELECT
    u.email,
    SUM(p.amount) AS total_paid
FROM dbo.payments AS p
INNER JOIN dbo.users AS u ON u.id = p.user_id
WHERE p.status = N'Paid'
GROUP BY u.email
HAVING SUM(p.amount) > 10000
ORDER BY total_paid DESC;
GO

PRINT '========== QUERY 08 — Scalar subquery ==========';
PRINT 'Purpose: Payments above overall Paid average.';
SELECT
    p.id,
    u.email,
    p.amount,
    p.paid_at
FROM dbo.payments AS p
INNER JOIN dbo.users AS u ON u.id = p.user_id
WHERE p.status = N'Paid'
  AND p.amount > (
        SELECT AVG(amount) FROM dbo.payments WHERE status = N'Paid'
      )
ORDER BY p.amount DESC;
GO

PRINT '========== QUERY 09 — Correlated subquery ==========';
PRINT 'Purpose: Each user''s latest WEIGHT metric.';
SELECT
    u.email,
    hm.metric_type,
    hm.value_num,
    hm.unit,
    hm.recorded_at
FROM dbo.users AS u
INNER JOIN dbo.health_metrics AS hm ON hm.user_id = u.id
WHERE hm.metric_type = N'WEIGHT'
  AND hm.recorded_at = (
        SELECT MAX(hm2.recorded_at)
        FROM dbo.health_metrics AS hm2
        WHERE hm2.user_id = u.id
          AND hm2.metric_type = N'WEIGHT'
      )
ORDER BY u.email;
GO

PRINT '========== QUERY 10 — EXISTS ==========';
PRINT 'Purpose: Clients who have an open support ticket.';
SELECT u.email, u.first_name, u.last_name
FROM dbo.users AS u
WHERE EXISTS (
    SELECT 1
    FROM dbo.support_tickets AS t
    WHERE t.client_user_id = u.id
      AND t.status = N'Open'
)
ORDER BY u.email;
GO

PRINT '========== QUERY 11 — CASE expression ==========';
PRINT 'Purpose: BMI category from health profiles + function.';
SELECT
    u.email,
    hp.height_cm,
    hp.weight_kg,
    dbo.fn_CalculateBMI(hp.height_cm, hp.weight_kg) AS bmi,
    CASE
        WHEN dbo.fn_CalculateBMI(hp.height_cm, hp.weight_kg) IS NULL THEN N'Unknown'
        WHEN dbo.fn_CalculateBMI(hp.height_cm, hp.weight_kg) < 18.5 THEN N'Underweight'
        WHEN dbo.fn_CalculateBMI(hp.height_cm, hp.weight_kg) < 25 THEN N'Normal'
        WHEN dbo.fn_CalculateBMI(hp.height_cm, hp.weight_kg) < 30 THEN N'Overweight'
        ELSE N'Obese'
    END AS bmi_category
FROM dbo.users AS u
INNER JOIN dbo.health_profiles AS hp ON hp.user_id = u.id
WHERE u.deleted_at IS NULL
ORDER BY bmi DESC;
GO

PRINT '========== QUERY 12 — CTE ==========';
PRINT 'Purpose: Rank programmes by enrolment count.';
WITH enrolment_counts AS (
    SELECT
        p.id,
        p.name,
        p.status,
        COUNT(e.id) AS enrolment_count
    FROM dbo.wellness_programmes AS p
    LEFT JOIN dbo.programme_enrolments AS e ON e.programme_id = p.id
    GROUP BY p.id, p.name, p.status
)
SELECT
    name,
    status,
    enrolment_count,
    RANK() OVER (ORDER BY enrolment_count DESC) AS popularity_rank
FROM enrolment_counts
ORDER BY popularity_rank, name;
GO

PRINT '========== QUERY 13 — Window functions ==========';
PRINT 'Purpose: Rank spenders + LAG previous weight.';
-- 13a Rank clients by total Paid
SELECT
    u.email,
    SUM(p.amount) AS total_paid,
    RANK() OVER (ORDER BY SUM(p.amount) DESC) AS spend_rank,
    DENSE_RANK() OVER (ORDER BY SUM(p.amount) DESC) AS spend_dense_rank,
    SUM(SUM(p.amount)) OVER () AS grand_total_paid
FROM dbo.payments AS p
INNER JOIN dbo.users AS u ON u.id = p.user_id
WHERE p.status = N'Paid'
GROUP BY u.email
ORDER BY spend_rank;

-- 13b Weight trend with LAG/LEAD
SELECT
    u.email,
    hm.value_num AS weight_kg,
    hm.recorded_at,
    LAG(hm.value_num) OVER (PARTITION BY hm.user_id ORDER BY hm.recorded_at) AS previous_weight,
    LEAD(hm.value_num) OVER (PARTITION BY hm.user_id ORDER BY hm.recorded_at) AS next_weight,
    hm.value_num - LAG(hm.value_num) OVER (PARTITION BY hm.user_id ORDER BY hm.recorded_at) AS change_kg,
    ROW_NUMBER() OVER (PARTITION BY hm.user_id ORDER BY hm.recorded_at DESC) AS rn_desc
FROM dbo.health_metrics AS hm
INNER JOIN dbo.users AS u ON u.id = hm.user_id
WHERE hm.metric_type = N'WEIGHT'
ORDER BY u.email, hm.recorded_at;
GO

PRINT '========== QUERY 14 — UNION ==========';
PRINT 'Purpose: Combined client touchpoints (appointments ∪ tickets).';
SELECT
    CAST(a.client_user_id AS VARCHAR(20)) AS user_key,
    N'APPOINTMENT' AS touchpoint_type,
    a.service_type AS subject,
    CAST(a.appointment_date AS DATETIME2) AS occurred_at,
    a.status
FROM dbo.appointments AS a
WHERE a.client_user_id IS NOT NULL
UNION ALL
SELECT
    CAST(t.client_user_id AS VARCHAR(20)),
    N'SUPPORT_TICKET',
    t.subject,
    t.created_at,
    t.status
FROM dbo.support_tickets AS t
WHERE t.client_user_id IS NOT NULL
ORDER BY occurred_at DESC;
GO

PRINT '========== QUERY 15 — Reporting query ==========';
PRINT 'Purpose: Manager dashboard — health + payments + active sub.';
SELECT
    hs.email,
    hs.first_name + N' ' + hs.last_name AS client_name,
    hs.bmi,
    hs.metric_count,
    ps.total_paid,
    ps.payment_count,
    s.plan_name AS active_plan,
    s.renews_on
FROM dbo.vw_UserHealthSummary AS hs
LEFT JOIN dbo.vw_PaymentSummary AS ps ON ps.user_id = hs.user_id
LEFT JOIN dbo.vw_ActiveSubscriptions AS s ON s.user_id = hs.user_id
ORDER BY ps.total_paid DESC;
GO

PRINT 'Script 10 complete. Capture each result grid for Part D evidence.';
GO
