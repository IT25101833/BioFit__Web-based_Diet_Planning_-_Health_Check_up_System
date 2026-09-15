package com.biofit.backend.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FitnessAssessmentRepository extends JpaRepository<FitnessAssessment, String> {
    List<FitnessAssessment> findByClientId(String clientId);
}