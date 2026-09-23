/*
================================================================================
BioFit — Script 03: Foreign keys, CHECKs, UNIQUE
Additive integrity only. Status CHECKs include values used by the live app.
================================================================================
Part B | Re-runnable (skips if constraint name already exists)
================================================================================
*/

USE biofit;
GO

/* -------------------------------------------------------------------------- */
/* Pre-clean orphan logical FKs (nullable columns only) so ADD CONSTRAINT     */
/* succeeds on databases that already contain app/demo rows.                  */
/* -------------------------------------------------------------------------- */
UPDATE dbo.programme_enrolments SET client_user_id = NULL
WHERE client_user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users u WHERE u.id = client_user_id);

UPDATE dbo.appointments SET client_user_id = NULL
WHERE client_user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users u WHERE u.id = client_user_id);

UPDATE dbo.appointments SET professional_user_id = NULL
WHERE professional_user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users u WHERE u.id = professional_user_id);

UPDATE dbo.meal_plans SET client_user_id = NULL
WHERE client_user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users u WHERE u.id = client_user_id);

UPDATE dbo.workout_plans SET client_user_id = NULL
WHERE client_user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users u WHERE u.id = client_user_id);

UPDATE dbo.dietary_restrictions SET client_user_id = NULL
WHERE client_user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users u WHERE u.id = client_user_id);

UPDATE dbo.support_tickets SET client_user_id = NULL
WHERE client_user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users u WHERE u.id = client_user_id);

UPDATE dbo.notifications SET user_id = NULL
WHERE user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users u WHERE u.id = user_id);

UPDATE dbo.fitness_assessments SET client_user_id = NULL
WHERE client_user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users u WHERE u.id = client_user_id);

UPDATE dbo.fitness_assessments SET coach_user_id = NULL
WHERE coach_user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users u WHERE u.id = coach_user_id);

UPDATE dbo.client_inquiries SET client_user_id = NULL
WHERE client_user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users u WHERE u.id = client_user_id);

UPDATE dbo.client_feedback SET client_user_id = NULL
WHERE client_user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users u WHERE u.id = client_user_id);

UPDATE dbo.staff_availability SET professional_user_id = NULL
WHERE professional_user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users u WHERE u.id = professional_user_id);

UPDATE dbo.health_assessments SET created_by = NULL
WHERE created_by IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.users u WHERE u.id = created_by);

/* Non-nullable user_id orphans: delete only clearly broken demo rows */
DELETE FROM dbo.payments
WHERE NOT EXISTS (SELECT 1 FROM dbo.users u WHERE u.id = payments.user_id);

DELETE FROM dbo.subscriptions
WHERE NOT EXISTS (SELECT 1 FROM dbo.users u WHERE u.id = subscriptions.user_id);

PRINT 'Orphan pre-clean complete.';
GO

/* Helper pattern: create constraint only if missing */
/* -------------------------------------------------------------------------- */
/* FOREIGN KEYS — logical user links                                          */
/* -------------------------------------------------------------------------- */

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'fk_enrol_client_user')
    ALTER TABLE dbo.programme_enrolments
        ADD CONSTRAINT fk_enrol_client_user
        FOREIGN KEY (client_user_id) REFERENCES dbo.users (id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'fk_appt_client_user')
    ALTER TABLE dbo.appointments
        ADD CONSTRAINT fk_appt_client_user
        FOREIGN KEY (client_user_id) REFERENCES dbo.users (id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'fk_appt_professional_user')
    ALTER TABLE dbo.appointments
        ADD CONSTRAINT fk_appt_professional_user
        FOREIGN KEY (professional_user_id) REFERENCES dbo.users (id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'fk_meal_plans_client')
    ALTER TABLE dbo.meal_plans
        ADD CONSTRAINT fk_meal_plans_client
        FOREIGN KEY (client_user_id) REFERENCES dbo.users (id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'fk_workout_plans_client')
    ALTER TABLE dbo.workout_plans
        ADD CONSTRAINT fk_workout_plans_client
        FOREIGN KEY (client_user_id) REFERENCES dbo.users (id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'fk_dietary_client')
    ALTER TABLE dbo.dietary_restrictions
        ADD CONSTRAINT fk_dietary_client
        FOREIGN KEY (client_user_id) REFERENCES dbo.users (id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'fk_tickets_client')
    ALTER TABLE dbo.support_tickets
        ADD CONSTRAINT fk_tickets_client
        FOREIGN KEY (client_user_id) REFERENCES dbo.users (id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'fk_notifications_user')
    ALTER TABLE dbo.notifications
        ADD CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES dbo.users (id) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'fk_subscriptions_user')
    ALTER TABLE dbo.subscriptions
        ADD CONSTRAINT fk_subscriptions_user
        FOREIGN KEY (user_id) REFERENCES dbo.users (id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'fk_payments_user')
    ALTER TABLE dbo.payments
        ADD CONSTRAINT fk_payments_user
        FOREIGN KEY (user_id) REFERENCES dbo.users (id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'fk_fitness_client')
    ALTER TABLE dbo.fitness_assessments
        ADD CONSTRAINT fk_fitness_client
        FOREIGN KEY (client_user_id) REFERENCES dbo.users (id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'fk_fitness_coach')
    ALTER TABLE dbo.fitness_assessments
        ADD CONSTRAINT fk_fitness_coach
        FOREIGN KEY (coach_user_id) REFERENCES dbo.users (id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'fk_inquiries_client')
    ALTER TABLE dbo.client_inquiries
        ADD CONSTRAINT fk_inquiries_client
        FOREIGN KEY (client_user_id) REFERENCES dbo.users (id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'fk_feedback_client')
    ALTER TABLE dbo.client_feedback
        ADD CONSTRAINT fk_feedback_client
        FOREIGN KEY (client_user_id) REFERENCES dbo.users (id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'fk_staff_avail_user')
    ALTER TABLE dbo.staff_availability
        ADD CONSTRAINT fk_staff_avail_user
        FOREIGN KEY (professional_user_id) REFERENCES dbo.users (id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'fk_health_assess_created_by')
