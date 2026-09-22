ALTER TABLE appointments ADD COLUMN attendance VARCHAR(40);
ALTER TABLE appointments ADD COLUMN attendance_note VARCHAR(500);
ALTER TABLE appointments ADD COLUMN attendance_marked_at TIMESTAMP;
