package com.biofit.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "medical_review_requests")
@Getter
@Setter
public class MedicalReviewRequest {

    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_BOOKED = "BOOKED";
    public static final String STATUS_CANCELLED = "CANCELLED";

    public static final String SOURCE_HEALTH_ASSESSMENT = "HEALTH_ASSESSMENT";
    public static final String SOURCE_HEALTH_RISK_ALERT = "HEALTH_RISK_ALERT";
    public static final String SOURCE_MEDICAL_RECORD = "MEDICAL_RECORD";

    @Id
    private String id;

    @Column(nullable = false)
    private Long clientUserId;

    @Column(nullable = false)
    private Long advisorUserId;

    private String advisorName;

    @Column(nullable = false)
    private LocalDate reviewDate;

    @Column(nullable = false, length = 40)
    private String sourceType;

    @Column(nullable = false, length = 80)
    private String sourceRecordId;

    @Column(nullable = false, length = 40)
    private String status;

    private String appointmentId;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();
}
