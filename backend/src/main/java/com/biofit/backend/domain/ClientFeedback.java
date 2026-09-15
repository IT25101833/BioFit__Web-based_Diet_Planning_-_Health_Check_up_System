package com.biofit.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "client_feedback")
@Getter
@Setter
public class ClientFeedback {
    @Id
    private String id;
    private Long clientUserId;
    private String clientId;
    private String clientName;
    private String type;
    private String subject;
    @Lob
    private String message;
    private String status;
    private String assignedTo;
    private String relatedService;
    @Lob
    private String notesJson;
    @Lob
    private String complaintLifecycleJson;
    private Instant submittedAt = Instant.now();
    private Instant updatedAt = Instant.now();
}