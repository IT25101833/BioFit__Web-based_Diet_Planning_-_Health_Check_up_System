/*
================================================================================
BioFit — Script 08: Stored procedure sp_CreateAppointment
================================================================================
Part E | Validates users, rejects conflicts, transactional insert
================================================================================
*/

USE biofit;
GO

CREATE OR ALTER PROCEDURE dbo.sp_CreateAppointment
    @ClientUserId         BIGINT,
    @ProfessionalUserId   BIGINT,
    @ServiceType          VARCHAR(120),
    @AppointmentDate      DATE,
    @AppointmentTime      VARCHAR(40),
    @Duration             VARCHAR(40) = N'45 min',
    @Programme            VARCHAR(200) = NULL,
    @Notes                VARCHAR(2000) = NULL,
    @Location             VARCHAR(200) = N'VitalLife Wellness Centre',
    @NewAppointmentId     VARCHAR(40) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ClientName NVARCHAR(200);
    DECLARE @ClientCode VARCHAR(40);
    DECLARE @ProfessionalName NVARCHAR(200);
    DECLARE @ProfessionalRole VARCHAR(80);
    DECLARE @BookingRef VARCHAR(80);

    BEGIN TRY
        /* ---- Validation (before transaction where possible) ---- */
        IF @ClientUserId IS NULL OR @ProfessionalUserId IS NULL
            THROW 50001, 'ClientUserId and ProfessionalUserId are required.', 1;

        IF @ServiceType IS NULL OR LTRIM(RTRIM(@ServiceType)) = N''
            THROW 50002, 'ServiceType is required.', 1;

        IF @AppointmentDate IS NULL OR @AppointmentTime IS NULL
            THROW 50003, 'AppointmentDate and AppointmentTime are required.', 1;

        IF @AppointmentDate < CAST(SYSUTCDATETIME() AS DATE)
            THROW 50004, 'AppointmentDate cannot be in the past.', 1;

        IF NOT EXISTS (
            SELECT 1 FROM dbo.users
            WHERE id = @ClientUserId AND status = N'ACTIVE' AND deleted_at IS NULL
        )
            THROW 50005, 'Client user not found or inactive.', 1;

        IF NOT EXISTS (
            SELECT 1 FROM dbo.users
            WHERE id = @ProfessionalUserId AND status = N'ACTIVE' AND deleted_at IS NULL
        )
            THROW 50006, 'Professional user not found or inactive.', 1;

        /* Conflict: same professional, same date+time, not Cancelled */
        IF EXISTS (
            SELECT 1
            FROM dbo.appointments
            WHERE professional_user_id = @ProfessionalUserId
              AND appointment_date = @AppointmentDate
              AND appointment_time = @AppointmentTime
              AND status <> N'Cancelled'
        )
            THROW 50007, 'Professional already booked for this date and time.', 1;

        /* Conflict: same client, same date+time */
        IF EXISTS (
            SELECT 1
            FROM dbo.appointments
            WHERE client_user_id = @ClientUserId
              AND appointment_date = @AppointmentDate
              AND appointment_time = @AppointmentTime
              AND status <> N'Cancelled'
        )
            THROW 50008, 'Client already has an appointment at this date and time.', 1;

        SELECT
            @ClientName = first_name + N' ' + last_name,
            @ClientCode = N'BF-C' + CAST(id AS VARCHAR(20))
        FROM dbo.users WHERE id = @ClientUserId;

        SELECT
            @ProfessionalName = first_name + N' ' + last_name,
            @ProfessionalRole = COALESCE(specialization, N'Staff')
        FROM dbo.users WHERE id = @ProfessionalUserId;

        SET @NewAppointmentId = N'apt-' + REPLACE(CONVERT(VARCHAR(36), NEWID()), N'-', N'');
        IF LEN(@NewAppointmentId) > 40
            SET @NewAppointmentId = LEFT(@NewAppointmentId, 40);

        SET @BookingRef = N'BF-APT-' + RIGHT(REPLACE(CONVERT(VARCHAR(36), NEWID()), N'-', N''), 10);

        BEGIN TRANSACTION;

        INSERT INTO dbo.appointments (
            id, client_user_id, client_id, client_name, service_type,
            professional, professional_user_id, professional_role, programme,
            appointment_date, appointment_time, duration, status,
            booking_reference, notes, location, audience, created_at, updated_at
        )
        VALUES (
            @NewAppointmentId, @ClientUserId, @ClientCode, @ClientName, @ServiceType,
            @ProfessionalName, @ProfessionalUserId, @ProfessionalRole, @Programme,
            @AppointmentDate, @AppointmentTime, @Duration, N'Upcoming',
            @BookingRef, @Notes, @Location, N'CLIENT', SYSUTCDATETIME(), SYSUTCDATETIME()
        );

        COMMIT TRANSACTION;

        SELECT
            @NewAppointmentId AS appointment_id,
            @BookingRef AS booking_reference,
            N'CREATED' AS result_status;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH
END;
GO

PRINT 'sp_CreateAppointment created.';
PRINT 'Demo calls are in script 11_Test_Cases.sql (requires execution).';
GO
