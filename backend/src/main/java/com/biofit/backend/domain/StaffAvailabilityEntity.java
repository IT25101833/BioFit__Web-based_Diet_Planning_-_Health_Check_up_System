package com.biofit.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "staff_availability")
@Getter
@Setter
public class StaffAvailabilityEntity {
    @Id
    private String id;
    private String professionalId;
    private Long professionalUserId;
    /** WORKING or BLOCKED */
    private String kind;
    private Integer dayOfWeek;
    private LocalDate specificDate;
    private String startTime;
    private String endTime;
    @Column(length = 200)
    private String reason;
    private Instant createdAt = Instant.now();
}
