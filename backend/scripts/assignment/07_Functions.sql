/*
================================================================================
BioFit — Script 07: Scalar function fn_CalculateBMI
================================================================================
Part E | WHAT: Body Mass Index from height (cm) and weight (kg)
         WHY:  health_profiles stores height/weight; reusable in reports
         HOW:  deterministic scalar; NULL-safe; no side effects
================================================================================
*/

USE biofit;
GO

CREATE OR ALTER FUNCTION dbo.fn_CalculateBMI (
    @height_cm DECIMAL(6,2),
    @weight_kg DECIMAL(6,2)
)
RETURNS DECIMAL(6,2)
WITH SCHEMABINDING
AS
BEGIN
    DECLARE @bmi DECIMAL(6,2);

    IF @height_cm IS NULL OR @weight_kg IS NULL OR @height_cm <= 0 OR @weight_kg <= 0
        RETURN NULL;

    SET @bmi = CAST(@weight_kg / POWER(@height_cm / 100.0, 2) AS DECIMAL(6,2));
    RETURN @bmi;
END;
GO

PRINT 'fn_CalculateBMI created.';
PRINT 'Quick test (requires execution):';
PRINT '  SELECT dbo.fn_CalculateBMI(170, 68);  -- expected ~23.53';
GO

-- Demo SELECT (capture output for report — requires execution)
SELECT
    dbo.fn_CalculateBMI(170.00, 68.00) AS bmi_example_170cm_68kg,
    dbo.fn_CalculateBMI(NULL, 68.00)   AS bmi_null_height,
    dbo.fn_CalculateBMI(165.00, 68.50) AS bmi_asha_seed;
GO
