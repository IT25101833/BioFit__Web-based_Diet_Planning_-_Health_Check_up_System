package com.biofit.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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
    /** Large text — avoid @Lob (breaks SQL Server deletes). Matches VARCHAR(MAX) / H2 VARCHAR. */
    @JdbcTypeCode(SqlTypes.LONG32NVARCHAR)
    private String messagesJson;
    @JdbcTypeCode(SqlTypes.LONG32NVARCHAR)
    private String activityJson;
    private String waitingOn;
    @JdbcTypeCode(SqlTypes.LONG32NVARCHAR)
    private String escalationJson;
    @JdbcTypeCode(SqlTypes.LONG32NVARCHAR)
    private String resolutionJson;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();
}
