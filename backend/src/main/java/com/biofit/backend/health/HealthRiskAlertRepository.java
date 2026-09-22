package com.biofit.backend.health;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthRiskAlertRepository extends JpaRepository<HealthRiskAlert, Long> {
    List<HealthRiskAlert> findByUserIdOrderByDateRaisedDesc(Long userId);

    List<HealthRiskAlert> findByUserIdInAndActiveTrueOrderByDateRaisedDesc(Collection<Long> userIds);

    long countByUserIdAndStatusIgnoreCase(Long userId, String status);
}
