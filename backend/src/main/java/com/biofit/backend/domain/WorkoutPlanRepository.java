package com.biofit.backend.domain;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlanEntity, String> {
    List<WorkoutPlanEntity> findByClientUserId(Long clientUserId);
    Optional<WorkoutPlanEntity> findFirstByClientUserIdAndStatusIgnoreCaseOrderByUpdatedAtDesc(Long clientUserId, String status);
}
