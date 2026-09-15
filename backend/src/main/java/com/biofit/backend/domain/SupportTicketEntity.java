package com.biofit.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
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
    @Lob
    private String messagesJson;
    @Lob
    private String activityJson;
    private String waitingOn;
    @Lob
    private String escalationJson;
    @Lob
    private String resolutionJson;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();
}
