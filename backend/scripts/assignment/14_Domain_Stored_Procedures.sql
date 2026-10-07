/*
================================================================================
BioFit — Script 14: Domain stored procedures
================================================================================
Transactional routines with validation — one (or more) per management area.
Keeps existing sp_CreateAppointment (script 08).

Speaker map:
  Appointment  -> sp_CancelAppointment          (+ existing sp_CreateAppointment)
  Nutrition    -> sp_AssignMealPlan
  Healthcare   -> sp_RaiseHealthRiskAlert
  Fitness      -> sp_AddExerciseToWorkoutPlan
  Support      -> sp_OpenSupportTicket
  Programmes   -> sp_EnrolClientInProgramme
  Billing      -> sp_RecordPayment
================================================================================
*/

USE biofit;
GO

/* ========================================================================== */
/* APPOINTMENT MANAGEMENT — cancel with reason + audit-friendly update        */
/* ========================================================================== */
CREATE OR ALTER PROCEDURE dbo.sp_CancelAppointment
    @AppointmentId   VARCHAR(40),
    @CancelReason    VARCHAR(500) = NULL,
    @ResultStatus    VARCHAR(40) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        IF @AppointmentId IS NULL OR LTRIM(RTRIM(@AppointmentId)) = N''
            THROW 51001, 'AppointmentId is required.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.appointments WHERE id = @AppointmentId)
            THROW 51002, 'Appointment not found.', 1;

        IF EXISTS (
            SELECT 1 FROM dbo.appointments
            WHERE id = @AppointmentId AND status = N'Cancelled'
        )
            THROW 51003, 'Appointment is already cancelled.', 1;

        IF EXISTS (
            SELECT 1 FROM dbo.appointments
            WHERE id = @AppointmentId AND status = N'Completed'
        )
            THROW 51004, 'Completed appointments cannot be cancelled.', 1;

        BEGIN TRANSACTION;

        UPDATE dbo.appointments
        SET
            status = N'Cancelled',
            notes = CASE
                WHEN @CancelReason IS NULL OR LTRIM(RTRIM(@CancelReason)) = N'' THEN notes
                WHEN notes IS NULL OR notes = N'' THEN N'Cancelled: ' + @CancelReason
                ELSE LEFT(notes + N' | Cancelled: ' + @CancelReason, 2000)
            END,
            updated_at = SYSUTCDATETIME()
        WHERE id = @AppointmentId;

        SET @ResultStatus = N'CANCELLED';
        COMMIT TRANSACTION;

        SELECT id AS appointment_id, status, booking_reference, @ResultStatus AS result_status
        FROM dbo.appointments
        WHERE id = @AppointmentId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SET @ResultStatus = N'FAILED';
        THROW;
    END CATCH
END;
GO

/* ========================================================================== */
/* NUTRITION MANAGEMENT — create / assign an active meal plan                 */
/* ========================================================================== */
CREATE OR ALTER PROCEDURE dbo.sp_AssignMealPlan
    @ClientUserId   BIGINT,
    @PlanName       VARCHAR(200),
    @Goal           VARCHAR(500) = NULL,
    @Programme      VARCHAR(200) = NULL,
    @StartDate      DATE = NULL,
    @EndDate        DATE = NULL,
    @Description    VARCHAR(2000) = NULL,
    @NewMealPlanId  VARCHAR(40) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ClientName NVARCHAR(200);
    DECLARE @ClientCode VARCHAR(40);

    BEGIN TRY
        IF @ClientUserId IS NULL
            THROW 52001, 'ClientUserId is required.', 1;

        IF @PlanName IS NULL OR LTRIM(RTRIM(@PlanName)) = N''
            THROW 52002, 'PlanName is required.', 1;

        IF @StartDate IS NOT NULL AND @EndDate IS NOT NULL AND @EndDate < @StartDate
            THROW 52003, 'EndDate cannot be before StartDate.', 1;

        IF NOT EXISTS (
            SELECT 1 FROM dbo.users
            WHERE id = @ClientUserId AND status = N'ACTIVE' AND deleted_at IS NULL
        )
            THROW 52004, 'Client user not found or inactive.', 1;

        SELECT
            @ClientName = first_name + N' ' + last_name,
            @ClientCode = N'BF-C' + CAST(id AS VARCHAR(20))
        FROM dbo.users WHERE id = @ClientUserId;

        SET @NewMealPlanId = N'mp-' + REPLACE(CONVERT(VARCHAR(36), NEWID()), N'-', N'');
        IF LEN(@NewMealPlanId) > 40
            SET @NewMealPlanId = LEFT(@NewMealPlanId, 40);

        BEGIN TRANSACTION;

        INSERT INTO dbo.meal_plans (
            id, name, client_user_id, client_id, client_name, programme, goal,
            description, start_date, end_date, status, progress, version_no,
            created_at, updated_at
        )
        VALUES (
            @NewMealPlanId, @PlanName, @ClientUserId, @ClientCode, @ClientName,
            @Programme, @Goal, @Description, @StartDate, @EndDate,
            N'Active', 0, 1, SYSUTCDATETIME(), SYSUTCDATETIME()
        );

        COMMIT TRANSACTION;

        SELECT
            @NewMealPlanId AS meal_plan_id,
            @ClientName AS client_name,
            dbo.fn_ClientActiveMealPlanCount(@ClientUserId) AS active_meal_plans,
            N'ASSIGNED' AS result_status;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

