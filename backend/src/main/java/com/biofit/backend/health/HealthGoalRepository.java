package com.biofit.backend.health;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthGoalRepository extends JpaRepository<HealthGoal, Long> {
    List<HealthGoal> findByUserIdOrderByUpdatedAtDesc(Long userId);
}
