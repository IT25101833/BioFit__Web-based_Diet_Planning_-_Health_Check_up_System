package com.biofit.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "dietary_restrictions")
@Getter
@Setter
public class DietaryRestrictionEntity {
    @Id
    private String id;
    private Long clientUserId;
    private String clientId;
    private String clientName;
    private String name;
    private String type;
    private String status;
    private LocalDate dateRecorded;
    private LocalDate lastReviewed;
    private String mealPlan;
    @Column(length = 2000)
    private String notes;
    @Column(length = 2000)
    private String mealPlanImpact;
    private String source;
    @Column(name = "is_protected")
    private boolean protectedFlag;
    private Instant createdAt = Instant.now();
}
