/*
================================================================================
BioFit — Script 16: Domain views + advanced SQL demos
================================================================================
Reporting views per management area + CTEs / window functions / CROSS APPLY /
MERGE-style patterns for viva talking points.

Speaker map:
  Appointment  -> vw_AppointmentWorkload
  Nutrition    -> vw_NutritionClientOverview
  Healthcare   -> vw_HealthcareRiskBoard   (+ existing vw_UserHealthSummary)
  Fitness      -> vw_FitnessPlanBoard
  Support      -> vw_SupportQueueBoard
  Programmes   -> vw_ProgrammeFillRate
  Billing      -> existing vw_PaymentSummary / vw_ActiveSubscriptions
  Advanced     -> demo queries at bottom (CTE, RANK, LAG, CROSS APPLY)
================================================================================
*/

USE biofit;
GO

/* -------------------------------------------------------------------------- */
/* APPOINTMENT                                                                */
/* -------------------------------------------------------------------------- */
CREATE OR ALTER VIEW dbo.vw_AppointmentWorkload
AS
SELECT
    a.professional_user_id,
    COALESCE(u.first_name + N' ' + u.last_name, a.professional) AS professional_name,
    a.professional_role,
    COUNT(*) AS total_appointments,
    SUM(CASE WHEN a.status = N'Upcoming' THEN 1 ELSE 0 END) AS upcoming_count,
    SUM(CASE WHEN a.status = N'Completed' THEN 1 ELSE 0 END) AS completed_count,
    SUM(CASE WHEN a.status = N'Cancelled' THEN 1 ELSE 0 END) AS cancelled_count,
    SUM(CASE WHEN a.status = N'No-Show' THEN 1 ELSE 0 END) AS no_show_count
FROM dbo.appointments AS a
LEFT JOIN dbo.users AS u ON u.id = a.professional_user_id
GROUP BY
    a.professional_user_id,
    COALESCE(u.first_name + N' ' + u.last_name, a.professional),
    a.professional_role;
GO

/* -------------------------------------------------------------------------- */
/* NUTRITION                                                                  */
/* -------------------------------------------------------------------------- */
CREATE OR ALTER VIEW dbo.vw_NutritionClientOverview
AS
SELECT
    mp.client_user_id,
    COALESCE(u.first_name + N' ' + u.last_name, mp.client_name) AS client_name,
    COUNT(*) AS meal_plan_count,
    SUM(CASE WHEN mp.status = N'Active' THEN 1 ELSE 0 END) AS active_plans,
    MAX(mp.version_no) AS max_version,
    AVG(CAST(mp.progress AS DECIMAL(6,2))) AS avg_progress,
    (
        SELECT COUNT(*)
        FROM dbo.dietary_restrictions dr
        WHERE dr.client_user_id = mp.client_user_id
          AND dr.status = N'Active'
    ) AS active_restriction_count
FROM dbo.meal_plans AS mp
LEFT JOIN dbo.users AS u ON u.id = mp.client_user_id
GROUP BY
    mp.client_user_id,
    COALESCE(u.first_name + N' ' + u.last_name, mp.client_name);
GO

/* -------------------------------------------------------------------------- */
/* HEALTHCARE                                                                 */
/* -------------------------------------------------------------------------- */
CREATE OR ALTER VIEW dbo.vw_HealthcareRiskBoard
AS
SELECT
    a.id AS alert_id,
    a.user_id,
    COALESCE(u.first_name + N' ' + u.last_name, a.client_name) AS client_name,
    a.title,
    a.priority,
    a.status,
    a.reason,
    a.assigned_advisor,
    a.date_raised,
    hp.height_cm,
    hp.weight_kg,
    dbo.fn_CalculateBMI(hp.height_cm, hp.weight_kg) AS bmi,
    dbo.fn_ClassifyBMICategory(dbo.fn_CalculateBMI(hp.height_cm, hp.weight_kg)) AS bmi_category
FROM dbo.health_risk_alerts AS a
LEFT JOIN dbo.users AS u ON u.id = a.user_id
LEFT JOIN dbo.health_profiles AS hp ON hp.user_id = a.user_id;
GO

/* -------------------------------------------------------------------------- */
/* FITNESS                                                                    */
/* -------------------------------------------------------------------------- */
CREATE OR ALTER VIEW dbo.vw_FitnessPlanBoard
AS
SELECT
    wp.id AS workout_plan_id,
    wp.name AS plan_name,
    wp.client_user_id,
    COALESCE(u.first_name + N' ' + u.last_name, wp.client_name) AS client_name,
    wp.goal,
    wp.difficulty,
    wp.status,
    wp.progress,
    wp.sessions_per_week,
    dbo.fn_WorkoutPlanExerciseCount(wp.id) AS exercise_count,
    (
        SELECT COUNT(*)
        FROM dbo.fitness_assessments fa
        WHERE fa.client_user_id = wp.client_user_id
    ) AS assessment_count
FROM dbo.workout_plans AS wp
LEFT JOIN dbo.users AS u ON u.id = wp.client_user_id;
GO

