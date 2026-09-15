package com.biofit.backend.domain;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ProgrammeEnrolmentRepository extends JpaRepository<ProgrammeEnrolment, String> {
    List<ProgrammeEnrolment> findByClientUserId(Long clientUserId);
    List<ProgrammeEnrolment> findByProgrammeId(String programmeId);
}
