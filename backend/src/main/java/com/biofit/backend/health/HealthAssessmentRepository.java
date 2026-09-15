package com.biofit.backend.health;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthAssessmentRepository extends JpaRepository<HealthAssessment, Long> {
    List<HealthAssessment> findByUserIdOrderByAssessedAtDesc(Long userId);

    Optional<HealthAssessment> findFirstByUserIdOrderByAssessedAtDesc(Long userId);
}
