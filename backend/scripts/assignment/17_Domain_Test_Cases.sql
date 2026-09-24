/*
================================================================================
BioFit — Script 17: Domain routine test cases
================================================================================
Success + failure demos for scripts 13–16. Capture grids for the report.
Requires assignment sample users from script 05 (asgn.*@biofit.demo).
================================================================================
*/

USE biofit;
GO

SET NOCOUNT ON;

DECLARE @c1 BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.client1@biofit.demo');
DECLARE @coach BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.coach@biofit.demo');
DECLARE @outId VARCHAR(40);
DECLARE @outBig BIGINT;
DECLARE @status VARCHAR(40);

PRINT '===== D01 Nutrition: sp_AssignMealPlan SUCCESS =====';
BEGIN TRY
    EXEC dbo.sp_AssignMealPlan
        @ClientUserId = @c1,
        @PlanName = N'Assignment High-Protein Plan',
        @Goal = N'Muscle support',
        @StartDate = '2026-10-01',
        @EndDate = '2026-12-31',
        @NewMealPlanId = @outId OUTPUT;
    PRINT 'D01 meal_plan_id = ' + COALESCE(@outId, N'(null)');
END TRY
BEGIN CATCH
    PRINT 'D01 UNEXPECTED FAILURE: ' + ERROR_MESSAGE();
END CATCH
GO

PRINT '===== D02 Nutrition: version bump trigger =====';
DECLARE @mp VARCHAR(40) = (
    SELECT TOP 1 id FROM dbo.meal_plans
    WHERE name = N'Assignment High-Protein Plan'
    ORDER BY created_at DESC
);
DECLARE @v1 INT = (SELECT version_no FROM dbo.meal_plans WHERE id = @mp);
UPDATE dbo.meal_plans
SET goal = N'Muscle support + recovery (v-bump demo)'
WHERE id = @mp;
DECLARE @v2 INT = (SELECT version_no FROM dbo.meal_plans WHERE id = @mp);
PRINT 'D02 version before=' + COALESCE(CONVERT(VARCHAR(12), @v1), N'?')
    + N' after=' + COALESCE(CONVERT(VARCHAR(12), @v2), N'?');
GO

PRINT '===== D03 Healthcare: sp_RaiseHealthRiskAlert SUCCESS =====';
DECLARE @c1 BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.client1@biofit.demo');
DECLARE @outBig BIGINT;
BEGIN TRY
    EXEC dbo.sp_RaiseHealthRiskAlert
        @ClientUserId = @c1,
        @Title = N'Elevated resting HR watch',
        @Priority = N'High',
        @Reason = N'Sample assignment alert',
        @Guidance = N'Repeat vitals in 7 days',
        @AssignedAdvisor = N'Dr. Assignment',
        @NewAlertId = @outBig OUTPUT;
    PRINT 'D03 alert_id = ' + COALESCE(CONVERT(VARCHAR(20), @outBig), N'(null)');
END TRY
BEGIN CATCH
    PRINT 'D03 UNEXPECTED FAILURE: ' + ERROR_MESSAGE();
END CATCH
GO

PRINT '===== D04 Healthcare: invalid priority FAILURE =====';
DECLARE @c1 BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.client1@biofit.demo');
DECLARE @outBig BIGINT;
BEGIN TRY
    EXEC dbo.sp_RaiseHealthRiskAlert
        @ClientUserId = @c1,
        @Title = N'Bad priority',
        @Priority = N'SuperUrgent',
        @NewAlertId = @outBig OUTPUT;
    PRINT 'D04 UNEXPECTED SUCCESS';
END TRY
BEGIN CATCH
    PRINT 'D04 EXPECTED FAILURE: ' + ERROR_MESSAGE();
END CATCH
GO

PRINT '===== D05 Fitness: sp_AddExerciseToWorkoutPlan =====';
DECLARE @plan VARCHAR(40) = (SELECT TOP 1 id FROM dbo.workout_plans ORDER BY created_at);
DECLARE @ex VARCHAR(40) = (SELECT TOP 1 id FROM dbo.exercises ORDER BY created_at);
BEGIN TRY
    IF @plan IS NULL OR @ex IS NULL
        PRINT 'D05 SKIP — no workout_plans/exercises sample rows';
    ELSE
        EXEC dbo.sp_AddExerciseToWorkoutPlan
            @WorkoutPlanId = @plan,
            @ExerciseId = @ex,
            @SequenceNo = 99,
            @DayLabel = N'Day A',
            @SetsLabel = N'3',
            @RepsLabel = N'10';
END TRY
BEGIN CATCH
    PRINT 'D05 note: ' + ERROR_MESSAGE();
END CATCH
GO

PRINT '===== D06 Support: sp_OpenSupportTicket + Urgent notify trigger =====';
DECLARE @c1 BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.client1@biofit.demo');
DECLARE @outId VARCHAR(40);
BEGIN TRY
    EXEC dbo.sp_OpenSupportTicket
        @ClientUserId = @c1,
        @Subject = N'Cannot access meal plan PDF',
        @Category = N'Technical',
        @Priority = N'Urgent',
        @AssignedTo = N'CX Assignment Desk',
        @NewTicketId = @outId OUTPUT;
    PRINT 'D06 ticket_id = ' + COALESCE(@outId, N'(null)');

    SELECT TOP 3 id, type, title, created_at
    FROM dbo.notifications
    WHERE type = N'TICKET_URGENT'
    ORDER BY created_at DESC;
