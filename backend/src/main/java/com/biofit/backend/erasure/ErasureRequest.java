package com.biofit.backend.erasure;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "erasure_requests")
@Getter
@Setter
public class ErasureRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "record_type", nullable = false, length = 40)
    private String recordType;

    @Column(name = "record_id", nullable = false)
    private Long recordId;

    @Column(name = "client_user_id", nullable = false)
    private Long clientUserId;

    @Column(name = "legal_basis", nullable = false, length = 500)
    private String legalBasis;

    @Column(nullable = false, length = 2000)
    private String reason;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "requested_by_user_id", nullable = false)
    private Long requestedByUserId;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt;

    @Column(name = "reviewed_by_user_id")
    private Long reviewedByUserId;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "review_notes", length = 2000)
    private String reviewNotes;

    @Column(name = "executed_by_user_id")
    private Long executedByUserId;

    @Column(name = "executed_at")
    private Instant executedAt;

    @PrePersist
    void onCreate() {
        if (requestedAt == null) {
            requestedAt = Instant.now();
        }
        if (status == null || status.isBlank()) {
            status = "PENDING";
        }
    }
}
