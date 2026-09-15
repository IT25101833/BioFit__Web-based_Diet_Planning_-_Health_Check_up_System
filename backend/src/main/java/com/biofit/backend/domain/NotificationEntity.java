package com.biofit.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "notifications")
@Getter
@Setter
public class NotificationEntity {
    @Id
    private String id;
    private Long userId;
    private String audience;
    private String type;
    private String title;
    @Column(length = 2000)
    private String body;
    private String link;
    @Column(name = "is_read")
    private boolean readFlag;
    private Instant createdAt = Instant.now();
}