/* -------------------------------------------------------------------------- */
/* SUPPORT                                                                    */
/* -------------------------------------------------------------------------- */
CREATE OR ALTER VIEW dbo.vw_SupportQueueBoard
AS
SELECT
    st.id AS ticket_id,
    st.client_user_id,
    COALESCE(u.first_name + N' ' + u.last_name, st.client_name) AS client_name,
    st.subject,
    st.category,
    st.priority,
    st.status,
    st.assigned_to,
    st.waiting_on,
    st.created_at,
    st.updated_at,
    DATEDIFF(HOUR, st.created_at, SYSUTCDATETIME()) AS age_hours
FROM dbo.support_tickets AS st
LEFT JOIN dbo.users AS u ON u.id = st.client_user_id
WHERE st.status IN (N'Open', N'In Progress', N'Waiting', N'Escalated');
GO

/* -------------------------------------------------------------------------- */
/* PROGRAMMES                                                                 */
/* -------------------------------------------------------------------------- */
CREATE OR ALTER VIEW dbo.vw_ProgrammeFillRate
AS
SELECT
    wp.id AS programme_id,
    wp.name AS programme_name,
    wp.type,
    wp.status,
    wp.capacity,
    wp.enrolled,
    dbo.fn_ProgrammeRemainingCapacity(wp.id) AS remaining_capacity,
    CASE
        WHEN wp.capacity IS NULL OR wp.capacity = 0 THEN NULL
        ELSE CAST(100.0 * COALESCE(wp.enrolled, 0) / wp.capacity AS DECIMAL(6,2))
    END AS fill_percent,
    wp.start_date,
    wp.end_date,
    wp.coach_name,
    wp.nutrition_name,
    wp.medical_name
FROM dbo.wellness_programmes AS wp;
GO

PRINT 'Script 16 domain views created.';
GO

/* ========================================================================== */
/* ADVANCED SQL DEMOS (run & screenshot — do not invent results)              */
/* ========================================================================== */

PRINT '===== ADV-01 CTE: top spenders with running total (Billing) =====';
;WITH payment_ranked AS (
    SELECT
        u.id AS user_id,
        u.email,
        u.first_name + N' ' + u.last_name AS client_name,
        SUM(CASE WHEN p.status = N'Paid' THEN p.amount ELSE 0 END) AS total_paid
    FROM dbo.users AS u
    INNER JOIN dbo.payments AS p ON p.user_id = u.id
    GROUP BY u.id, u.email, u.first_name, u.last_name
)
SELECT
    client_name,
    total_paid,
    RANK() OVER (ORDER BY total_paid DESC) AS spend_rank,
    SUM(total_paid) OVER (ORDER BY total_paid DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total_paid
FROM payment_ranked
WHERE total_paid > 0
ORDER BY spend_rank;
GO

PRINT '===== ADV-02 LAG: weight trend per client (Healthcare) =====';
SELECT
    hm.user_id,
    u.first_name + N' ' + u.last_name AS client_name,
    hm.recorded_at,
    hm.value_num AS weight_kg,
    LAG(hm.value_num) OVER (
        PARTITION BY hm.user_id ORDER BY hm.recorded_at
    ) AS previous_weight_kg,
    hm.value_num - LAG(hm.value_num) OVER (
        PARTITION BY hm.user_id ORDER BY hm.recorded_at
    ) AS delta_kg
FROM dbo.health_metrics AS hm
INNER JOIN dbo.users AS u ON u.id = hm.user_id
WHERE hm.metric_type = N'WEIGHT'
ORDER BY hm.user_id, hm.recorded_at;
GO

PRINT '===== ADV-03 CROSS APPLY: latest appointment per client =====';
SELECT
    u.id AS user_id,
    u.first_name + N' ' + u.last_name AS client_name,
    la.appointment_id,
    la.service_type,
    la.appointment_date,
    la.status
FROM dbo.users AS u
CROSS APPLY (
    SELECT TOP (1)
        a.id AS appointment_id,
        a.service_type,
        a.appointment_date,
        a.status
    FROM dbo.appointments AS a
    WHERE a.client_user_id = u.id
    ORDER BY a.appointment_date DESC, a.created_at DESC
) AS la
WHERE u.deleted_at IS NULL
ORDER BY la.appointment_date DESC;
GO

PRINT '===== ADV-04 CTE + HAVING: support backlog by priority =====';
;WITH open_tickets AS (
    SELECT priority, status, id
    FROM dbo.support_tickets
    WHERE status IN (N'Open', N'In Progress', N'Waiting', N'Escalated')
)
SELECT
    priority,
    COUNT(*) AS ticket_count
FROM open_tickets
GROUP BY priority
HAVING COUNT(*) >= 1
ORDER BY
    CASE priority
        WHEN N'Urgent' THEN 1
        WHEN N'High' THEN 2
        WHEN N'Medium' THEN 3
        ELSE 4
    END;
GO

PRINT '===== ADV-05 Window: programme fill vs peer average (Manager) =====';
SELECT
    programme_name,
    fill_percent,
    AVG(fill_percent) OVER () AS avg_fill_all_programmes,
    fill_percent - AVG(fill_percent) OVER () AS vs_average
FROM dbo.vw_ProgrammeFillRate
WHERE fill_percent IS NOT NULL
ORDER BY fill_percent DESC;
GO
