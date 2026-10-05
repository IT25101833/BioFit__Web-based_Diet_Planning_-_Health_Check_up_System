package com.biofit.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "wallet_topup_requests")
@Getter
@Setter
public class WalletTopUpRequest {

    public static final String PENDING = "PENDING";
    public static final String APPROVED = "APPROVED";
    public static final String REJECTED = "REJECTED";
    public static final String CANCELLED = "CANCELLED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_number", nullable = false, unique = true, length = 40)
    private String requestNumber;

    @Column(name = "client_user_id", nullable = false)
    private Long clientId;

    @Column(name = "client_code", length = 40)
    private String clientCode;

    @Column(name = "client_name", length = 120)
    private String clientName;

    @Column(name = "wallet_id", nullable = false)
    private Long walletId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(length = 500)
    private String note;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "receipt_stored_name", length = 180)
    private String receiptStoredName;

    @Column(name = "receipt_original_name", length = 180)
    private String receiptOriginalName;

    @Column(name = "receipt_content_type", length = 80)
    private String receiptContentType;

    @Column(name = "receipt_size")
    private Long receiptSize;

    @Column(name = "receipt_uploaded_at")
    private Instant receiptUploadedAt;

    @Column(name = "receipt_uploaded_by")
    private Long receiptUploadedBy;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_by_name", length = 120)
    private String approvedByName;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "rejected_by")
    private Long rejectedBy;

    @Column(name = "rejected_by_name", length = 120)
    private String rejectedByName;

    @Column(name = "rejected_at")
    private Instant rejectedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
