package com.biofit.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "programme_enrolments")
@Getter
@Setter
public class ProgrammeEnrolment {
    @Id
    private String id;
    private String programmeId;
    private Long clientUserId;
    private String clientId;
    private String clientName;
    private LocalDate enrolledDate;
    private String status;
    private String coachName;
    private String nutritionName;
    private Integer progress;
    private String periodLabel;
    private Instant createdAt = Instant.now();
}
