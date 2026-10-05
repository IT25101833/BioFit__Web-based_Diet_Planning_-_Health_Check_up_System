package com.biofit.backend.domain;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalRequestRepository extends JpaRepository<MedicalRequest, Long> {

    List<MedicalRequest> findByClientIdOrderByRequestedAtDesc(Long clientId);

    List<MedicalRequest> findByMedicalAdvisorIdOrderByRequestedAtDesc(Long medicalAdvisorId);

    List<MedicalRequest> findAllByOrderByRequestedAtDesc();

    List<MedicalRequest> findByMedicalAdvisorIdAndStatusInOrderByRequestedAtDesc(
            Long medicalAdvisorId, Collection<String> statuses);

    List<MedicalRequest> findByStatusInOrderByRequestedAtDesc(Collection<String> statuses);

    boolean existsByMedicalAdvisorIdAndClientIdAndStatusIn(
            Long medicalAdvisorId, Long clientId, Collection<String> statuses);

    boolean existsByClientIdAndMedicalAdvisorIdAndStatusIn(
            Long clientId, Long medicalAdvisorId, Collection<String> statuses);
}
