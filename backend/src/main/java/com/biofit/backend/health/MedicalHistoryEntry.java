package com.biofit.backend.health;

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
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "medical_history_entries")
@Getter
@Setter
public class MedicalHistoryEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "client_code", length = 40)
    private String clientCode;

    @Column(name = "client_name", length = 120)
    private String clientName;

    @Column(name = "record_type", nullable = false, length = 40)
    private String recordType;

    @Column(name = "condition_name", length = 200)
    private String conditionName;

    @Column(name = "allergy_info", length = 500)
    private String allergyInfo;

    @Column(length = 2000)
    private String description;

    @Column(length = 40)
    private String severity;

    @Column(name = "recorded_date")
    private LocalDate recordedDate;

    @Column(nullable = false, length = 20)
    private String status = "Active";

    @Column(name = "created_by_user_id")
    private Long createdByUserId;

    @Column(name = "created_by_name", length = 120)
    private String createdByName;

    @Column(name = "deactivated_at")
    private Instant deactivatedAt;

    @Column(name = "deactivated_by_user_id")
    private Long deactivatedByUserId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (status == null || status.isBlank()) status = "Active";
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
