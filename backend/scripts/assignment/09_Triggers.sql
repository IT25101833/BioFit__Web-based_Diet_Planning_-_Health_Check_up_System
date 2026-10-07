/*
================================================================================
BioFit — Script 09: Trigger trg_health_metrics_audit
================================================================================
Part F | AFTER INSERT/UPDATE/DELETE on health_metrics
         Set-based (handles multi-row statements)
         Writes summary rows to existing audit_logs
================================================================================
*/

USE biofit;
GO

CREATE OR ALTER TRIGGER dbo.trg_health_metrics_audit
ON dbo.health_metrics
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    /* INSERT rows present in inserted, not in deleted */
    INSERT INTO dbo.audit_logs (
        user_id, action, entity_type, entity_id, result_status,
        details, created_at
    )
    SELECT
        i.user_id,
        N'HEALTH_METRIC_INSERT',
        N'HEALTH_METRIC',
        CAST(i.id AS VARCHAR(100)),
        N'SUCCESS',
        CONCAT(
            N'type=', i.metric_type,
            N'; value=', COALESCE(CONVERT(VARCHAR(40), i.value_num), i.value_text),
            N'; unit=', COALESCE(i.unit, N''),
            N'; by=', SUSER_SNAME()
        ),
        SYSUTCDATETIME()
    FROM inserted AS i
    WHERE NOT EXISTS (SELECT 1 FROM deleted AS d WHERE d.id = i.id);

    /* DELETE rows present in deleted, not in inserted */
    INSERT INTO dbo.audit_logs (
        user_id, action, entity_type, entity_id, result_status,
        details, created_at
    )
    SELECT
        d.user_id,
        N'HEALTH_METRIC_DELETE',
        N'HEALTH_METRIC',
        CAST(d.id AS VARCHAR(100)),
        N'SUCCESS',
        CONCAT(
            N'type=', d.metric_type,
            N'; old_value=', COALESCE(CONVERT(VARCHAR(40), d.value_num), d.value_text),
            N'; by=', SUSER_SNAME()
        ),
        SYSUTCDATETIME()
    FROM deleted AS d
    WHERE NOT EXISTS (SELECT 1 FROM inserted AS i WHERE i.id = d.id);

    /* UPDATE rows in both */
    INSERT INTO dbo.audit_logs (
        user_id, action, entity_type, entity_id, result_status,
        details, created_at
    )
    SELECT
        i.user_id,
        N'HEALTH_METRIC_UPDATE',
        N'HEALTH_METRIC',
        CAST(i.id AS VARCHAR(100)),
        N'SUCCESS',
        CONCAT(
            N'type=', i.metric_type,
            N'; old=', COALESCE(CONVERT(VARCHAR(40), d.value_num), d.value_text),
            N'; new=', COALESCE(CONVERT(VARCHAR(40), i.value_num), i.value_text),
            N'; by=', SUSER_SNAME()
        ),
        SYSUTCDATETIME()
    FROM inserted AS i
    INNER JOIN deleted AS d ON d.id = i.id;
END;
GO

PRINT 'trg_health_metrics_audit created (set-based).';
PRINT 'Test multi-row behaviour in script 11 (requires execution).';
GO
