ALTER TABLE plan_access_requests ADD COLUMN reason VARCHAR(500);
UPDATE plan_access_requests SET resource_type = 'WORKOUT_PLAN' WHERE resource_type = 'FITNESS_PLAN';
