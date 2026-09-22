package com.biofit.backend.health;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalHistoryEntryRepository extends JpaRepository<MedicalHistoryEntry, Long> {
    List<MedicalHistoryEntry> findByUserIdOrderByUpdatedAtDesc(Long userId);

    List<MedicalHistoryEntry> findByStatusIgnoreCaseOrderByUpdatedAtDesc(String status);

    List<MedicalHistoryEntry> findAllByOrderByUpdatedAtDesc();

    List<MedicalHistoryEntry> findByUserIdAndStatusIgnoreCaseOrderByUpdatedAtDesc(Long userId, String status);
}
