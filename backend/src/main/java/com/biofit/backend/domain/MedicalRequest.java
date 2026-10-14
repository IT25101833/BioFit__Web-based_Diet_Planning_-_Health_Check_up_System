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
import java.time.LocalDate;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "medical_requests")
@Getter
@Setter
public class MedicalRequest {

    public static final String PENDING = "PENDING";
    public static final String ACCEPTED = "ACCEPTED";
    /** Attended is the clinical-access status set by Mark as Attended. ACCEPTED remains valid for earlier rows. */
    public static final String ATTENDED = "ATTENDED";
    public static final String REJECTED = "REJECTED";
    public static final String IN_PROGRESS = "IN_PROGRESS";
    public static final String COMPLETED = "COMPLETED";
    public static final String CANCELLED = "CANCELLED";

    /** Statuses that allow the assigned Medical Advisor to open this client's medical information. */
    public static final List<String> CLINICAL_ACCESS = List.of(ACCEPTED, ATTENDED, IN_PROGRESS, COMPLETED);
    //abstraction: the grantsClinicalAccess method is abstracted and can be used to check if a status grants clinical access
    public static boolean grantsClinicalAccess(String status) {
        return status != null && CLINICAL_ACCESS.contains(status);
    }
    //Encapsulation: private final variables are encapsulated and can only be accessed within the class
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_user_id", nullable = false)
    private Long clientId;

    @Column(name = "client_code", length = 40)
    private String clientCode;

    @Column(name = "client_name", length = 120)
    private String clientName;

    @Column(name = "medical_advisor_id", nullable = false)
    private Long medicalAdvisorId;

    @Column(name = "advisor_name", length = 120)
    private String advisorName;

    @Column(nullable = false, length = 200)
    private String reason;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(name = "preferred_date")
    private LocalDate preferredDate;

    @Column(name = "preferred_time", length = 20)
    private String preferredTime;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt;

    @Column(name = "responded_at")
    private Instant respondedAt;

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
