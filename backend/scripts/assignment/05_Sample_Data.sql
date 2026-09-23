/*
================================================================================
BioFit — Script 05: Sample data (≥5 meaningful rows per table)
Idempotent where practical (assignment-prefixed IDs / email checks).
Password for assignment users (if used in app): Demo123!
  Hash below is a BCrypt placeholder compatible with column length.
================================================================================
Part C | Requires execution in SSMS
================================================================================
*/

USE biofit;
GO

SET NOCOUNT ON;

DECLARE @pwd NVARCHAR(255) = N'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
DECLARE @now DATETIME2 = SYSUTCDATETIME();

/* ========== ROLES (expect 8 from Flyway V2; ensure minimum) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE name = N'CLIENT')
    INSERT INTO dbo.roles (name, description) VALUES (N'CLIENT', N'Wellness client / member');
-- Other roles assumed from V2; count check at end.

DECLARE @roleClient BIGINT = (SELECT TOP 1 id FROM dbo.roles WHERE name = N'CLIENT');
DECLARE @roleCoach  BIGINT = (SELECT TOP 1 id FROM dbo.roles WHERE name = N'FITNESS_COACH');
DECLARE @roleNutri  BIGINT = (SELECT TOP 1 id FROM dbo.roles WHERE name = N'NUTRITION_CONSULTANT');
DECLARE @roleMed    BIGINT = (SELECT TOP 1 id FROM dbo.roles WHERE name = N'MEDICAL_ADVISOR');
DECLARE @roleSupp   BIGINT = (SELECT TOP 1 id FROM dbo.roles WHERE name = N'CUSTOMER_EXPERIENCE_OFFICER');
DECLARE @roleMgr    BIGINT = (SELECT TOP 1 id FROM dbo.roles WHERE name = N'WELLNESS_CENTRE_MANAGER');

/* ========== USERS (≥5 clients + staff) ========== */
;WITH seed_users AS (
    SELECT * FROM (VALUES
        (N'asgn.client1@biofit.demo', N'Asha',   N'Perera',   N'0771001001', NULL,                    N'CLIENT'),
        (N'asgn.client2@biofit.demo', N'Nimal',  N'Silva',    N'0771001002', NULL,                    N'CLIENT'),
        (N'asgn.client3@biofit.demo', N'Ishara', N'Fernando', N'0771001003', NULL,                    N'CLIENT'),
        (N'asgn.client4@biofit.demo', N'Kavindi',N'Jayasuriya',N'0771001004', NULL,                   N'CLIENT'),
        (N'asgn.client5@biofit.demo', N'Ruwan',  N'Bandara',  N'0771001005', NULL,                    N'CLIENT'),
        (N'asgn.coach@biofit.demo',   N'Daniel', N'Perera',   N'0772002001', N'Strength & conditioning', N'FITNESS_COACH'),
        (N'asgn.nutrition@biofit.demo',N'Maya',  N'Fernando', N'0772002002', N'Clinical nutrition',   N'NUTRITION_CONSULTANT'),
        (N'asgn.medical@biofit.demo', N'Elena',  N'Costa',    N'0772002003', N'Preventive health',    N'MEDICAL_ADVISOR'),
        (N'asgn.support@biofit.demo', N'Priya',  N'Nair',     N'0772002004', N'Customer experience',  N'CUSTOMER_EXPERIENCE_OFFICER'),
        (N'asgn.manager@biofit.demo', N'Sarah',  N'Williams', N'0772002005', N'Centre operations',    N'WELLNESS_CENTRE_MANAGER')
    ) AS v(email, first_name, last_name, contact_number, specialization, role_name)
)
INSERT INTO dbo.users (email, password_hash, first_name, last_name, contact_number, specialization, status, email_verified, failed_login_attempts, created_at, updated_at)
SELECT s.email, @pwd, s.first_name, s.last_name, s.contact_number, s.specialization, N'ACTIVE', 1, 0, @now, @now
FROM seed_users s
WHERE NOT EXISTS (SELECT 1 FROM dbo.users u WHERE u.email = s.email);

/* user_roles */
INSERT INTO dbo.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM dbo.users u
JOIN dbo.roles r ON r.name = CASE
    WHEN u.email LIKE N'asgn.client%@biofit.demo' THEN N'CLIENT'
    WHEN u.email = N'asgn.coach@biofit.demo' THEN N'FITNESS_COACH'
    WHEN u.email = N'asgn.nutrition@biofit.demo' THEN N'NUTRITION_CONSULTANT'
    WHEN u.email = N'asgn.medical@biofit.demo' THEN N'MEDICAL_ADVISOR'
    WHEN u.email = N'asgn.support@biofit.demo' THEN N'CUSTOMER_EXPERIENCE_OFFICER'
    WHEN u.email = N'asgn.manager@biofit.demo' THEN N'WELLNESS_CENTRE_MANAGER'
