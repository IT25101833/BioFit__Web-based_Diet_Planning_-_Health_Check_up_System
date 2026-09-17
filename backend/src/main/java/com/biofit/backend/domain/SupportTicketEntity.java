package com.biofit.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "support_tickets")
@Getter
@Setter
public class SupportTicketEntity {
    @Id
    private String id;
    private Long clientUserId;
    private String clientId;
    private String clientName;
    private String subject;
    private String category;
    private String priority;
    private String status;
    private String assignedTo;
    private String relatedService;
    /** Stored as VARCHAR(MAX) — do not use @Lob (breaks SQL Server deletes). */
    @Column(columnDefinition = "varchar(max)")
    private String messagesJson;
    @Column(columnDefinition = "varchar(max)")
    private String activityJson;
    private String waitingOn;
    @Column(columnDefinition = "varchar(max)")
    private String escalationJson;
    @Column(columnDefinition = "varchar(max)")
    private String resolutionJson;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();
}
