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
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "safety_validations")
@Getter
@Setter
public class SafetyValidation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "client_code", length = 40)
    private String clientCode;

    @Column(name = "client_name", length = 120)
    private String clientName;

    @Column(name = "reference_type", length = 40)
    private String referenceType;

    @Column(name = "reference_id", length = 80)
    private String referenceId;

    @Column(name = "result_status", nullable = false, length = 40)
    private String resultStatus;

    /** Matches NVARCHAR(MAX) on SQL Server and large text on H2. */
    @JdbcTypeCode(SqlTypes.LONG32NVARCHAR)
    @Column(name = "warnings_json")
    private String warningsJson;

    @Column(name = "advisor_notes", length = 2000)
    private String advisorNotes;

    @Column(name = "validated_by_user_id")
    private Long validatedByUserId;

    @Column(name = "validated_by_name", length = 120)
    private String validatedByName;

    @Column(name = "validated_at", nullable = false)
    private Instant validatedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (validatedAt == null) validatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
