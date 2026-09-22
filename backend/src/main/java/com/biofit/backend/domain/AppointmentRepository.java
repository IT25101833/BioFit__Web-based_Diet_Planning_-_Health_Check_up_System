package com.biofit.backend.domain;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, String> {
    List<Appointment> findByClientUserIdOrderByAppointmentDateAsc(Long clientUserId);

    List<Appointment> findByAudienceIgnoreCaseOrderByAppointmentDateAsc(String audience);

    List<Appointment> findByProfessionalRoleContainingIgnoreCaseOrderByAppointmentDateAsc(String role);

    List<Appointment> findByProfessionalUserIdOrderByAppointmentDateDesc(Long professionalUserId);

    List<Appointment> findByAppointmentDateAndProfessionalUserIdIsNotNull(LocalDate appointmentDate);

    boolean existsByProfessionalUserIdAndClientUserIdAndStatusNotIgnoreCase(
            Long professionalUserId, Long clientUserId, String status);

    boolean existsByProfessionalUserIdAndClientUserIdAndAttendanceIgnoreCase(
            Long professionalUserId, Long clientUserId, String attendance);

    Optional<Appointment> findByIdAndClientUserId(String id, Long clientUserId);
}
