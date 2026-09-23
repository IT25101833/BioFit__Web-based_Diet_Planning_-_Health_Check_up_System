/*
================================================================================
BioFit — Script 02: Additive DDL
- workout_plan_exercises (M:N associative entity)
- subscriptions.amount (optional DECIMAL for aggregation)
================================================================================
Part A / B | Re-runnable
================================================================================
*/

USE biofit;
GO

/* -------------------------------------------------------------------------- */
/* 1) Junction table: workout_plans M:N exercises                             */
/* -------------------------------------------------------------------------- */
IF OBJECT_ID(N'dbo.workout_plan_exercises', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.workout_plan_exercises (
        workout_plan_id VARCHAR(40)  NOT NULL,
        exercise_id     VARCHAR(40)  NOT NULL,
        sequence_no     INT          NOT NULL CONSTRAINT DF_wpe_seq DEFAULT (1),
        day_label       VARCHAR(40)  NULL,
        sets_label      VARCHAR(40)  NULL,
        reps_label      VARCHAR(40)  NULL,
        duration_label  VARCHAR(40)  NULL,
        created_at      DATETIME2    NOT NULL CONSTRAINT DF_wpe_created DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_workout_plan_exercises
            PRIMARY KEY (workout_plan_id, exercise_id, sequence_no),
        CONSTRAINT FK_wpe_plan
            FOREIGN KEY (workout_plan_id) REFERENCES dbo.workout_plans (id) ON DELETE CASCADE,
        CONSTRAINT FK_wpe_exercise
            FOREIGN KEY (exercise_id) REFERENCES dbo.exercises (id) ON DELETE CASCADE,
        CONSTRAINT CK_wpe_sequence_positive CHECK (sequence_no >= 1)
    );
    PRINT 'Created dbo.workout_plan_exercises';
END
ELSE
    PRINT 'dbo.workout_plan_exercises already exists — skipped';
GO

/* -------------------------------------------------------------------------- */
/* 2) Additive column: subscriptions.amount                                   */
/*    App may ignore this; assignment queries use it for SUM/AVG.             */
/* -------------------------------------------------------------------------- */
IF COL_LENGTH('dbo.subscriptions', 'amount') IS NULL
BEGIN
    ALTER TABLE dbo.subscriptions
        ADD amount DECIMAL(10,2) NULL;
    PRINT 'Added subscriptions.amount';
END
ELSE
    PRINT 'subscriptions.amount already exists — skipped';
GO

/* Backfill amount from common demo price labels where possible */
UPDATE dbo.subscriptions
SET amount = 12500.00
WHERE amount IS NULL
  AND (price_label LIKE N'%12,500%' OR price_label LIKE N'%12500%');

UPDATE dbo.subscriptions
SET amount = 8500.00
WHERE amount IS NULL
  AND (price_label LIKE N'%8,500%' OR price_label LIKE N'%8500%');

UPDATE dbo.subscriptions
SET amount = 15000.00
WHERE amount IS NULL
  AND (price_label LIKE N'%15,000%' OR price_label LIKE N'%15000%');
GO

PRINT 'Script 02 complete.';
GO
