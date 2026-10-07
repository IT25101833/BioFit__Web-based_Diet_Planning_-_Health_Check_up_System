/*
================================================================================
BioFit — Script 15: Domain triggers (set-based)
================================================================================
One meaningful trigger per management area. Prefer AFTER + inserted/deleted.
Keeps existing trg_health_metrics_audit (script 09).

Speaker map:
  Appointment  -> trg_appointments_status_audit
  Nutrition    -> trg_meal_plans_version_bump
  Healthcare   -> trg_health_risk_alert_audit   (+ existing trg_health_metrics_audit)
  Fitness      -> trg_fitness_assessments_audit
  Support      -> trg_support_tickets_status_audit
  Programmes   -> trg_programme_enrolment_sync
  Billing      -> trg_payments_audit
================================================================================
*/

USE biofit;
GO

/* ========================================================================== */
/* APPOINTMENT — audit status changes to audit_logs                           */
/* ========================================================================== */
CREATE OR ALTER TRIGGER dbo.trg_appointments_status_audit
ON dbo.appointments
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.audit_logs (
        user_id, action, entity_type, entity_id, result_status, details, created_at
    )
    SELECT
        i.client_user_id,
        N'APPOINTMENT_INSERT',
        N'APPOINTMENT',
        i.id,
        N'SUCCESS',
        LEFT(CONCAT(N'status=', i.status, N'; svc=', i.service_type, N'; by=', SUSER_SNAME()), 1000),
        SYSUTCDATETIME()
    FROM inserted AS i
    WHERE NOT EXISTS (SELECT 1 FROM deleted AS d WHERE d.id = i.id);

    INSERT INTO dbo.audit_logs (
        user_id, action, entity_type, entity_id, result_status, details, created_at
    )
    SELECT
        d.client_user_id,
        N'APPOINTMENT_DELETE',
        N'APPOINTMENT',
        d.id,
        N'SUCCESS',
        LEFT(CONCAT(N'old_status=', d.status, N'; by=', SUSER_SNAME()), 1000),
        SYSUTCDATETIME()
    FROM deleted AS d
    WHERE NOT EXISTS (SELECT 1 FROM inserted AS i WHERE i.id = d.id);

    INSERT INTO dbo.audit_logs (
        user_id, action, entity_type, entity_id, result_status, details, created_at
    )
    SELECT
        i.client_user_id,
        N'APPOINTMENT_STATUS_CHANGE',
        N'APPOINTMENT',
        i.id,
        N'SUCCESS',
        LEFT(CONCAT(N'old=', d.status, N'; new=', i.status, N'; by=', SUSER_SNAME()), 1000),
        SYSUTCDATETIME()
    FROM inserted AS i
    INNER JOIN deleted AS d ON d.id = i.id
    WHERE ISNULL(d.status, N'') <> ISNULL(i.status, N'');
END;
GO

/* ========================================================================== */
/* NUTRITION — bump version_no when plan content changes                      */
/* ========================================================================== */
CREATE OR ALTER TRIGGER dbo.trg_meal_plans_version_bump
ON dbo.meal_plans
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    /* Only when meaningful fields change — set-based bump */
    UPDATE mp
    SET
        version_no = COALESCE(mp.version_no, 1) + 1,
        updated_at = SYSUTCDATETIME()
    FROM dbo.meal_plans AS mp
    INNER JOIN inserted AS i ON i.id = mp.id
    INNER JOIN deleted AS d ON d.id = mp.id
    WHERE ISNULL(i.plan_json, N'') <> ISNULL(d.plan_json, N'')
       OR ISNULL(i.name, N'') <> ISNULL(d.name, N'')
       OR ISNULL(i.goal, N'') <> ISNULL(d.goal, N'')
       OR ISNULL(i.description, N'') <> ISNULL(d.description, N'');

    INSERT INTO dbo.audit_logs (
        user_id, action, entity_type, entity_id, result_status, details, created_at
    )
    SELECT
        i.client_user_id,
        N'MEAL_PLAN_VERSION_BUMP',
        N'MEAL_PLAN',
        i.id,
        N'SUCCESS',
        LEFT(CONCAT(
            N'version=', COALESCE(CONVERT(VARCHAR(12), mp.version_no), N'?'),
            N'; by=', SUSER_SNAME()
        ), 1000),
        SYSUTCDATETIME()
    FROM inserted AS i
    INNER JOIN deleted AS d ON d.id = i.id
    INNER JOIN dbo.meal_plans AS mp ON mp.id = i.id
    WHERE ISNULL(i.plan_json, N'') <> ISNULL(d.plan_json, N'')
       OR ISNULL(i.name, N'') <> ISNULL(d.name, N'')
       OR ISNULL(i.goal, N'') <> ISNULL(d.goal, N'')
       OR ISNULL(i.description, N'') <> ISNULL(d.description, N'');
END;
GO

