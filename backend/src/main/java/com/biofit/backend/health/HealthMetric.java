package com.biofit.backend.health;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "health_metrics")
@Getter
@Setter
public class HealthMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "metric_type", nullable = false, length = 40)
    private String metricType;

    @Column(name = "value_num", precision = 10, scale = 2)
    private BigDecimal valueNum;

    @Column(name = "value_text", length = 120)
    private String valueText;

    @Column(length = 24)
    private String unit;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    @Column(nullable = false, length = 40)
    private String source = "CLIENT";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
