package com.biofit.backend.domain;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalReviewRequestRepository extends JpaRepository<MedicalReviewRequest, String> {

    List<MedicalReviewRequest> findByStatusIgnoreCase(String status);

    List<MedicalReviewRequest> findByClientUserIdAndStatusIgnoreCaseOrderByReviewDateAsc(
            Long clientUserId, String status);

    Optional<MedicalReviewRequest> findByIdAndClientUserId(String id, Long clientUserId);

    Optional<MedicalReviewRequest>
            findFirstByClientUserIdAndSourceTypeIgnoreCaseAndSourceRecordIdAndStatusIgnoreCaseOrderByUpdatedAtDesc(
                    Long clientUserId, String sourceType, String sourceRecordId, String status);

    Optional<MedicalReviewRequest>
            findFirstByClientUserIdAndSourceTypeIgnoreCaseAndSourceRecordIdOrderByUpdatedAtDesc(
                    Long clientUserId, String sourceType, String sourceRecordId);
}
