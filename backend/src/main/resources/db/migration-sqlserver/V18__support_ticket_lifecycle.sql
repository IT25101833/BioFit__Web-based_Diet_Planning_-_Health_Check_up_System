IF COL_LENGTH('support_tickets', 'waiting_since') IS NULL
    ALTER TABLE support_tickets ADD waiting_since DATETIME2 NULL;
IF COL_LENGTH('notifications', 'ticket_id') IS NULL
    ALTER TABLE notifications ADD ticket_id VARCHAR(40) NULL;
IF COL_LENGTH('notifications', 'event_type') IS NULL
    ALTER TABLE notifications ADD event_type VARCHAR(40) NULL;

UPDATE support_tickets SET status = 'In Progress'
WHERE LOWER(REPLACE(REPLACE(status, '_', ' '), '-', ' ')) IN ('in progress', 'started');
UPDATE support_tickets SET status = 'Pending Client Reply'
WHERE LOWER(status) LIKE '%pending%';
UPDATE support_tickets SET status = 'Assigned' WHERE LOWER(status) = 'assigned';
UPDATE support_tickets SET status = 'Escalated' WHERE LOWER(status) = 'escalated';
UPDATE support_tickets SET status = 'Resolved' WHERE LOWER(status) = 'resolved';
UPDATE support_tickets SET status = 'Closed' WHERE LOWER(status) = 'closed';
UPDATE support_tickets SET status = 'Open' WHERE LOWER(status) = 'open';
UPDATE support_tickets SET status = 'Open'
WHERE status IS NULL
   OR status NOT IN (
        'Open', 'Assigned', 'In Progress', 'Pending Client Reply', 'Escalated', 'Resolved', 'Closed');

UPDATE support_tickets SET priority = 'Low' WHERE LOWER(priority) = 'low';
UPDATE support_tickets SET priority = 'High' WHERE LOWER(priority) = 'high';
UPDATE support_tickets SET priority = 'Urgent' WHERE LOWER(priority) = 'urgent';
UPDATE support_tickets SET priority = 'Medium'
WHERE priority IS NULL OR LOWER(priority) IN ('medium', 'normal');
UPDATE support_tickets SET priority = 'Medium'
WHERE priority NOT IN ('Low', 'Medium', 'High', 'Urgent');

UPDATE support_tickets SET waiting_on = 'Client' WHERE LOWER(waiting_on) = 'client';
UPDATE support_tickets SET waiting_on = 'Specialist' WHERE LOWER(waiting_on) = 'specialist';
UPDATE support_tickets SET waiting_on = 'Support'
WHERE waiting_on IS NULL OR waiting_on NOT IN ('Support', 'Client', 'Specialist');

UPDATE support_tickets
SET waiting_since = COALESCE(created_at, SYSUTCDATETIME())
WHERE waiting_since IS NULL;

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'ck_support_ticket_status')
    ALTER TABLE support_tickets ADD CONSTRAINT ck_support_ticket_status
        CHECK (status IN ('Open', 'Assigned', 'In Progress', 'Pending Client Reply', 'Escalated', 'Resolved', 'Closed'));
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'ck_support_ticket_priority')
    ALTER TABLE support_tickets ADD CONSTRAINT ck_support_ticket_priority
        CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent'));
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'ck_support_ticket_waiting_on')
    ALTER TABLE support_tickets ADD CONSTRAINT ck_support_ticket_waiting_on
        CHECK (waiting_on IN ('Support', 'Client', 'Specialist'));
