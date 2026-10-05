IF COL_LENGTH('plan_access_requests', 'reason') IS NULL
    ALTER TABLE plan_access_requests ADD reason NVARCHAR(500) NULL;
UPDATE plan_access_requests SET resource_type = 'WORKOUT_PLAN' WHERE resource_type = 'FITNESS_PLAN';
