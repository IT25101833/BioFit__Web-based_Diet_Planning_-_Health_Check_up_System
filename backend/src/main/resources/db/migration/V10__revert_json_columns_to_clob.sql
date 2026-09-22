-- Revert V9 VARCHAR change: Hibernate LONG32NVARCHAR maps to NCLOB/CLOB on H2.

ALTER TABLE support_tickets ALTER COLUMN messages_json SET DATA TYPE CLOB;
ALTER TABLE support_tickets ALTER COLUMN activity_json SET DATA TYPE CLOB;
ALTER TABLE support_tickets ALTER COLUMN escalation_json SET DATA TYPE CLOB;
ALTER TABLE support_tickets ALTER COLUMN resolution_json SET DATA TYPE CLOB;

ALTER TABLE safety_validations ALTER COLUMN warnings_json SET DATA TYPE CLOB;
