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
@Table(name = "workout_plans")
@Getter
@Setter
public class WorkoutPlanEntity {
    @Id
    private String id;
    private String name;
    private Long clientUserId;
    private String clientId;
    private String clientName;
    private String programme;
    @Column(length = 500)
    private String goal;
    private String difficulty;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer sessionsPerWeek;
    private String sessionDuration;
    @Column(length = 2000)
    private String description;
    private String currentWeek;
    private Integer totalWeeks;
    private Integer progress;
    private String status;
    @Lob
    private String planJson;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();
}
