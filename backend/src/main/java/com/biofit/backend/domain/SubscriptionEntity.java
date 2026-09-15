package com.biofit.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
public class SubscriptionEntity {
    @Id
    private String id;
    private Long userId;
    private String planName;
    private String status;
    private String priceLabel;
    private LocalDate renewsOn;
    private Instant createdAt = Instant.now();
}
