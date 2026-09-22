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
@Table(name = "appointments")
@Getter
@Setter
public class Appointment {
    @Id
    private String id;
    private Long clientUserId;
    private String clientId;
    private String clientName;
    private String serviceType;
    private String professional;
    private Long professionalUserId;
    private String professionalRole;
    private String programme;
    private LocalDate appointmentDate;
    private String appointmentTime;
    private String duration;
    private String status;
    private String bookingReference;
    @Column(length = 2000)
    private String notes;
    private String location;
    private String audience;
    @Column(length = 40)
    private String attendance;
    @Column(length = 500)
    private String attendanceNote;
    private Instant attendanceMarkedAt;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();
}
