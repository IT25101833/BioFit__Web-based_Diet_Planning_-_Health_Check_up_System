-- Align support ticket JSON columns with entity mapping (LONG32NVARCHAR / VARCHAR).
-- Older H2 migrations used CLOB; Hibernate validate rejects CLOB vs varchar(max).

ALTER TABLE support_tickets ALTER COLUMN messages_json SET DATA TYPE VARCHAR(1000000);
ALTER TABLE support_tickets ALTER COLUMN activity_json SET DATA TYPE VARCHAR(1000000);
ALTER TABLE support_tickets ALTER COLUMN escalation_json SET DATA TYPE VARCHAR(1000000);
ALTER TABLE support_tickets ALTER COLUMN resolution_json SET DATA TYPE VARCHAR(1000000);

ALTER TABLE safety_validations ALTER COLUMN warnings_json SET DATA TYPE VARCHAR(1000000);
