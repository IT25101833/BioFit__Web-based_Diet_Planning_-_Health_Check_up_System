package com.biofit.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "staff_schedules")
@Getter
@Setter
public class StaffScheduleEntity {
    @Id
    private String id;
    private LocalDate scheduleDate;
    private String startTime;
    private String endTime;
    private String staffId;
    private String staffName;
    private String roleLabel;
    private String serviceLabel;
    private String clientName;
    private String programme;
    private String status;
    private String notes;
    private Instant createdAt = Instant.now();
}
