/*
================================================================================
BioFit — Script 13: Domain scalar / table-valued functions
================================================================================
One reusable function per management area (plus healthcare category helper).
Additive only. Requires script 07 (fn_CalculateBMI) for BMI category demo.

Speaker map:
  Appointment  -> fn_CountClientUpcomingAppointments
  Nutrition    -> fn_ClientActiveMealPlanCount
  Healthcare   -> fn_ClassifyBMICategory  (+ existing fn_CalculateBMI)
  Fitness      -> fn_WorkoutPlanExerciseCount
  Support      -> fn_OpenSupportTicketCount
  Programmes   -> fn_ProgrammeRemainingCapacity
  Billing      -> fn_ClientTotalPaid
================================================================================
*/

USE biofit;
GO

/* -------------------------------------------------------------------------- */
/* APPOINTMENT MANAGEMENT                                                     */
/* -------------------------------------------------------------------------- */
CREATE OR ALTER FUNCTION dbo.fn_CountClientUpcomingAppointments (
    @ClientUserId BIGINT
)
RETURNS INT
AS
BEGIN
    DECLARE @cnt INT;

    IF @ClientUserId IS NULL
        RETURN NULL;

    SELECT @cnt = COUNT(*)
    FROM dbo.appointments
    WHERE client_user_id = @ClientUserId
      AND status = N'Upcoming'
      AND appointment_date >= CAST(SYSUTCDATETIME() AS DATE);

    RETURN COALESCE(@cnt, 0);
END;
GO

/* -------------------------------------------------------------------------- */
/* NUTRITION MANAGEMENT                                                       */
/* -------------------------------------------------------------------------- */
CREATE OR ALTER FUNCTION dbo.fn_ClientActiveMealPlanCount (
    @ClientUserId BIGINT
)
RETURNS INT
AS
BEGIN
    DECLARE @cnt INT;

    IF @ClientUserId IS NULL
        RETURN NULL;

    SELECT @cnt = COUNT(*)
    FROM dbo.meal_plans
    WHERE client_user_id = @ClientUserId
      AND status = N'Active';

    RETURN COALESCE(@cnt, 0);
END;
GO

/* -------------------------------------------------------------------------- */
/* HEALTHCARE MANAGEMENT                                                      */
/* -------------------------------------------------------------------------- */
CREATE OR ALTER FUNCTION dbo.fn_ClassifyBMICategory (
    @bmi DECIMAL(6,2)
)
RETURNS VARCHAR(40)
WITH SCHEMABINDING
AS
BEGIN
    IF @bmi IS NULL
        RETURN NULL;
    IF @bmi < 18.50
        RETURN N'Underweight';
    IF @bmi < 25.00
        RETURN N'Normal';
    IF @bmi < 30.00
        RETURN N'Overweight';
    RETURN N'Obese';
END;
GO

/* -------------------------------------------------------------------------- */
/* FITNESS MANAGEMENT                                                         */
/* -------------------------------------------------------------------------- */
CREATE OR ALTER FUNCTION dbo.fn_WorkoutPlanExerciseCount (
    @WorkoutPlanId VARCHAR(40)
)
RETURNS INT
AS
BEGIN
    DECLARE @cnt INT;

    IF @WorkoutPlanId IS NULL OR LTRIM(RTRIM(@WorkoutPlanId)) = N''
        RETURN NULL;

    SELECT @cnt = COUNT(*)
    FROM dbo.workout_plan_exercises
    WHERE workout_plan_id = @WorkoutPlanId;

    RETURN COALESCE(@cnt, 0);
END;
GO

/* -------------------------------------------------------------------------- */
/* CUSTOMER SUPPORT MANAGEMENT                                                */
/* -------------------------------------------------------------------------- */
CREATE OR ALTER FUNCTION dbo.fn_OpenSupportTicketCount (
    @Priority VARCHAR(40)  -- pass NULL for all open tickets; else filter by priority
)
RETURNS INT
AS
BEGIN
    DECLARE @cnt INT;

    SELECT @cnt = COUNT(*)
    FROM dbo.support_tickets
    WHERE status IN (N'Open', N'In Progress', N'Waiting')
      AND (@Priority IS NULL OR priority = @Priority);

    RETURN COALESCE(@cnt, 0);
END;
GO

/* -------------------------------------------------------------------------- */
/* WELLNESS PROGRAMME / MANAGER                                               */
/* -------------------------------------------------------------------------- */
CREATE OR ALTER FUNCTION dbo.fn_ProgrammeRemainingCapacity (
    @ProgrammeId VARCHAR(40)
)
RETURNS INT
AS
BEGIN
    DECLARE @capacity INT;
    DECLARE @enrolled INT;

    IF @ProgrammeId IS NULL
        RETURN NULL;

    SELECT
        @capacity = capacity,
        @enrolled = COALESCE(enrolled, 0)
    FROM dbo.wellness_programmes
    WHERE id = @ProgrammeId;

    IF @capacity IS NULL
        RETURN NULL;  -- unlimited / not tracked

    RETURN CASE
        WHEN @capacity - @enrolled < 0 THEN 0
        ELSE @capacity - @enrolled
    END;
END;
GO

/* -------------------------------------------------------------------------- */
/* BILLING / OPS                                                              */
/* -------------------------------------------------------------------------- */
CREATE OR ALTER FUNCTION dbo.fn_ClientTotalPaid (
    @UserId BIGINT
)
RETURNS DECIMAL(12,2)
AS
BEGIN
    DECLARE @total DECIMAL(12,2);

    IF @UserId IS NULL
        RETURN NULL;

    SELECT @total = SUM(amount)
    FROM dbo.payments
    WHERE user_id = @UserId
      AND status = N'Paid';

    RETURN COALESCE(@total, 0.00);
END;
GO

PRINT 'Script 13 domain functions created.';
PRINT 'Quick checks (capture for report):';
PRINT '  SELECT dbo.fn_ClassifyBMICategory(dbo.fn_CalculateBMI(170,68));  -- Normal';
PRINT '  SELECT dbo.fn_OpenSupportTicketCount(NULL);';
PRINT '  SELECT dbo.fn_ClientTotalPaid(id) FROM users WHERE email LIKE ''asgn.client%'';';
GO

/* Demo SELECT — requires execution for screenshots */
SELECT
    dbo.fn_ClassifyBMICategory(dbo.fn_CalculateBMI(170.00, 68.00)) AS bmi_category_example,
    dbo.fn_OpenSupportTicketCount(NULL) AS open_tickets_all,
    dbo.fn_OpenSupportTicketCount(N'High') AS open_tickets_high;
GO
