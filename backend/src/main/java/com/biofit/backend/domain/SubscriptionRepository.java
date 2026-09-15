package com.biofit.backend.domain;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SubscriptionRepository extends JpaRepository<SubscriptionEntity, String> {
    List<SubscriptionEntity> findByUserId(Long userId);
}
