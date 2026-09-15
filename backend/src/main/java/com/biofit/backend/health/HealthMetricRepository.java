package com.biofit.backend.health;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthMetricRepository extends JpaRepository<HealthMetric, Long> {
    List<HealthMetric> findByUserIdOrderByRecordedAtDesc(Long userId);

    List<HealthMetric> findByUserIdAndMetricTypeOrderByRecordedAtDesc(Long userId, String metricType);
}