END TRY
BEGIN CATCH
    PRINT 'D06 UNEXPECTED FAILURE: ' + ERROR_MESSAGE();
END CATCH
GO

PRINT '===== D07 Programmes: sp_EnrolClientInProgramme =====';
DECLARE @c1 BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.client1@biofit.demo');
DECLARE @prog VARCHAR(40) = (
    SELECT TOP 1 id FROM dbo.wellness_programmes
    WHERE status = N'Active'
    ORDER BY created_at
);
DECLARE @outId VARCHAR(40);
BEGIN TRY
    IF @prog IS NULL
        PRINT 'D07 SKIP — no Active programme';
    ELSE
        EXEC dbo.sp_EnrolClientInProgramme
            @ProgrammeId = @prog,
            @ClientUserId = @c1,
            @NewEnrolmentId = @outId OUTPUT;
    PRINT 'D07 enrolment_id = ' + COALESCE(@outId, N'(null)');
END TRY
BEGIN CATCH
    PRINT 'D07 note (may already enrolled): ' + ERROR_MESSAGE();
END CATCH
GO

PRINT '===== D08 Billing: sp_RecordPayment SUCCESS =====';
DECLARE @c1 BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.client1@biofit.demo');
DECLARE @outId VARCHAR(40);
BEGIN TRY
    EXEC dbo.sp_RecordPayment
        @UserId = @c1,
        @Amount = 2500.00,
        @Status = N'Paid',
        @MethodLabel = N'Card',
        @Description = N'Assignment domain payment demo',
        @NewPaymentId = @outId OUTPUT;
    PRINT 'D08 payment_id = ' + COALESCE(@outId, N'(null)');
END TRY
BEGIN CATCH
    PRINT 'D08 UNEXPECTED FAILURE: ' + ERROR_MESSAGE();
END CATCH
GO

PRINT '===== D09 Billing: negative amount FAILURE =====';
DECLARE @c1 BIGINT = (SELECT id FROM dbo.users WHERE email = N'asgn.client1@biofit.demo');
DECLARE @outId VARCHAR(40);
BEGIN TRY
    EXEC dbo.sp_RecordPayment
        @UserId = @c1,
        @Amount = -50.00,
        @NewPaymentId = @outId OUTPUT;
    PRINT 'D09 UNEXPECTED SUCCESS';
END TRY
BEGIN CATCH
    PRINT 'D09 EXPECTED FAILURE: ' + ERROR_MESSAGE();
END CATCH
GO

PRINT '===== D10 Appointment: sp_CancelAppointment =====';
DECLARE @apt VARCHAR(40) = (
    SELECT TOP 1 id FROM dbo.appointments
    WHERE status = N'Upcoming'
    ORDER BY created_at DESC
);
DECLARE @status VARCHAR(40);
BEGIN TRY
    IF @apt IS NULL
        PRINT 'D10 SKIP — no Upcoming appointment';
    ELSE
        EXEC dbo.sp_CancelAppointment
            @AppointmentId = @apt,
            @CancelReason = N'Assignment cancel demo',
            @ResultStatus = @status OUTPUT;
    PRINT 'D10 result = ' + COALESCE(@status, N'(null)');
END TRY
BEGIN CATCH
    PRINT 'D10 note: ' + ERROR_MESSAGE();
END CATCH
GO

PRINT '===== D11 Function smoke checks =====';
SELECT
    dbo.fn_ClassifyBMICategory(dbo.fn_CalculateBMI(170, 68)) AS bmi_category,
    dbo.fn_OpenSupportTicketCount(NULL) AS open_tickets,
    dbo.fn_OpenSupportTicketCount(N'Urgent') AS urgent_tickets,
    dbo.fn_ClientTotalPaid((SELECT id FROM dbo.users WHERE email = N'asgn.client1@biofit.demo')) AS client1_paid;
GO

PRINT '===== D12 View smoke checks =====';
SELECT TOP 5 * FROM dbo.vw_SupportQueueBoard ORDER BY age_hours DESC;
SELECT TOP 5 * FROM dbo.vw_ProgrammeFillRate ORDER BY fill_percent DESC;
SELECT TOP 5 * FROM dbo.vw_HealthcareRiskBoard ORDER BY date_raised DESC;
GO

PRINT '===== D13 Recent domain audit actions =====';
SELECT TOP 20 action, entity_type, entity_id, LEFT(details, 120) AS details, created_at
FROM dbo.audit_logs
WHERE action LIKE N'APPOINTMENT%'
   OR action LIKE N'MEAL_PLAN%'
   OR action LIKE N'HEALTH_ALERT%'
   OR action LIKE N'FITNESS%'
   OR action LIKE N'SUPPORT%'
   OR action LIKE N'PAYMENT%'
ORDER BY created_at DESC;
GO

PRINT 'Script 17 domain tests complete.';
GO
