package com.biofit.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "payments")
@Getter
@Setter
public class PaymentEntity {
    @Id
    private String id;
    private Long userId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String methodLabel;
    private String description;
    private Instant paidAt;
    private Instant createdAt = Instant.now();
}
