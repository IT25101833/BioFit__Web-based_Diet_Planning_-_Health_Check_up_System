package com.biofit.backend.health;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthRiskAlertRepository extends JpaRepository<HealthRiskAlert, Long> {
    List<HealthRiskAlert> findByUserIdOrderByDateRaisedDesc(Long userId);

    long countByUserIdAndStatusIgnoreCase(Long userId, String status);
}