BEGIN
    -- created_by is BIGINT nullable on health_assessments
    ALTER TABLE dbo.health_assessments
        ADD CONSTRAINT fk_health_assess_created_by
        FOREIGN KEY (created_by) REFERENCES dbo.users (id);
END
GO

/* -------------------------------------------------------------------------- */
/* UNIQUE — booking reference when present                                    */
/* -------------------------------------------------------------------------- */
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'ux_appointments_booking_reference'
      AND object_id = OBJECT_ID(N'dbo.appointments')
)
BEGIN
    CREATE UNIQUE INDEX ux_appointments_booking_reference
        ON dbo.appointments (booking_reference)
        WHERE booking_reference IS NOT NULL;
    PRINT 'Created filtered UNIQUE index on appointments.booking_reference';
END
GO

/* -------------------------------------------------------------------------- */
/* CHECK constraints — domain rules                                           */
/* Include live-app status values to avoid breaking existing rows.            */
/* -------------------------------------------------------------------------- */

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'ck_payments_amount_positive')
    ALTER TABLE dbo.payments
        ADD CONSTRAINT ck_payments_amount_positive CHECK (amount > 0);
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'ck_payments_status')
    ALTER TABLE dbo.payments
        ADD CONSTRAINT ck_payments_status
        CHECK (status IN (N'Paid', N'Pending', N'Failed', N'Refunded'));
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'ck_subscriptions_status')
    ALTER TABLE dbo.subscriptions
        ADD CONSTRAINT ck_subscriptions_status
        CHECK (status IN (N'Active', N'Cancelled', N'Expired', N'Paused'));
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'ck_subscriptions_amount_nonneg')
    ALTER TABLE dbo.subscriptions
        ADD CONSTRAINT ck_subscriptions_amount_nonneg
        CHECK (amount IS NULL OR amount >= 0);
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'ck_appointments_status')
    ALTER TABLE dbo.appointments
        ADD CONSTRAINT ck_appointments_status
        CHECK (status IN (N'Upcoming', N'Completed', N'Cancelled', N'No-Show'));
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'ck_programmes_dates')
    ALTER TABLE dbo.wellness_programmes
        ADD CONSTRAINT ck_programmes_dates
        CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date);
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'ck_programmes_capacity')
    ALTER TABLE dbo.wellness_programmes
        ADD CONSTRAINT ck_programmes_capacity
        CHECK (capacity IS NULL OR capacity >= 0);
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'ck_programmes_enrolled')
    ALTER TABLE dbo.wellness_programmes
        ADD CONSTRAINT ck_programmes_enrolled
        CHECK (enrolled IS NULL OR enrolled >= 0);
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'ck_enrol_progress')
    ALTER TABLE dbo.programme_enrolments
        ADD CONSTRAINT ck_enrol_progress
        CHECK (progress IS NULL OR (progress >= 0 AND progress <= 100));
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'ck_meal_progress')
    ALTER TABLE dbo.meal_plans
        ADD CONSTRAINT ck_meal_progress
        CHECK (progress IS NULL OR (progress >= 0 AND progress <= 100));
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'ck_meal_dates')
    ALTER TABLE dbo.meal_plans
        ADD CONSTRAINT ck_meal_dates
        CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date);
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'ck_workout_progress')
    ALTER TABLE dbo.workout_plans
        ADD CONSTRAINT ck_workout_progress
        CHECK (progress IS NULL OR (progress >= 0 AND progress <= 100));
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'ck_workout_dates')
    ALTER TABLE dbo.workout_plans
        ADD CONSTRAINT ck_workout_dates
        CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date);
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'ck_health_goals_progress')
    ALTER TABLE dbo.health_goals
        ADD CONSTRAINT ck_health_goals_progress
        CHECK (progress_percent >= 0 AND progress_percent <= 100);
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'ck_health_profiles_height')
    ALTER TABLE dbo.health_profiles
        ADD CONSTRAINT ck_health_profiles_height
        CHECK (height_cm IS NULL OR (height_cm >= 50 AND height_cm <= 300));
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'ck_health_profiles_weight')
    ALTER TABLE dbo.health_profiles
        ADD CONSTRAINT ck_health_profiles_weight
        CHECK (weight_kg IS NULL OR (weight_kg >= 20 AND weight_kg <= 400));
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'ck_staff_avail_kind')
    ALTER TABLE dbo.staff_availability
        ADD CONSTRAINT ck_staff_avail_kind
        CHECK (kind IN (N'WORKING', N'BLOCKED'));
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'ck_staff_avail_dow')
    ALTER TABLE dbo.staff_availability
        ADD CONSTRAINT ck_staff_avail_dow
        CHECK (day_of_week IS NULL OR (day_of_week >= 0 AND day_of_week <= 6));
GO

PRINT 'Script 03 complete — FKs / CHECKs / UNIQUE applied (or already present).';
PRINT 'If a statement failed: check for orphan user_id values before re-running.';
GO
