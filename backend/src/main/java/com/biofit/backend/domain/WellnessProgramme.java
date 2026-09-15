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
@Table(name = "wellness_programmes")
@Getter
@Setter
public class WellnessProgramme {
    @Id
    private String id;
    private String name;
    private String type;
    @Column(length = 2000)
    private String description;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer durationWeeks;
    private Integer capacity;
    private Integer enrolled;
    private String coachName;
    private String nutritionName;
    private String medicalName;
    @Column(length = 1000)
    private String goals;
    @Column(length = 1000)
    private String includedServices;
    @Column(length = 2000)
    private String notes;
    private Integer progress;
    private Instant lastUpdated = Instant.now();
    private Instant createdAt = Instant.now();
}