/* ========================================================================== */
/* HEALTHCARE MANAGEMENT — raise a risk alert for a client                    */
/* ========================================================================== */
CREATE OR ALTER PROCEDURE dbo.sp_RaiseHealthRiskAlert
    @ClientUserId     BIGINT,
    @Title            VARCHAR(200),
    @Priority         VARCHAR(40) = N'Medium',
    @Reason           VARCHAR(2000) = NULL,
    @Guidance         VARCHAR(2000) = NULL,
    @AssignedAdvisor  VARCHAR(120) = NULL,
    @NewAlertId       BIGINT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ClientName NVARCHAR(200);
    DECLARE @ClientCode VARCHAR(40);

    BEGIN TRY
        IF @ClientUserId IS NULL
            THROW 53001, 'ClientUserId is required.', 1;

        IF @Title IS NULL OR LTRIM(RTRIM(@Title)) = N''
            THROW 53002, 'Title is required.', 1;

        IF @Priority NOT IN (N'Low', N'Medium', N'High', N'Critical')
            THROW 53003, 'Priority must be Low, Medium, High, or Critical.', 1;

        IF NOT EXISTS (
            SELECT 1 FROM dbo.users
            WHERE id = @ClientUserId AND status = N'ACTIVE' AND deleted_at IS NULL
        )
            THROW 53004, 'Client user not found or inactive.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.health_profiles WHERE user_id = @ClientUserId)
            THROW 53005, 'Client has no health profile — create profile first.', 1;

        SELECT
            @ClientName = first_name + N' ' + last_name,
            @ClientCode = N'BF-C' + CAST(id AS VARCHAR(20))
        FROM dbo.users WHERE id = @ClientUserId;

        BEGIN TRANSACTION;

        INSERT INTO dbo.health_risk_alerts (
            user_id, title, status, guidance, date_raised, created_at, updated_at,
            client_code, client_name, priority, reason, assigned_advisor
        )
        VALUES (
            @ClientUserId, @Title, N'Monitoring', @Guidance, SYSUTCDATETIME(),
            SYSUTCDATETIME(), SYSUTCDATETIME(),
            @ClientCode, @ClientName, @Priority, @Reason, @AssignedAdvisor
        );

        SET @NewAlertId = SCOPE_IDENTITY();
        COMMIT TRANSACTION;

        SELECT
            @NewAlertId AS alert_id,
            @ClientName AS client_name,
            @Priority AS priority,
            N'RAISED' AS result_status;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

/* ========================================================================== */
/* FITNESS MANAGEMENT — link exercise into workout plan (junction)            */
/* ========================================================================== */
CREATE OR ALTER PROCEDURE dbo.sp_AddExerciseToWorkoutPlan
    @WorkoutPlanId  VARCHAR(40),
    @ExerciseId     VARCHAR(40),
    @SequenceNo     INT = 1,
    @DayLabel       VARCHAR(40) = NULL,
    @SetsLabel      VARCHAR(40) = NULL,
    @RepsLabel      VARCHAR(40) = NULL,
    @DurationLabel  VARCHAR(40) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        IF @WorkoutPlanId IS NULL OR @ExerciseId IS NULL
            THROW 54001, 'WorkoutPlanId and ExerciseId are required.', 1;

        IF @SequenceNo IS NULL OR @SequenceNo < 1
            THROW 54002, 'SequenceNo must be >= 1.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.workout_plans WHERE id = @WorkoutPlanId)
            THROW 54003, 'Workout plan not found.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.exercises WHERE id = @ExerciseId)
            THROW 54004, 'Exercise not found.', 1;

        IF EXISTS (
            SELECT 1 FROM dbo.workout_plan_exercises
            WHERE workout_plan_id = @WorkoutPlanId
              AND exercise_id = @ExerciseId
              AND sequence_no = @SequenceNo
        )
            THROW 54005, 'This exercise is already linked at that sequence number.', 1;

        BEGIN TRANSACTION;

        INSERT INTO dbo.workout_plan_exercises (
            workout_plan_id, exercise_id, sequence_no, day_label,
            sets_label, reps_label, duration_label, created_at
        )
        VALUES (
            @WorkoutPlanId, @ExerciseId, @SequenceNo, @DayLabel,
            @SetsLabel, @RepsLabel, @DurationLabel, SYSUTCDATETIME()
        );

        UPDATE dbo.workout_plans
        SET updated_at = SYSUTCDATETIME()
        WHERE id = @WorkoutPlanId;

        COMMIT TRANSACTION;

        SELECT
            @WorkoutPlanId AS workout_plan_id,
            @ExerciseId AS exercise_id,
            @SequenceNo AS sequence_no,
            dbo.fn_WorkoutPlanExerciseCount(@WorkoutPlanId) AS exercise_count,
            N'LINKED' AS result_status;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

