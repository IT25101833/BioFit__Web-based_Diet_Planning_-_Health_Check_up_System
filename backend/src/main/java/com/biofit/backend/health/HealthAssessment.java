package com.biofit.backend.health;

import jakarta.persistence.Lob;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "health_assessments")
@Getter
@Setter
public class HealthAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String summary;

    @Column(name = "assessment_type", nullable = false, length = 80)
    private String assessmentType = "General";

    @Column(nullable = false, length = 32)
    private String status = "COMPLETED";

    @Column(name = "assessed_at", nullable = false)
    private Instant assessedAt;

    @Column(name = "next_review_at")
    private Instant nextReviewAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "client_code", length = 40)
    private String clientCode;

    @Column(name = "advisor_name", length = 120)
    private String advisorName;

    @Column(name = "follow_up_required")
    private Boolean followUpRequired = false;

    @Column(name = "related_alert_id", length = 40)
    private String relatedAlertId;

    @Lob
    @Column(name = "observations_json")
    private String observationsJson;

    @Lob
    @Column(name = "professional_notes")
    private String professionalNotes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
