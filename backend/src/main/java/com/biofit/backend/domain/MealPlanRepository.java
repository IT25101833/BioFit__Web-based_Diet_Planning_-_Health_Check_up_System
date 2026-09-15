package com.biofit.backend.domain;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface MealPlanRepository extends JpaRepository<MealPlanEntity, String> {
    List<MealPlanEntity> findByClientUserId(Long clientUserId);
    Optional<MealPlanEntity> findFirstByClientUserIdAndStatusIgnoreCaseOrderByUpdatedAtDesc(Long clientUserId, String status);
}
