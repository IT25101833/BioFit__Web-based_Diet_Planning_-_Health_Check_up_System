package com.biofit.backend.health;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthAssessmentRepository extends JpaRepository<HealthAssessment, Long> {
    List<HealthAssessment> findByUserIdOrderByAssessedAtDesc(Long userId);

    List<HealthAssessment> findByUserIdInOrderByAssessedAtDesc(Collection<Long> userIds);

    Optional<HealthAssessment> findFirstByUserIdOrderByAssessedAtDesc(Long userId);
}
