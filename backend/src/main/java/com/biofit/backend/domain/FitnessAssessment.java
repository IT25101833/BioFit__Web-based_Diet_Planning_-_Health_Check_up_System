package com.biofit.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "fitness_assessments")
@Getter
@Setter
public class FitnessAssessment {
    @Id
    private String id;
    private Long clientUserId;
    private String clientId;
    private String clientName;
    private Long coachUserId;
    private String coachName;
    private LocalDate assessmentDate;
    private String type;
    private String status;
    private LocalDate nextAssessment;
    @Lob
    private String payloadJson;
    private Instant createdAt = Instant.now();
}