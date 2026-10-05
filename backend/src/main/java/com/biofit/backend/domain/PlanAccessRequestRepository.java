package com.biofit.backend.domain;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanAccessRequestRepository extends JpaRepository<PlanAccessRequest, Long> {

    Optional<PlanAccessRequest> findFirstByAdvisorUserIdAndClientUserIdAndResourceTypeOrderByRequestedAtDescIdDesc(
            Long advisorUserId, Long clientUserId, String resourceType);

    List<PlanAccessRequest> findByResourceTypeOrderByRequestedAtDesc(String resourceType);

    List<PlanAccessRequest> findByClientUserIdOrderByRequestedAtDesc(Long clientUserId);
}