/* ========================================================================== */
/* HEALTHCARE — audit risk alert inserts / status changes                     */
/* ========================================================================== */
CREATE OR ALTER TRIGGER dbo.trg_health_risk_alert_audit
ON dbo.health_risk_alerts
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.audit_logs (
        user_id, action, entity_type, entity_id, result_status, details, created_at
    )
    SELECT
        i.user_id,
        N'HEALTH_ALERT_INSERT',
        N'HEALTH_RISK_ALERT',
        CAST(i.id AS VARCHAR(100)),
        N'SUCCESS',
        LEFT(CONCAT(
            N'title=', LEFT(i.title, 80),
            N'; priority=', COALESCE(i.priority, N''),
            N'; by=', SUSER_SNAME()
        ), 1000),
        SYSUTCDATETIME()
    FROM inserted AS i
    WHERE NOT EXISTS (SELECT 1 FROM deleted AS d WHERE d.id = i.id);

    INSERT INTO dbo.audit_logs (
        user_id, action, entity_type, entity_id, result_status, details, created_at
    )
    SELECT
        i.user_id,
        N'HEALTH_ALERT_UPDATE',
        N'HEALTH_RISK_ALERT',
        CAST(i.id AS VARCHAR(100)),
        N'SUCCESS',
        LEFT(CONCAT(
            N'status ', d.status, N'->', i.status,
            N'; priority ', COALESCE(d.priority, N''), N'->', COALESCE(i.priority, N''),
            N'; by=', SUSER_SNAME()
        ), 1000),
        SYSUTCDATETIME()
    FROM inserted AS i
    INNER JOIN deleted AS d ON d.id = i.id
    WHERE ISNULL(d.status, N'') <> ISNULL(i.status, N'')
       OR ISNULL(d.priority, N'') <> ISNULL(i.priority, N'');
END;
GO

/* ========================================================================== */
/* FITNESS — audit fitness assessment inserts                                 */
/* ========================================================================== */
CREATE OR ALTER TRIGGER dbo.trg_fitness_assessments_audit
ON dbo.fitness_assessments
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.audit_logs (
        user_id, action, entity_type, entity_id, result_status, details, created_at
    )
    SELECT
        i.client_user_id,
        N'FITNESS_ASSESSMENT_INSERT',
        N'FITNESS_ASSESSMENT',
        i.id,
        N'SUCCESS',
        LEFT(CONCAT(
            N'type=', COALESCE(i.type, N''),
            N'; coach=', COALESCE(i.coach_name, N''),
            N'; by=', SUSER_SNAME()
        ), 1000),
        SYSUTCDATETIME()
    FROM inserted AS i
    WHERE NOT EXISTS (SELECT 1 FROM deleted AS d WHERE d.id = i.id);

    INSERT INTO dbo.audit_logs (
        user_id, action, entity_type, entity_id, result_status, details, created_at
    )
    SELECT
        d.client_user_id,
        N'FITNESS_ASSESSMENT_DELETE',
        N'FITNESS_ASSESSMENT',
        d.id,
        N'SUCCESS',
        LEFT(CONCAT(N'type=', COALESCE(d.type, N''), N'; by=', SUSER_SNAME()), 1000),
        SYSUTCDATETIME()
    FROM deleted AS d
    WHERE NOT EXISTS (SELECT 1 FROM inserted AS i WHERE i.id = d.id);

    INSERT INTO dbo.audit_logs (
        user_id, action, entity_type, entity_id, result_status, details, created_at
    )
    SELECT
        i.client_user_id,
        N'FITNESS_ASSESSMENT_UPDATE',
        N'FITNESS_ASSESSMENT',
        i.id,
        N'SUCCESS',
        LEFT(CONCAT(
            N'status ', COALESCE(d.status, N''), N'->', COALESCE(i.status, N''),
            N'; by=', SUSER_SNAME()
        ), 1000),
        SYSUTCDATETIME()
    FROM inserted AS i
    INNER JOIN deleted AS d ON d.id = i.id;
END;
GO