/* ========================================================================== */
/* CUSTOMER SUPPORT MANAGEMENT — open a ticket                                */
/* ========================================================================== */
CREATE OR ALTER PROCEDURE dbo.sp_OpenSupportTicket
    @ClientUserId    BIGINT,
    @Subject         VARCHAR(300),
    @Category        VARCHAR(80) = N'General',
    @Priority        VARCHAR(40) = N'Medium',
    @RelatedService  VARCHAR(200) = NULL,
    @AssignedTo      VARCHAR(120) = NULL,
    @NewTicketId     VARCHAR(40) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ClientName NVARCHAR(200);
    DECLARE @ClientCode VARCHAR(40);

    BEGIN TRY
        IF @ClientUserId IS NULL
            THROW 55001, 'ClientUserId is required.', 1;

        IF @Subject IS NULL OR LTRIM(RTRIM(@Subject)) = N''
            THROW 55002, 'Subject is required.', 1;

        IF @Priority NOT IN (N'Low', N'Medium', N'High', N'Urgent')
            THROW 55003, 'Priority must be Low, Medium, High, or Urgent.', 1;

        IF NOT EXISTS (
            SELECT 1 FROM dbo.users
            WHERE id = @ClientUserId AND status = N'ACTIVE' AND deleted_at IS NULL
        )
            THROW 55004, 'Client user not found or inactive.', 1;

        SELECT
            @ClientName = first_name + N' ' + last_name,
            @ClientCode = N'BF-C' + CAST(id AS VARCHAR(20))
        FROM dbo.users WHERE id = @ClientUserId;

        SET @NewTicketId = N'tkt-' + REPLACE(CONVERT(VARCHAR(36), NEWID()), N'-', N'');
        IF LEN(@NewTicketId) > 40
            SET @NewTicketId = LEFT(@NewTicketId, 40);

        BEGIN TRANSACTION;

        INSERT INTO dbo.support_tickets (
            id, client_user_id, client_id, client_name, subject, category,
            priority, status, assigned_to, related_service, created_at, updated_at
        )
        VALUES (
            @NewTicketId, @ClientUserId, @ClientCode, @ClientName, @Subject, @Category,
            @Priority, N'Open', @AssignedTo, @RelatedService,
            SYSUTCDATETIME(), SYSUTCDATETIME()
        );

        COMMIT TRANSACTION;

        SELECT
            @NewTicketId AS ticket_id,
            @Priority AS priority,
            dbo.fn_OpenSupportTicketCount(NULL) AS open_ticket_count,
            N'OPENED' AS result_status;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

