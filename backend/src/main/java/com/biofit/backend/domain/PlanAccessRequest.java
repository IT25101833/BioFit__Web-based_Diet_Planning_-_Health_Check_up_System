package com.biofit.backend.domain;

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
@Table(name = "plan_access_requests")
@Getter
@Setter
public class PlanAccessRequest {

    public static final String WORKOUT_PLAN = "WORKOUT_PLAN";
    /** Earlier name for a workout-plan request. Stored values are migrated to WORKOUT_PLAN. */
    public static final String FITNESS_PLAN = WORKOUT_PLAN;
    public static final String NUTRITION_PLAN = "NUTRITION_PLAN";

    public static final String PENDING = "PENDING";
    public static final String APPROVED = "APPROVED";
    public static final String REJECTED = "REJECTED";
    public static final String REVOKED = "REVOKED";
    public static final String CANCELLED = "CANCELLED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_user_id", nullable = false)
    private Long clientUserId;

    @Column(name = "client_code", length = 40)
    private String clientCode;

    @Column(name = "client_name", length = 120)
    private String clientName;

    @Column(name = "advisor_user_id", nullable = false)
    private Long advisorUserId;

    @Column(name = "advisor_name", length = 120)
    private String advisorName;

    @Column(name = "resource_type", nullable = false, length = 40)
    private String resourceType;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt;

    @Column(name = "responded_at")
    private Instant respondedAt;

    @Column(name = "responded_by_user_id")
    private Long respondedByUserId;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(length = 500)
    private String reason;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
        if (requestedAt == null) requestedAt = now;
        if (status == null || status.isBlank()) status = PENDING;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
