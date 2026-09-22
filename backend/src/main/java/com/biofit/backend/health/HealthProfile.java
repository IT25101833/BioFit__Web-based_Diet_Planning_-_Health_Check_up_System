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
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "health_profiles")
@Getter
@Setter
public class HealthProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "height_cm", precision = 6, scale = 2)
    private BigDecimal heightCm;

    @Column(name = "weight_kg", precision = 6, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "blood_type", length = 8)
    private String bloodType;

    @Column(name = "activity_level", length = 40)
    private String activityLevel;

    @Column(name = "medical_record_status", nullable = false, length = 40)
    private String medicalRecordStatus = "Up to date";

    @Column(name = "safety_notes", length = 2000)
    private String safetyNotes;

    @Column(name = "client_code", length = 40)
    private String clientCode;

    @Column(name = "programme_label", length = 200)
    private String programmeLabel;

    @Column(name = "assigned_coach", length = 120)
    private String assignedCoach;

    @Column(name = "assigned_nutrition", length = 120)
    private String assignedNutrition;

    @Column(name = "next_checkup_at")
    private Instant nextCheckupAt;

    @Lob
    @Column(name = "record_json")
    private String recordJson;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "deleted_by_user_id")
    private Long deletedByUserId;

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