/* ========================================================================== */
/* PROGRAMME / MANAGER — enrol client with capacity check                     */
/* ========================================================================== */
CREATE OR ALTER PROCEDURE dbo.sp_EnrolClientInProgramme
    @ProgrammeId     VARCHAR(40),
    @ClientUserId    BIGINT,
    @NewEnrolmentId  VARCHAR(40) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ClientName NVARCHAR(200);
    DECLARE @ClientCode VARCHAR(40);
    DECLARE @Remaining INT;
    DECLARE @ProgStatus VARCHAR(40);

    BEGIN TRY
        IF @ProgrammeId IS NULL OR @ClientUserId IS NULL
            THROW 56001, 'ProgrammeId and ClientUserId are required.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.wellness_programmes WHERE id = @ProgrammeId)
            THROW 56002, 'Programme not found.', 1;

        SELECT @ProgStatus = status
        FROM dbo.wellness_programmes
        WHERE id = @ProgrammeId;

        IF @ProgStatus <> N'Active'
            THROW 56003, 'Only Active programmes accept enrolments.', 1;

        IF NOT EXISTS (
            SELECT 1 FROM dbo.users
            WHERE id = @ClientUserId AND status = N'ACTIVE' AND deleted_at IS NULL
        )
            THROW 56004, 'Client user not found or inactive.', 1;

        IF EXISTS (
            SELECT 1 FROM dbo.programme_enrolments
            WHERE programme_id = @ProgrammeId
              AND client_user_id = @ClientUserId
              AND status = N'Active'
        )
            THROW 56005, 'Client is already actively enrolled in this programme.', 1;

        SET @Remaining = dbo.fn_ProgrammeRemainingCapacity(@ProgrammeId);
        IF @Remaining IS NOT NULL AND @Remaining <= 0
            THROW 56006, 'Programme is at full capacity.', 1;

        SELECT
            @ClientName = first_name + N' ' + last_name,
            @ClientCode = N'BF-C' + CAST(id AS VARCHAR(20))
        FROM dbo.users WHERE id = @ClientUserId;

        SET @NewEnrolmentId = N'enr-' + REPLACE(CONVERT(VARCHAR(36), NEWID()), N'-', N'');
        IF LEN(@NewEnrolmentId) > 40
            SET @NewEnrolmentId = LEFT(@NewEnrolmentId, 40);

        BEGIN TRANSACTION;

        INSERT INTO dbo.programme_enrolments (
            id, programme_id, client_user_id, client_id, client_name,
            enrolled_date, status, progress, created_at
        )
        VALUES (
            @NewEnrolmentId, @ProgrammeId, @ClientUserId, @ClientCode, @ClientName,
            CAST(SYSUTCDATETIME() AS DATE), N'Active', 0, SYSUTCDATETIME()
        );

        /* enrolled counter is maintained by trg_programme_enrolment_sync (script 15) */
        COMMIT TRANSACTION;

        SELECT
            @NewEnrolmentId AS enrolment_id,
            @ProgrammeId AS programme_id,
            @ClientName AS client_name,
            dbo.fn_ProgrammeRemainingCapacity(@ProgrammeId) AS remaining_capacity,
            N'ENROLLED' AS result_status;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

/* ========================================================================== */
/* BILLING / OPS — record a payment                                           */
/* ========================================================================== */
CREATE OR ALTER PROCEDURE dbo.sp_RecordPayment
    @UserId         BIGINT,
    @Amount         DECIMAL(10,2),
    @Currency       VARCHAR(8) = N'LKR',
    @Status         VARCHAR(40) = N'Paid',
    @MethodLabel    VARCHAR(80) = N'Card',
    @Description    VARCHAR(300) = NULL,
    @NewPaymentId   VARCHAR(40) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        IF @UserId IS NULL
            THROW 57001, 'UserId is required.', 1;

        IF @Amount IS NULL OR @Amount <= 0
            THROW 57002, 'Amount must be greater than zero.', 1;

        IF @Status NOT IN (N'Paid', N'Pending', N'Failed', N'Refunded')
            THROW 57003, 'Invalid payment status.', 1;

        IF NOT EXISTS (
            SELECT 1 FROM dbo.users
            WHERE id = @UserId AND deleted_at IS NULL
        )
            THROW 57004, 'User not found.', 1;

        SET @NewPaymentId = N'pay-' + REPLACE(CONVERT(VARCHAR(36), NEWID()), N'-', N'');
        IF LEN(@NewPaymentId) > 40
            SET @NewPaymentId = LEFT(@NewPaymentId, 40);

        BEGIN TRANSACTION;

        INSERT INTO dbo.payments (
            id, user_id, amount, currency, status, method_label, description,
            paid_at, created_at
        )
        VALUES (
            @NewPaymentId, @UserId, @Amount, @Currency, @Status, @MethodLabel,
            @Description,
            CASE WHEN @Status = N'Paid' THEN SYSUTCDATETIME() ELSE NULL END,
            SYSUTCDATETIME()
        );

        COMMIT TRANSACTION;

        SELECT
            @NewPaymentId AS payment_id,
            @Amount AS amount,
            @Status AS status,
            dbo.fn_ClientTotalPaid(@UserId) AS client_total_paid,
            N'RECORDED' AS result_status;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

PRINT 'Script 14 domain stored procedures created.';
PRINT 'Run script 17 for demo success/failure cases.';
GO