/* ========================================================================== */
/* SUPPORT — audit ticket status / priority changes + notify on Urgent        */
/* ========================================================================== */
CREATE OR ALTER TRIGGER dbo.trg_support_tickets_status_audit
ON dbo.support_tickets
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.audit_logs (
        user_id, action, entity_type, entity_id, result_status, details, created_at
    )
    SELECT
        i.client_user_id,
        N'SUPPORT_TICKET_INSERT',
        N'SUPPORT_TICKET',
        i.id,
        N'SUCCESS',
        LEFT(CONCAT(
            N'priority=', COALESCE(i.priority, N''),
            N'; subject=', LEFT(i.subject, 60),
            N'; by=', SUSER_SNAME()
        ), 1000),
        SYSUTCDATETIME()
    FROM inserted AS i
    WHERE NOT EXISTS (SELECT 1 FROM deleted AS d WHERE d.id = i.id);

    INSERT INTO dbo.audit_logs (
        user_id, action, entity_type, entity_id, result_status, details, created_at
    )
    SELECT
        i.client_user_id,
        N'SUPPORT_TICKET_STATUS_CHANGE',
        N'SUPPORT_TICKET',
        i.id,
        N'SUCCESS',
        LEFT(CONCAT(
            N'status ', COALESCE(d.status, N''), N'->', COALESCE(i.status, N''),
            N'; priority ', COALESCE(d.priority, N''), N'->', COALESCE(i.priority, N''),
            N'; by=', SUSER_SNAME()
        ), 1000),
        SYSUTCDATETIME()
    FROM inserted AS i
    INNER JOIN deleted AS d ON d.id = i.id
    WHERE ISNULL(d.status, N'') <> ISNULL(i.status, N'')
       OR ISNULL(d.priority, N'') <> ISNULL(i.priority, N'');

    /* Auto-notify CX audience when a ticket becomes Urgent (set-based) */
    INSERT INTO dbo.notifications (
        id, user_id, audience, type, title, body, link, is_read, created_at
    )
    SELECT
        LEFT(N'ntf-' + REPLACE(CONVERT(VARCHAR(36), NEWID()), N'-', N''), 40),
        i.client_user_id,
        N'SUPPORT',
        N'TICKET_URGENT',
        LEFT(N'Urgent ticket: ' + i.subject, 300),
        LEFT(CONCAT(N'Ticket ', i.id, N' marked Urgent for ', COALESCE(i.client_name, N'client')), 2000),
        N'/support/tickets/' + i.id,
        0,
        SYSUTCDATETIME()
    FROM inserted AS i
    LEFT JOIN deleted AS d ON d.id = i.id
    WHERE i.priority = N'Urgent'
      AND (d.id IS NULL OR ISNULL(d.priority, N'') <> N'Urgent');
END;
GO

/* ========================================================================== */
/* PROGRAMMES — keep wellness_programmes.enrolled in sync with active rows    */
/* ========================================================================== */
CREATE OR ALTER TRIGGER dbo.trg_programme_enrolment_sync
ON dbo.programme_enrolments
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH touched AS (
        SELECT programme_id FROM inserted
        UNION
        SELECT programme_id FROM deleted
    )
    UPDATE wp
    SET
        enrolled = (
            SELECT COUNT(*)
            FROM dbo.programme_enrolments pe
            WHERE pe.programme_id = wp.id
              AND pe.status = N'Active'
        ),
        last_updated = SYSUTCDATETIME()
    FROM dbo.wellness_programmes AS wp
    INNER JOIN touched AS t ON t.programme_id = wp.id;

    /* Capacity guard: reject if Active enrolments exceed capacity */
    IF EXISTS (
        SELECT 1
        FROM dbo.wellness_programmes wp
        INNER JOIN (
            SELECT programme_id FROM inserted
            UNION
            SELECT programme_id FROM deleted
        ) AS t ON t.programme_id = wp.id
        WHERE wp.capacity IS NOT NULL
          AND COALESCE(wp.enrolled, 0) > wp.capacity
    )
    BEGIN
        THROW 56010, 'Programme capacity exceeded — enrolment rejected by trigger.', 1;
    END
END;
GO

/* ========================================================================== */
/* BILLING — audit payment inserts and status changes                         */
/* ========================================================================== */
CREATE OR ALTER TRIGGER dbo.trg_payments_audit
ON dbo.payments
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.audit_logs (
        user_id, action, entity_type, entity_id, result_status, details, created_at
    )
    SELECT
        i.user_id,
        N'PAYMENT_INSERT',
        N'PAYMENT',
        i.id,
        N'SUCCESS',
        LEFT(CONCAT(
            N'amount=', CONVERT(VARCHAR(20), i.amount),
            N' ', i.currency,
            N'; status=', i.status,
            N'; by=', SUSER_SNAME()
        ), 1000),
        SYSUTCDATETIME()
    FROM inserted AS i
    WHERE NOT EXISTS (SELECT 1 FROM deleted AS d WHERE d.id = i.id);

    INSERT INTO dbo.audit_logs (
        user_id, action, entity_type, entity_id, result_status, details, created_at
    )
    SELECT
        i.user_id,
        N'PAYMENT_STATUS_CHANGE',
        N'PAYMENT',
        i.id,
        N'SUCCESS',
        LEFT(CONCAT(
            N'status ', d.status, N'->', i.status,
            N'; amount=', CONVERT(VARCHAR(20), i.amount),
            N'; by=', SUSER_SNAME()
        ), 1000),
        SYSUTCDATETIME()
    FROM inserted AS i
    INNER JOIN deleted AS d ON d.id = i.id
    WHERE ISNULL(d.status, N'') <> ISNULL(i.status, N'');
END;
GO

PRINT 'Script 15 domain triggers created (all set-based).';
PRINT 'Note: trg_meal_plans_version_bump updates meal_plans (nested depth OK).';
GO
