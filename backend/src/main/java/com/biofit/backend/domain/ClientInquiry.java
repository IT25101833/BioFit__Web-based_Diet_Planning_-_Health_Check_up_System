package com.biofit.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "client_inquiries")
@Getter
@Setter
public class ClientInquiry {
    @Id
    private String id;
    private Long clientUserId;
    private String clientId;
    private String clientName;
    private String email;
    private String phone;
    private String subject;
    private String category;
    @Lob
    private String message;
    private String status;
    private String assignedTo;
    @Lob
    private String responsesJson;
    private Instant receivedAt = Instant.now();
    private Instant createdAt = Instant.now();
}