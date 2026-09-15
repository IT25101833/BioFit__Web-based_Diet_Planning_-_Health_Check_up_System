package com.biofit.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "exercises")
@Getter
@Setter
public class ExerciseEntity {
    @Id
    private String id;
    private String name;
    private String category;
    private String difficulty;
    private String targetArea;
    private String equipment;
    @Lob
    private String instructions;
    private String safetyNotes;
    private String setsLabel;
    private String repsLabel;
    private String durationLabel;
    private String restLabel;
    private Instant createdAt = Instant.now();
}
