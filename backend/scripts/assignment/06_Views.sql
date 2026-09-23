/*
================================================================================
BioFit — Script 06: Reporting views
================================================================================
*/

USE biofit;
GO

CREATE OR ALTER VIEW dbo.vw_AppointmentDetails
AS
SELECT
    a.id AS appointment_id,
    a.booking_reference,
    a.service_type,
    a.appointment_date,
    a.appointment_time,
    a.duration,
    a.status,
    a.location,
    a.attendance,
    a.client_user_id,
    COALESCE(cu.email, a.client_id) AS client_email,
    COALESCE(cu.first_name + N' ' + cu.last_name, a.client_name) AS client_display_name,
    a.professional_user_id,
    COALESCE(pu.first_name + N' ' + pu.last_name, a.professional) AS professional_display_name,
    a.professional_role,
    a.programme
FROM dbo.appointments AS a
LEFT JOIN dbo.users AS cu ON cu.id = a.client_user_id
LEFT JOIN dbo.users AS pu ON pu.id = a.professional_user_id;
GO

CREATE OR ALTER VIEW dbo.vw_UserHealthSummary
AS
SELECT
    u.id AS user_id,
    u.email,
    u.first_name,
    u.last_name,
    hp.height_cm,
    hp.weight_kg,
    CASE
        WHEN hp.height_cm IS NULL OR hp.weight_kg IS NULL OR hp.height_cm = 0 THEN NULL
        ELSE CAST(hp.weight_kg / POWER(hp.height_cm / 100.0, 2) AS DECIMAL(6,2))
    END AS bmi,
    hp.blood_type,
    hp.activity_level,
    hp.medical_record_status,
    (
        SELECT COUNT(*)
        FROM dbo.health_metrics hm
        WHERE hm.user_id = u.id
    ) AS metric_count,
    (
        SELECT MAX(hm.recorded_at)
        FROM dbo.health_metrics hm
        WHERE hm.user_id = u.id AND hm.metric_type = N'WEIGHT'
    ) AS latest_weight_at
FROM dbo.users AS u
INNER JOIN dbo.health_profiles AS hp ON hp.user_id = u.id
WHERE u.deleted_at IS NULL
  AND (hp.is_active = 1 OR hp.is_active IS NULL);
GO

CREATE OR ALTER VIEW dbo.vw_PaymentSummary
AS
SELECT
    u.id AS user_id,
    u.email,
    u.first_name + N' ' + u.last_name AS client_name,
    COUNT(*) AS payment_count,
    SUM(CASE WHEN p.status = N'Paid' THEN p.amount ELSE 0 END) AS total_paid,
    SUM(CASE WHEN p.status = N'Pending' THEN p.amount ELSE 0 END) AS total_pending,
    SUM(CASE WHEN p.status = N'Failed' THEN p.amount ELSE 0 END) AS total_failed,
    MAX(p.paid_at) AS last_paid_at
FROM dbo.payments AS p
INNER JOIN dbo.users AS u ON u.id = p.user_id
GROUP BY u.id, u.email, u.first_name, u.last_name;
GO

CREATE OR ALTER VIEW dbo.vw_ActiveSubscriptions
AS
SELECT
    s.id AS subscription_id,
    s.user_id,
    u.email,
    u.first_name + N' ' + u.last_name AS client_name,
    s.plan_name,
    s.status,
    s.price_label,
    s.amount,
    s.renews_on,
    s.created_at
FROM dbo.subscriptions AS s
INNER JOIN dbo.users AS u ON u.id = s.user_id
WHERE s.status = N'Active';
GO

PRINT 'Script 06 views created (BMI computed inline; fn_CalculateBMI is in script 07).';
GO
