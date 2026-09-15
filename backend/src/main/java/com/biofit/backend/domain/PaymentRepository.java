package com.biofit.backend.domain;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PaymentRepository extends JpaRepository<PaymentEntity, String> {
    List<PaymentEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
}
