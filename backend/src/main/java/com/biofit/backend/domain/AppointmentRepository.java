package com.biofit.backend.domain;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AppointmentRepository extends JpaRepository<Appointment, String> {
    List<Appointment> findByClientUserIdOrderByAppointmentDateAsc(Long clientUserId);
    List<Appointment> findByAudienceIgnoreCaseOrderByAppointmentDateAsc(String audience);
    List<Appointment> findByProfessionalRoleContainingIgnoreCaseOrderByAppointmentDateAsc(String role);
    List<Appointment> findByProfessionalUserIdOrderByAppointmentDateDesc(Long professionalUserId);
    boolean existsByProfessionalUserIdAndClientUserIdAndStatusNotIgnoreCase(
            Long professionalUserId, Long clientUserId, String status);
    Optional<Appointment> findByIdAndClientUserId(String id, Long clientUserId);
}
