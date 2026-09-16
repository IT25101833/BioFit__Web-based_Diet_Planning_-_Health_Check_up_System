package com.biofit.backend.domain;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffAvailabilityRepository extends JpaRepository<StaffAvailabilityEntity, String> {
    List<StaffAvailabilityEntity> findByProfessionalIdOrderByCreatedAtAsc(String professionalId);

    List<StaffAvailabilityEntity> findByProfessionalIdAndKindIgnoreCase(String professionalId, String kind);

    List<StaffAvailabilityEntity> findByProfessionalIdAndSpecificDate(String professionalId, LocalDate date);
}
