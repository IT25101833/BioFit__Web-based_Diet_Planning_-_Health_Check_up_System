package com.biofit.backend.domain;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
//Abstraction: the MedicalRequestRepository interface is abstracted and can be used to find medical requests
public interface MedicalRequestRepository extends JpaRepository<MedicalRequest, Long> {//Inheritance: the MedicalRequestRepository interface inherits from the JpaRepository interface

    List<MedicalRequest> findByClientIdOrderByRequestedAtDesc(Long clientId);//abstraction: the findByClientIdOrderByRequestedAtDesc method is abstracted and can be used to find medical requests by client id

    List<MedicalRequest> findByMedicalAdvisorIdOrderByRequestedAtDesc(Long medicalAdvisorId);

    List<MedicalRequest> findAllByOrderByRequestedAtDesc();

    List<MedicalRequest> findByMedicalAdvisorIdAndStatusInOrderByRequestedAtDesc(
            Long medicalAdvisorId, Collection<String> statuses);

    List<MedicalRequest> findByStatusInOrderByRequestedAtDesc(Collection<String> statuses);

    boolean existsByMedicalAdvisorIdAndClientIdAndStatusIn(
            Long medicalAdvisorId, Long clientId, Collection<String> statuses);

    boolean existsByClientIdAndMedicalAdvisorIdAndStatusIn(
            Long clientId, Long medicalAdvisorId, Collection<String> statuses);

    List<MedicalRequest> findByPreferredDateAndStatusIn(LocalDate preferredDate, Collection<String> statuses);
}