END
WHERE u.email LIKE N'asgn.%@biofit.demo'
  AND NOT EXISTS (
      SELECT 1 FROM dbo.user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

DECLARE @c1 BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.client1@biofit.demo');
DECLARE @c2 BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.client2@biofit.demo');
DECLARE @c3 BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.client3@biofit.demo');
DECLARE @c4 BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.client4@biofit.demo');
DECLARE @c5 BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.client5@biofit.demo');
DECLARE @coach BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.coach@biofit.demo');
DECLARE @nutri BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.nutrition@biofit.demo');
DECLARE @med   BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.medical@biofit.demo');
DECLARE @supp  BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.support@biofit.demo');
DECLARE @mgr   BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.manager@biofit.demo');

IF @c1 IS NULL OR @coach IS NULL
BEGIN
    RAISERROR('Assignment users missing — aborting sample data.', 16, 1);
    RETURN;
END

/* ========== refresh_tokens (≥5) ========== */
;WITH tok AS (
    SELECT * FROM (VALUES
        (N'asgn-rt-1', @c1), (N'asgn-rt-2', @c2), (N'asgn-rt-3', @c3),
        (N'asgn-rt-4', @coach), (N'asgn-rt-5', @nutri)
    ) AS v(token, uid)
)
INSERT INTO dbo.refresh_tokens (user_id, token, expires_at, revoked, created_at)
SELECT t.uid, t.token, DATEADD(DAY, 14, @now), 0, @now
FROM tok t
WHERE NOT EXISTS (SELECT 1 FROM dbo.refresh_tokens r WHERE r.token = t.token);

/* ========== audit_logs (≥5) ========== */
IF (SELECT COUNT(*) FROM dbo.audit_logs) < 5
BEGIN
    INSERT INTO dbo.audit_logs (user_id, action, entity_type, entity_id, result_status, ip_address, details, created_at)
    VALUES
    (@c1, N'LOGIN', N'USER', CAST(@c1 AS VARCHAR(20)), N'SUCCESS', N'127.0.0.1', N'Assignment seed login', @now),
    (@c2, N'LOGIN', N'USER', CAST(@c2 AS VARCHAR(20)), N'SUCCESS', N'127.0.0.1', N'Assignment seed login', @now),
    (@coach, N'VIEW_PLAN', N'WORKOUT_PLAN', N'asgn-wp-1', N'SUCCESS', N'127.0.0.1', N'Coach viewed plan', @now),
    (@nutri, N'UPDATE_MEAL', N'MEAL_PLAN', N'asgn-mp-1', N'SUCCESS', N'127.0.0.1', N'Nutrition update', @now),
    (@med, N'RAISE_ALERT', N'HEALTH_ALERT', N'asgn-alert', N'SUCCESS', N'127.0.0.1', N'Medical alert raised', @now);
END

/* ========== health_profiles (1:1 — 5 clients) ========== */
;WITH hp AS (
    SELECT * FROM (VALUES
        (@c1, N'BF-A1001', 165.00, 68.50, N'A+', N'Moderate'),
        (@c2, N'BF-A1002', 178.00, 82.00, N'O+', N'Active'),
        (@c3, N'BF-A1003', 160.00, 58.00, N'B+', N'Sedentary'),
        (@c4, N'BF-A1004', 172.00, 74.00, N'AB+', N'Moderate'),
        (@c5, N'BF-A1005', 170.00, 90.00, N'A-', N'Light')
    ) AS v(uid, code, h, w, blood, act)
)
INSERT INTO dbo.health_profiles (user_id, height_cm, weight_kg, blood_type, activity_level, medical_record_status, client_code, created_at, updated_at, is_active)
SELECT hp.uid, hp.h, hp.w, hp.blood, hp.act, N'Up to date', hp.code, @now, @now, 1
FROM hp
WHERE NOT EXISTS (SELECT 1 FROM dbo.health_profiles p WHERE p.user_id = hp.uid);

/* ========== health_metrics (≥5; multiple per user for LAG demos) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.health_metrics WHERE source = N'ASSIGNMENT')
BEGIN
    INSERT INTO dbo.health_metrics (user_id, metric_type, value_num, unit, recorded_at, source, created_at)
    VALUES
    (@c1, N'WEIGHT', 70.00, N'kg', DATEADD(DAY, -60, @now), N'ASSIGNMENT', @now),
    (@c1, N'WEIGHT', 69.20, N'kg', DATEADD(DAY, -30, @now), N'ASSIGNMENT', @now),
    (@c1, N'WEIGHT', 68.50, N'kg', DATEADD(DAY, -2,  @now), N'ASSIGNMENT', @now),
    (@c2, N'WEIGHT', 84.00, N'kg', DATEADD(DAY, -45, @now), N'ASSIGNMENT', @now),
    (@c2, N'WEIGHT', 82.00, N'kg', DATEADD(DAY, -5,  @now), N'ASSIGNMENT', @now),
    (@c3, N'HYDRATION', 2.10, N'L', DATEADD(DAY, -1, @now), N'ASSIGNMENT', @now),
    (@c4, N'WEIGHT', 75.50, N'kg', DATEADD(DAY, -10, @now), N'ASSIGNMENT', @now),
    (@c5, N'WEIGHT', 92.00, N'kg', DATEADD(DAY, -20, @now), N'ASSIGNMENT', @now),
    (@c5, N'WEIGHT', 90.00, N'kg', DATEADD(DAY, -3,  @now), N'ASSIGNMENT', @now);
END

/* ========== health_goals (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.health_goals WHERE title LIKE N'ASGN:%')
BEGIN
    INSERT INTO dbo.health_goals (user_id, title, description, target_value, status, progress_percent, created_at, updated_at)
    VALUES
    (@c1, N'ASGN: Reach 65 kg', N'Steady fat loss', N'65 kg', N'ACTIVE', 40, @now, @now),
    (@c2, N'ASGN: Improve VO2', N'Cardio base', N'42 ml/kg', N'ACTIVE', 55, @now, @now),
    (@c3, N'ASGN: Sleep 7h', N'Sleep hygiene', N'7 hours', N'ACTIVE', 70, @now, @now),
    (@c4, N'ASGN: Strength base', N'2× gym / week', N'8 weeks', N'ACTIVE', 30, @now, @now),
    (@c5, N'ASGN: Reduce waist', N'Waist < 90 cm', N'90 cm', N'ACTIVE', 25, @now, @now);
END

/* ========== health_assessments (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.health_assessments WHERE title LIKE N'ASGN:%')
BEGIN
    INSERT INTO dbo.health_assessments (user_id, title, summary, assessment_type, status, assessed_at, created_by, created_at, client_code, advisor_name, follow_up_required)
    VALUES
    (@c1, N'ASGN: Baseline check', N'Overall stable', N'General', N'COMPLETED', DATEADD(DAY,-40,@now), @med, @now, N'BF-A1001', N'Elena Costa', 0),
    (@c2, N'ASGN: Cardio review', N'Mild hypertension watch', N'Cardiac', N'COMPLETED', DATEADD(DAY,-20,@now), @med, @now, N'BF-A1002', N'Elena Costa', 1),
    (@c3, N'ASGN: Nutrition screen', N'Low iron risk', N'Nutrition', N'COMPLETED', DATEADD(DAY,-15,@now), @med, @now, N'BF-A1003', N'Elena Costa', 1),
    (@c4, N'ASGN: MSK screen', N'Knee tracking OK', N'Musculoskeletal', N'COMPLETED', DATEADD(DAY,-8,@now), @med, @now, N'BF-A1004', N'Elena Costa', 0),
    (@c5, N'ASGN: Metabolic screen', N'Elevated fasting glucose watch', N'Metabolic', N'COMPLETED', DATEADD(DAY,-5,@now), @med, @now, N'BF-A1005', N'Elena Costa', 1);
END

/* ========== health_risk_alerts (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.health_risk_alerts WHERE title LIKE N'ASGN:%')
BEGIN
    INSERT INTO dbo.health_risk_alerts (user_id, title, status, guidance, date_raised, created_at, updated_at, client_code, client_name, priority, assigned_advisor, is_active)
    VALUES
    (@c1, N'ASGN: Hydration reminder', N'Monitoring', N'Increase daytime fluids', DATEADD(DAY,-12,@now), @now, @now, N'BF-A1001', N'Asha Perera', N'Low', N'Elena Costa', 1),
    (@c2, N'ASGN: BP follow-up', N'Monitoring', N'Recheck BP in 2 weeks', DATEADD(DAY,-10,@now), @now, @now, N'BF-A1002', N'Nimal Silva', N'High', N'Elena Costa', 1),
    (@c3, N'ASGN: Iron intake', N'Monitoring', N'Iron-rich meal options', DATEADD(DAY,-9,@now), @now, @now, N'BF-A1003', N'Ishara Fernando', N'Medium', N'Elena Costa', 1),
    (@c5, N'ASGN: Glucose watch', N'Monitoring', N'Reduce sugary drinks', DATEADD(DAY,-4,@now), @now, @now, N'BF-A1005', N'Ruwan Bandara', N'High', N'Elena Costa', 1),
    (@c4, N'ASGN: Resolved knee note', N'Resolved', N'Cleared for strength work', DATEADD(DAY,-30,@now), @now, @now, N'BF-A1004', N'Kavindi Jayasuriya', N'Low', N'Elena Costa', 1);
END

/* ========== wellness_programmes (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.wellness_programmes WHERE id = N'asgn-prog-1')
BEGIN
    INSERT INTO dbo.wellness_programmes (id, name, type, description, status, start_date, end_date, duration_weeks, capacity, enrolled, coach_name, nutrition_name, medical_name, progress, last_updated, created_at)
    VALUES
    (N'asgn-prog-1', N'Weight Management 2026', N'Lifestyle', N'12-week balanced pathway', N'Active', '2026-07-01', '2026-09-30', 12, 24, 5, N'Daniel Perera', N'Maya Fernando', N'Elena Costa', 60, @now, @now),
    (N'asgn-prog-2', N'Energy Reset', N'Recovery', N'Sleep and mobility focus', N'Active', '2026-08-01', '2026-10-01', 8, 16, 3, N'Daniel Perera', N'Maya Fernando', N'Elena Costa', 40, @now, @now),
    (N'asgn-prog-3', N'Strength Foundations', N'Fitness', N'Beginner strength block', N'Active', '2026-06-01', '2026-08-31', 12, 20, 4, N'Daniel Perera', N'Maya Fernando', N'Elena Costa', 75, @now, @now),
    (N'asgn-prog-4', N'Metabolic Balance', N'Clinical Wellness', N'Glucose-aware lifestyle', N'Active', '2026-09-01', '2026-11-30', 12, 12, 2, N'Daniel Perera', N'Maya Fernando', N'Elena Costa', 20, @now, @now),
    (N'asgn-prog-5', N'Wellness Starter', N'Foundations', N'Introductory pathway', N'Completed', '2026-01-10', '2026-04-10', 12, 20, 20, N'Daniel Perera', N'Maya Fernando', N'Elena Costa', 100, @now, @now);
END

/* ========== programme_enrolments (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.programme_enrolments WHERE id = N'asgn-enr-1')
BEGIN
    INSERT INTO dbo.programme_enrolments (id, programme_id, client_user_id, client_id, client_name, enrolled_date, status, coach_name, nutrition_name, progress, period_label, created_at)
    VALUES
    (N'asgn-enr-1', N'asgn-prog-1', @c1, N'BF-A1001', N'Asha Perera', '2026-07-01', N'Active', N'Daniel Perera', N'Maya Fernando', 62, N'Jul–Sep 2026', @now),
    (N'asgn-enr-2', N'asgn-prog-1', @c2, N'BF-A1002', N'Nimal Silva', '2026-07-05', N'Active', N'Daniel Perera', N'Maya Fernando', 48, N'Jul–Sep 2026', @now),
    (N'asgn-enr-3', N'asgn-prog-2', @c3, N'BF-A1003', N'Ishara Fernando', '2026-08-02', N'Active', N'Daniel Perera', N'Maya Fernando', 35, N'Aug–Oct 2026', @now),
    (N'asgn-enr-4', N'asgn-prog-3', @c4, N'BF-A1004', N'Kavindi Jayasuriya', '2026-06-10', N'Active', N'Daniel Perera', N'Maya Fernando', 70, N'Jun–Aug 2026', @now),
    (N'asgn-enr-5', N'asgn-prog-4', @c5, N'BF-A1005', N'Ruwan Bandara', '2026-09-03', N'Active', N'Daniel Perera', N'Maya Fernando', 18, N'Sep–Nov 2026', @now),
    (N'asgn-enr-6', N'asgn-prog-5', @c1, N'BF-A1001', N'Asha Perera', '2026-01-12', N'Completed', N'Daniel Perera', N'Maya Fernando', 100, N'Jan–Apr 2026', @now);
END

/* ========== appointments (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.appointments WHERE id = N'asgn-apt-1')
BEGIN
    INSERT INTO dbo.appointments (
        id, client_user_id, client_id, client_name, service_type, professional, professional_user_id,
        professional_role, programme, appointment_date, appointment_time, duration, status,
        booking_reference, notes, location, audience, created_at, updated_at
    )
    VALUES
    (N'asgn-apt-1', @c1, N'BF-A1001', N'Asha Perera', N'Fitness Consultation', N'Daniel Perera', @coach, N'Fitness Coach', N'Weight Management 2026', '2026-09-12', N'10:00 AM', N'45 min', N'Upcoming', N'BF-APT-ASGN-01', N'Wear trainers', N'VitalLife Centre', N'CLIENT', @now, @now),
    (N'asgn-apt-2', @c2, N'BF-A1002', N'Nimal Silva', N'Nutrition Consultation', N'Maya Fernando', @nutri, N'Nutrition Consultant', N'Weight Management 2026', '2026-09-18', N'02:30 PM', N'45 min', N'Upcoming', N'BF-APT-ASGN-02', N'Bring food log', N'VitalLife Centre', N'CLIENT', @now, @now),
    (N'asgn-apt-3', @c3, N'BF-A1003', N'Ishara Fernando', N'Health Check-up', N'Elena Costa', @med, N'Medical Advisor', N'Energy Reset', '2026-08-20', N'09:15 AM', N'60 min', N'Completed', N'BF-APT-ASGN-03', N'Fasting labs done', N'VitalLife Centre', N'CLIENT', @now, @now),
    (N'asgn-apt-4', @c4, N'BF-A1004', N'Kavindi Jayasuriya', N'Fitness Consultation', N'Daniel Perera', @coach, N'Fitness Coach', N'Strength Foundations', '2026-09-20', N'11:00 AM', N'45 min', N'Upcoming', N'BF-APT-ASGN-04', NULL, N'VitalLife Centre', N'CLIENT', @now, @now),
    (N'asgn-apt-5', @c5, N'BF-A1005', N'Ruwan Bandara', N'Nutrition Consultation', N'Maya Fernando', @nutri, N'Nutrition Consultant', N'Metabolic Balance', '2026-09-05', N'04:00 PM', N'45 min', N'Cancelled', N'BF-APT-ASGN-05', N'Client travel', N'VitalLife Centre', N'CLIENT', @now, @now),
    (N'asgn-apt-6', @c1, N'BF-A1001', N'Asha Perera', N'Health Check-up', N'Elena Costa', @med, N'Medical Advisor', N'Weight Management 2026', '2026-07-15', N'09:00 AM', N'60 min', N'Completed', N'BF-APT-ASGN-06', NULL, N'VitalLife Centre', N'CLIENT', @now, @now);
END

/* ========== exercises (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.exercises WHERE id = N'asgn-ex-1')
BEGIN
    INSERT INTO dbo.exercises (id, name, category, difficulty, target_area, equipment, instructions, safety_notes, sets_label, reps_label, duration_label, rest_label, created_at)
    VALUES
    (N'asgn-ex-1', N'Bodyweight squat', N'Strength', N'Beginner', N'Lower body', N'None', N'Sit back, knees track toes', N'Stop if sharp knee pain', N'3', N'10', N'—', N'60 sec', @now),
    (N'asgn-ex-2', N'Brisk walk', N'Cardio', N'Beginner', N'Full body', N'None', N'Moderate pace outdoors/treadmill', N'Hydrate', N'1', N'—', N'25 min', N'—', @now),
    (N'asgn-ex-3', N'Push-up (knee)', N'Strength', N'Beginner', N'Chest', N'Mat', N'Controlled tempo', N'Keep neutral spine', N'3', N'8', N'—', N'60 sec', @now),
    (N'asgn-ex-4', N'Hip hinge stretch', N'Mobility', N'Beginner', N'Posterior chain', N'None', N'Hinge at hips, soft knees', N'No bouncing', N'2', N'8', N'—', N'30 sec', @now),
    (N'asgn-ex-5', N'Breathing reset', N'Recovery', N'Beginner', N'Core/breath', N'None', N'Box breathing 4-4-4-4', NULL, N'1', N'—', N'5 min', N'—', @now);
END

/* ========== workout_plans (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.workout_plans WHERE id = N'asgn-wp-1')
BEGIN
    INSERT INTO dbo.workout_plans (id, name, client_user_id, client_id, client_name, programme, goal, difficulty, start_date, end_date, sessions_per_week, session_duration, description, current_week, total_weeks, progress, status, plan_json, created_at, updated_at)
    VALUES
    (N'asgn-wp-1', N'Asha Movement Block', @c1, N'BF-A1001', N'Asha Perera', N'Weight Management 2026', N'Sustainable habits', N'Moderate', '2026-07-01', '2026-09-30', 4, N'45 min', N'Progressive plan', N'Week 10', 12, 62, N'Active', N'{"note":"assignment"}', @now, @now),
    (N'asgn-wp-2', N'Nimal Cardio Base', @c2, N'BF-A1002', N'Nimal Silva', N'Weight Management 2026', N'Improve endurance', N'Moderate', '2026-07-05', '2026-09-30', 3, N'40 min', N'Zone 2 focus', N'Week 9', 12, 50, N'Active', N'{"note":"assignment"}', @now, @now),
    (N'asgn-wp-3', N'Ishara Mobility', @c3, N'BF-A1003', N'Ishara Fernando', N'Energy Reset', N'Mobility + sleep', N'Beginner', '2026-08-01', '2026-10-01', 3, N'30 min', N'Gentle mobility', N'Week 5', 8, 40, N'Active', N'{"note":"assignment"}', @now, @now),
    (N'asgn-wp-4', N'Kavindi Strength', @c4, N'BF-A1004', N'Kavindi Jayasuriya', N'Strength Foundations', N'Technique first', N'Beginner', '2026-06-01', '2026-08-31', 3, N'45 min', N'Strength intro', N'Week 11', 12, 72, N'Active', N'{"note":"assignment"}', @now, @now),
    (N'asgn-wp-5', N'Ruwan Metabolic Move', @c5, N'BF-A1005', N'Ruwan Bandara', N'Metabolic Balance', N'Daily steps + strength', N'Beginner', '2026-09-01', '2026-11-30', 4, N'35 min', N'Glucose-aware activity', N'Week 2', 12, 15, N'Active', N'{"note":"assignment"}', @now, @now);
END

/* ========== workout_plan_exercises (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.workout_plan_exercises WHERE workout_plan_id = N'asgn-wp-1')
BEGIN
    INSERT INTO dbo.workout_plan_exercises (workout_plan_id, exercise_id, sequence_no, day_label, sets_label, reps_label, duration_label)
    VALUES
    (N'asgn-wp-1', N'asgn-ex-1', 1, N'Monday', N'3', N'10', NULL),
    (N'asgn-wp-1', N'asgn-ex-5', 2, N'Monday', N'1', NULL, N'5 min'),
    (N'asgn-wp-1', N'asgn-ex-2', 1, N'Thursday', N'1', NULL, N'25 min'),
    (N'asgn-wp-2', N'asgn-ex-2', 1, N'Tuesday', N'1', NULL, N'30 min'),
    (N'asgn-wp-2', N'asgn-ex-4', 2, N'Tuesday', N'2', N'8', NULL),
    (N'asgn-wp-4', N'asgn-ex-1', 1, N'Wednesday', N'3', N'10', NULL),
    (N'asgn-wp-4', N'asgn-ex-3', 2, N'Wednesday', N'3', N'8', NULL),
    (N'asgn-wp-5', N'asgn-ex-2', 1, N'Friday', N'1', NULL, N'20 min');
END

/* ========== meal_plans (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.meal_plans WHERE id = N'asgn-mp-1')
BEGIN
    INSERT INTO dbo.meal_plans (id, name, client_user_id, client_id, client_name, programme, goal, description, start_date, end_date, current_week, status, progress, version_no, plan_json, created_at, updated_at)
    VALUES
    (N'asgn-mp-1', N'Asha Daily Rhythm', @c1, N'BF-A1001', N'Asha Perera', N'Weight Management 2026', N'Steady energy', N'Balanced plates', '2026-07-01', '2026-09-30', N'Week 10', N'Active', 84, 2, N'{"note":"assignment"}', @now, @now),
    (N'asgn-mp-2', N'Nimal Performance Fuel', @c2, N'BF-A1002', N'Nimal Silva', N'Weight Management 2026', N'Performance', N'Higher protein', '2026-07-05', '2026-09-30', N'Week 9', N'Active', 70, 1, N'{"note":"assignment"}', @now, @now),
    (N'asgn-mp-3', N'Ishara Gentle Fuel', @c3, N'BF-A1003', N'Ishara Fernando', N'Energy Reset', N'Iron support', N'Iron-aware meals', '2026-08-01', '2026-10-01', N'Week 5', N'Active', 55, 1, N'{"note":"assignment"}', @now, @now),
    (N'asgn-mp-4', N'Kavindi Strength Meals', @c4, N'BF-A1004', N'Kavindi Jayasuriya', N'Strength Foundations', N'Recovery nutrition', N'Protein + carbs', '2026-06-01', '2026-08-31', N'Week 11', N'Active', 66, 1, N'{"note":"assignment"}', @now, @now),
    (N'asgn-mp-5', N'Ruwan Metabolic Plate', @c5, N'BF-A1005', N'Ruwan Bandara', N'Metabolic Balance', N'Glucose awareness', N'Lower GI focus', '2026-09-01', '2026-11-30', N'Week 2', N'Active', 20, 1, N'{"note":"assignment"}', @now, @now);
END

/* ========== dietary_restrictions (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.dietary_restrictions WHERE id = N'asgn-dr-1')
BEGIN
    INSERT INTO dbo.dietary_restrictions (id, client_user_id, client_id, client_name, name, type, status, date_recorded, last_reviewed, meal_plan, notes, meal_plan_impact, source, is_protected, created_at)
    VALUES
    (N'asgn-dr-1', @c1, N'BF-A1001', N'Asha Perera', N'Mild lactose sensitivity', N'Intolerance', N'Active', '2026-07-05', '2026-09-02', N'Asha Daily Rhythm', N'Dairy alternatives', N'Snack swaps', N'Consultant', 0, @now),
    (N'asgn-dr-2', @c2, N'BF-A1002', N'Nimal Silva', N'Peanut allergy', N'Allergy', N'Active', '2026-07-06', '2026-09-01', N'Nimal Performance Fuel', N'Strict avoidance', N'No peanut sauces', N'Medical', 1, @now),
    (N'asgn-dr-3', @c3, N'BF-A1003', N'Ishara Fernando', N'Vegetarian', N'Preference', N'Active', '2026-08-02', '2026-08-20', N'Ishara Gentle Fuel', N'No meat', N'Plant proteins', N'Client', 0, @now),
    (N'asgn-dr-4', @c4, N'BF-A1004', N'Kavindi Jayasuriya', N'Gluten sensitivity', N'Intolerance', N'Active', '2026-06-12', '2026-08-15', N'Kavindi Strength Meals', N'Reduce wheat', N'GF wraps', N'Consultant', 0, @now),
    (N'asgn-dr-5', @c5, N'BF-A1005', N'Ruwan Bandara', N'Low sugar preference', N'Preference', N'Active', '2026-09-02', '2026-09-10', N'Ruwan Metabolic Plate', N'Limit desserts', N'Fruit swaps', N'Consultant', 0, @now);
END

/* ========== support_tickets (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.support_tickets WHERE id = N'asgn-tkt-1')
BEGIN
    INSERT INTO dbo.support_tickets (id, client_user_id, client_id, client_name, subject, category, priority, status, assigned_to, related_service, messages_json, created_at, updated_at)
    VALUES
    (N'asgn-tkt-1', @c1, N'BF-A1001', N'Asha Perera', N'Reschedule nutrition session', N'Scheduling', N'Medium', N'Open', N'Priya Nair', N'Nutrition Consultation', N'[]', @now, @now),
    (N'asgn-tkt-2', @c2, N'BF-A1002', N'Nimal Silva', N'Billing receipt missing', N'Billing', N'High', N'In Progress', N'Priya Nair', N'Subscription', N'[]', @now, @now),
    (N'asgn-tkt-3', @c3, N'BF-A1003', N'Ishara Fernando', N'App notification noise', N'Technical', N'Low', N'Open', N'Priya Nair', N'Notifications', N'[]', @now, @now),
    (N'asgn-tkt-4', @c4, N'BF-A1004', N'Kavindi Jayasuriya', N'Change coach preference', N'Programme', N'Medium', N'Resolved', N'Priya Nair', N'Fitness', N'[]', @now, @now),
    (N'asgn-tkt-5', @c5, N'BF-A1005', N'Ruwan Bandara', N'Meal plan PDF export', N'Technical', N'Low', N'Closed', N'Priya Nair', N'Meal Plans', N'[]', @now, @now);
END

/* ========== notifications (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.notifications WHERE id = N'asgn-n-1')
BEGIN
    INSERT INTO dbo.notifications (id, user_id, audience, type, title, body, link, is_read, created_at)
    VALUES
    (N'asgn-n-1', @c1, N'CLIENT', N'appointment', N'Upcoming fitness session', N'12 Sep 10:00 AM', N'/appointments', 0, @now),
    (N'asgn-n-2', @c2, N'CLIENT', N'billing', N'Payment received', N'September subscription', N'/billing', 1, @now),
    (N'asgn-n-3', @c3, N'CLIENT', N'nutrition', N'Meal tip', N'Iron-rich lunch ideas', N'/nutrition', 0, @now),
    (N'asgn-n-4', @coach, N'COACH', N'progress', N'Review due', N'Review Asha progress', N'/coach/progress', 0, @now),
    (N'asgn-n-5', @med, N'MEDICAL', N'alert', N'Follow-up', N'Nimal BP follow-up', N'/medical/health-alerts', 0, @now),
    (N'asgn-n-6', NULL, N'MANAGER', N'operations', N'Capacity', N'WM programme near capacity', N'/manager/programmes', 0, @now);
END

/* ========== subscriptions (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.subscriptions WHERE id = N'asgn-sub-1')
BEGIN
    INSERT INTO dbo.subscriptions (id, user_id, plan_name, status, price_label, renews_on, created_at, amount)
    VALUES
    (N'asgn-sub-1', @c1, N'BioFit Wellness Plus', N'Active', N'LKR 12,500 / mo', '2026-10-01', @now, 12500.00),
    (N'asgn-sub-2', @c2, N'BioFit Wellness Plus', N'Active', N'LKR 12,500 / mo', '2026-10-01', @now, 12500.00),
    (N'asgn-sub-3', @c3, N'BioFit Starter', N'Active', N'LKR 8,500 / mo', '2026-10-05', @now, 8500.00),
    (N'asgn-sub-4', @c4, N'BioFit Wellness Plus', N'Paused', N'LKR 12,500 / mo', '2026-11-01', @now, 12500.00),
    (N'asgn-sub-5', @c5, N'BioFit Clinical Care', N'Active', N'LKR 15,000 / mo', '2026-10-03', @now, 15000.00);
END

/* ========== payments (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.payments WHERE id = N'asgn-pay-1')
BEGIN
    INSERT INTO dbo.payments (id, user_id, amount, currency, status, method_label, description, paid_at, created_at)
    VALUES
    (N'asgn-pay-1', @c1, 12500.00, N'LKR', N'Paid', N'Card', N'September subscription', DATEADD(DAY,-10,@now), @now),
    (N'asgn-pay-2', @c1, 12500.00, N'LKR', N'Paid', N'Card', N'August subscription', DATEADD(DAY,-40,@now), @now),
    (N'asgn-pay-3', @c2, 12500.00, N'LKR', N'Paid', N'Bank transfer', N'September subscription', DATEADD(DAY,-8,@now), @now),
    (N'asgn-pay-4', @c3, 8500.00, N'LKR', N'Paid', N'Card', N'September starter plan', DATEADD(DAY,-7,@now), @now),
    (N'asgn-pay-5', @c5, 15000.00, N'LKR', N'Paid', N'Card', N'Clinical Care September', DATEADD(DAY,-6,@now), @now),
    (N'asgn-pay-6', @c4, 12500.00, N'LKR', N'Pending', N'Card', N'Paused account renewal', NULL, @now),
    (N'asgn-pay-7', @c2, 2500.00, N'LKR', N'Failed', N'Card', N'Add-on lab fee (failed)', DATEADD(DAY,-3,@now), @now);
END

/* ========== staff_schedules (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.staff_schedules WHERE id = N'asgn-sch-1')
BEGIN
    INSERT INTO dbo.staff_schedules (id, schedule_date, start_time, end_time, staff_id, staff_name, role_label, service_label, client_name, programme, status, notes, created_at)
    VALUES
    (N'asgn-sch-1', '2026-09-12', N'10:00', N'10:45', N'st-coach', N'Daniel Perera', N'Fitness Coach', N'Fitness Consultation', N'Asha Perera', N'Weight Management 2026', N'Scheduled', NULL, @now),
    (N'asgn-sch-2', '2026-09-18', N'14:30', N'15:15', N'st-nutri', N'Maya Fernando', N'Nutrition Consultant', N'Nutrition Consultation', N'Nimal Silva', N'Weight Management 2026', N'Scheduled', NULL, @now),
    (N'asgn-sch-3', '2026-08-20', N'09:15', N'10:15', N'st-med', N'Elena Costa', N'Medical Advisor', N'Health Check-up', N'Ishara Fernando', N'Energy Reset', N'Completed', NULL, @now),
    (N'asgn-sch-4', '2026-09-20', N'11:00', N'11:45', N'st-coach', N'Daniel Perera', N'Fitness Coach', N'Fitness Consultation', N'Kavindi Jayasuriya', N'Strength Foundations', N'Scheduled', NULL, @now),
    (N'asgn-sch-5', '2026-09-05', N'16:00', N'16:45', N'st-nutri', N'Maya Fernando', N'Nutrition Consultant', N'Nutrition Consultation', N'Ruwan Bandara', N'Metabolic Balance', N'Cancelled', N'Client travel', @now);
END

/* ========== staff_availability (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.staff_availability WHERE id = N'asgn-sa-1')
BEGIN
    INSERT INTO dbo.staff_availability (id, professional_id, professional_user_id, kind, day_of_week, specific_date, start_time, end_time, reason, created_at)
    VALUES
    (N'asgn-sa-1', N'st-coach', @coach, N'WORKING', 1, NULL, N'09:00', N'17:00', N'Weekday clinic', @now),
    (N'asgn-sa-2', N'st-coach', @coach, N'WORKING', 3, NULL, N'09:00', N'17:00', N'Weekday clinic', @now),
    (N'asgn-sa-3', N'st-nutri', @nutri, N'WORKING', 2, NULL, N'10:00', N'16:00', N'Nutrition days', @now),
    (N'asgn-sa-4', N'st-med', @med, N'WORKING', 4, NULL, N'08:30', N'14:00', N'Medical clinic', @now),
    (N'asgn-sa-5', N'st-coach', @coach, N'BLOCKED', NULL, '2026-09-25', N'00:00', N'23:59', N'Training leave', @now);
END

/* ========== fitness_assessments (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.fitness_assessments WHERE id = N'asgn-fa-1')
BEGIN
    INSERT INTO dbo.fitness_assessments (id, client_user_id, client_id, client_name, coach_user_id, coach_name, assessment_date, type, status, next_assessment, payload_json, created_at)
    VALUES
    (N'asgn-fa-1', @c1, N'BF-A1001', N'Asha Perera', @coach, N'Daniel Perera', '2026-07-08', N'Baseline', N'Completed', '2026-10-08', N'{"pushups":8}', @now),
    (N'asgn-fa-2', @c2, N'BF-A1002', N'Nimal Silva', @coach, N'Daniel Perera', '2026-07-10', N'Baseline', N'Completed', '2026-10-10', N'{"pushups":12}', @now),
    (N'asgn-fa-3', @c3, N'BF-A1003', N'Ishara Fernando', @coach, N'Daniel Perera', '2026-08-05', N'Mobility', N'Completed', '2026-11-05', N'{"sit_reach_cm":22}', @now),
    (N'asgn-fa-4', @c4, N'BF-A1004', N'Kavindi Jayasuriya', @coach, N'Daniel Perera', '2026-06-15', N'Strength', N'Completed', '2026-09-15', N'{"squat_form":"good"}', @now),
    (N'asgn-fa-5', @c5, N'BF-A1005', N'Ruwan Bandara', @coach, N'Daniel Perera', '2026-09-04', N'Baseline', N'Completed', '2026-12-04', N'{"steps_avg":6200}', @now);
END

/* ========== client_inquiries (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.client_inquiries WHERE id = N'asgn-inq-1')
BEGIN
    INSERT INTO dbo.client_inquiries (id, client_user_id, client_id, client_name, email, phone, subject, category, message, status, assigned_to, responses_json, received_at, created_at)
    VALUES
    (N'asgn-inq-1', @c1, N'BF-A1001', N'Asha Perera', N'asgn.client1@biofit.demo', N'0771001001', N'Programme fees', N'Billing', N'What is included in Wellness Plus?', N'Open', N'Priya Nair', N'[]', @now, @now),
    (N'asgn-inq-2', @c2, N'BF-A1002', N'Nimal Silva', N'asgn.client2@biofit.demo', N'0771001002', N'Coach availability', N'Scheduling', N'Evening slots?', N'Open', N'Priya Nair', N'[]', @now, @now),
    (N'asgn-inq-3', @c3, N'BF-A1003', N'Ishara Fernando', N'asgn.client3@biofit.demo', N'0771001003', N'Vegetarian meals', N'Nutrition', N'Can plans stay vegetarian?', N'Resolved', N'Maya Fernando', N'[]', @now, @now),
    (N'asgn-inq-4', NULL, NULL, N'Guest Visitor', N'guest@example.com', N'0779998888', N'Membership trial', N'Sales', N'Do you offer a 7-day trial?', N'Open', N'Sarah Williams', N'[]', @now, @now),
    (N'asgn-inq-5', @c5, N'BF-A1005', N'Ruwan Bandara', N'asgn.client5@biofit.demo', N'0771001005', N'Lab partners', N'Medical', N'Which labs do you partner with?', N'In Progress', N'Elena Costa', N'[]', @now, @now);
END

/* ========== client_feedback (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.client_feedback WHERE id = N'asgn-fb-1')
BEGIN
    INSERT INTO dbo.client_feedback (id, client_user_id, client_id, client_name, type, subject, message, status, assigned_to, related_service, notes_json, complaint_lifecycle_json, submitted_at, updated_at)
    VALUES
    (N'asgn-fb-1', @c1, N'BF-A1001', N'Asha Perera', N'Praise', N'Great coach support', N'Daniel explains form clearly.', N'Closed', N'Priya Nair', N'Fitness', N'[]', N'{}', @now, @now),
    (N'asgn-fb-2', @c2, N'BF-A1002', N'Nimal Silva', N'Complaint', N'Late start', N'Session started 15 minutes late.', N'Open', N'Priya Nair', N'Fitness', N'[]', N'{}', @now, @now),
    (N'asgn-fb-3', @c3, N'BF-A1003', N'Ishara Fernando', N'Suggestion', N'More veg recipes', N'Please add more lentil recipes.', N'In Progress', N'Maya Fernando', N'Nutrition', N'[]', N'{}', @now, @now),
    (N'asgn-fb-4', @c4, N'BF-A1004', N'Kavindi Jayasuriya', N'Praise', N'Meal plan clarity', N'Portions are easy to follow.', N'Closed', N'Priya Nair', N'Nutrition', N'[]', N'{}', @now, @now),
    (N'asgn-fb-5', @c5, N'BF-A1005', N'Ruwan Bandara', N'Complaint', N'Portal login glitch', N'Had to reset password twice.', N'Resolved', N'Priya Nair', N'Platform', N'[]', N'{}', @now, @now);
END

/* ========== medical_history_entries (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.medical_history_entries WHERE client_code LIKE N'BF-A10%' AND record_type = N'ASGN')
BEGIN
    INSERT INTO dbo.medical_history_entries (user_id, client_code, client_name, record_type, condition_name, allergy_info, description, severity, recorded_date, status, created_by_user_id, created_by_name, created_at, updated_at)
    VALUES
    (@c1, N'BF-A1001', N'Asha Perera', N'ASGN', N'Lactose sensitivity', NULL, N'Mild GI discomfort with milk', N'Mild', '2026-07-05', N'Active', @med, N'Elena Costa', @now, @now),
    (@c2, N'BF-A1002', N'Nimal Silva', N'ASGN', NULL, N'Peanut', N'Anaphylaxis risk — EpiPen noted', N'Severe', '2026-07-06', N'Active', @med, N'Elena Costa', @now, @now),
    (@c3, N'BF-A1003', N'Ishara Fernando', N'ASGN', N'Iron deficiency (history)', NULL, N'Previously treated 2025', N'Moderate', '2026-08-02', N'Active', @med, N'Elena Costa', @now, @now),
    (@c4, N'BF-A1004', N'Kavindi Jayasuriya', N'ASGN', N'Prior knee sprain', NULL, N'Cleared for strength training', N'Mild', '2026-06-12', N'Active', @med, N'Elena Costa', @now, @now),
    (@c5, N'BF-A1005', N'Ruwan Bandara', N'ASGN', N'Prediabetes watch', NULL, N'Lifestyle management', N'Moderate', '2026-09-02', N'Active', @med, N'Elena Costa', @now, @now);
END

/* ========== safety_validations (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.safety_validations WHERE reference_id LIKE N'asgn-%')
BEGIN
    INSERT INTO dbo.safety_validations (user_id, client_code, client_name, reference_type, reference_id, result_status, warnings_json, advisor_notes, validated_by_user_id, validated_by_name, validated_at, created_at, updated_at)
    VALUES
    (@c1, N'BF-A1001', N'Asha Perera', N'MEAL_PLAN', N'asgn-mp-1', N'APPROVED', N'[]', N'Lactose alternatives OK', @med, N'Elena Costa', @now, @now, @now),
    (@c2, N'BF-A1002', N'Nimal Silva', N'MEAL_PLAN', N'asgn-mp-2', N'APPROVED_WITH_WARNINGS', N'["Peanut exclusion required"]', N'Strict allergen check', @med, N'Elena Costa', @now, @now, @now),
    (@c3, N'BF-A1003', N'Ishara Fernando', N'WORKOUT_PLAN', N'asgn-wp-3', N'APPROVED', N'[]', N'Mobility load appropriate', @med, N'Elena Costa', @now, @now, @now),
    (@c4, N'BF-A1004', N'Kavindi Jayasuriya', N'WORKOUT_PLAN', N'asgn-wp-4', N'APPROVED', N'[]', N'Knee cleared', @med, N'Elena Costa', @now, @now, @now),
    (@c5, N'BF-A1005', N'Ruwan Bandara', N'MEAL_PLAN', N'asgn-mp-5', N'APPROVED_WITH_WARNINGS', N'["Monitor glucose response"]', N'Lower GI emphasis', @med, N'Elena Costa', @now, @now, @now);
END

/* ========== erasure_requests (≥5) ========== */
IF NOT EXISTS (SELECT 1 FROM dbo.erasure_requests WHERE reason LIKE N'ASGN:%')
BEGIN
    INSERT INTO dbo.erasure_requests (
        record_type, record_id, client_user_id, legal_basis, reason, status,
        requested_by_user_id, requested_at, reviewed_by_user_id, reviewed_at, review_notes
    )
    VALUES
    (N'HEALTH_PROFILE', 0, @c1, N'GDPR Art. 17 request', N'ASGN: Client withdrew from demo profile copy', N'PENDING', @c1, @now, NULL, NULL, NULL),
    (N'HEALTH_ALERT', 0, @c2, N'GDPR Art. 17 request', N'ASGN: Remove duplicate alert draft', N'PENDING', @c2, @now, NULL, NULL, NULL),
    (N'HEALTH_PROFILE', 0, @c3, N'Controller decision', N'ASGN: Soft-deleted stale draft', N'APPROVED', @med, DATEADD(DAY,-2,@now), @mgr, DATEADD(DAY,-1,@now), N'Approved for hard delete'),
    (N'MEDICAL_HISTORY', 0, @c4, N'Legal retention exception review', N'ASGN: Review retention hold', N'REJECTED', @c4, DATEADD(DAY,-5,@now), @mgr, DATEADD(DAY,-4,@now), N'Retention required'),
    (N'HEALTH_ALERT', 0, @c5, N'GDPR Art. 17 request', N'ASGN: Clear resolved alert archive', N'EXECUTED', @med, DATEADD(DAY,-10,@now), @mgr, DATEADD(DAY,-9,@now), N'Executed after review');
END

PRINT 'Script 05 sample data load finished.';
GO

/* ========== Coverage check (≥5 target) ========== */
SELECT 'roles' AS table_name, COUNT(*) AS row_count FROM dbo.roles
UNION ALL SELECT 'users', COUNT(*) FROM dbo.users
UNION ALL SELECT 'user_roles', COUNT(*) FROM dbo.user_roles
UNION ALL SELECT 'refresh_tokens', COUNT(*) FROM dbo.refresh_tokens
UNION ALL SELECT 'audit_logs', COUNT(*) FROM dbo.audit_logs
UNION ALL SELECT 'health_profiles', COUNT(*) FROM dbo.health_profiles
UNION ALL SELECT 'health_metrics', COUNT(*) FROM dbo.health_metrics
UNION ALL SELECT 'health_goals', COUNT(*) FROM dbo.health_goals
UNION ALL SELECT 'health_assessments', COUNT(*) FROM dbo.health_assessments
UNION ALL SELECT 'health_risk_alerts', COUNT(*) FROM dbo.health_risk_alerts
UNION ALL SELECT 'wellness_programmes', COUNT(*) FROM dbo.wellness_programmes
UNION ALL SELECT 'programme_enrolments', COUNT(*) FROM dbo.programme_enrolments
UNION ALL SELECT 'appointments', COUNT(*) FROM dbo.appointments
UNION ALL SELECT 'exercises', COUNT(*) FROM dbo.exercises
UNION ALL SELECT 'workout_plans', COUNT(*) FROM dbo.workout_plans
UNION ALL SELECT 'workout_plan_exercises', COUNT(*) FROM dbo.workout_plan_exercises
UNION ALL SELECT 'meal_plans', COUNT(*) FROM dbo.meal_plans
UNION ALL SELECT 'dietary_restrictions', COUNT(*) FROM dbo.dietary_restrictions
UNION ALL SELECT 'support_tickets', COUNT(*) FROM dbo.support_tickets
UNION ALL SELECT 'notifications', COUNT(*) FROM dbo.notifications
UNION ALL SELECT 'subscriptions', COUNT(*) FROM dbo.subscriptions
UNION ALL SELECT 'payments', COUNT(*) FROM dbo.payments
UNION ALL SELECT 'staff_schedules', COUNT(*) FROM dbo.staff_schedules
UNION ALL SELECT 'staff_availability', COUNT(*) FROM dbo.staff_availability
UNION ALL SELECT 'fitness_assessments', COUNT(*) FROM dbo.fitness_assessments
UNION ALL SELECT 'client_inquiries', COUNT(*) FROM dbo.client_inquiries
UNION ALL SELECT 'client_feedback', COUNT(*) FROM dbo.client_feedback
UNION ALL SELECT 'medical_history_entries', COUNT(*) FROM dbo.medical_history_entries
UNION ALL SELECT 'safety_validations', COUNT(*) FROM dbo.safety_validations
UNION ALL SELECT 'erasure_requests', COUNT(*) FROM dbo.erasure_requests
ORDER BY table_name;
GO
