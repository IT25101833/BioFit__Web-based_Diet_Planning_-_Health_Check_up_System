package com.biofit.backend.health;

import jakarta.persistence.Lob;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "health_risk_alerts")
@Getter
@Setter
public class HealthRiskAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 40)
    private String status = "Monitoring";

    @Column(length = 2000)
    private String guidance;

    @Column(name = "date_raised", nullable = false)
    private Instant dateRaised;

    @Column(name = "follow_up_at")
    private Instant followUpAt;

    @Column(name = "client_code", length = 40)
    private String clientCode;

    @Column(name = "client_name", length = 120)
    private String clientName;

    @Column(length = 40)
    private String priority = "Medium";

    @Column(length = 2000)
    private String reason;

    @Column(name = "assigned_advisor", length = 120)
    private String assignedAdvisor;

    @Column(name = "related_assessment_id", length = 40)
    private String relatedAssessmentId;

    @Lob
    @Column(name = "details_json")
    private String detailsJson;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
