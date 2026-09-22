package com.biofit.backend.health;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SafetyValidationRepository extends JpaRepository<SafetyValidation, Long> {
    List<SafetyValidation> findAllByOrderByValidatedAtDesc();

    List<SafetyValidation> findByUserIdOrderByValidatedAtDesc(Long userId);
}
