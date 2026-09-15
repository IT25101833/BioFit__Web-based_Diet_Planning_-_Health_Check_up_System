package com.biofit.backend.domain;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DietaryRestrictionRepository extends JpaRepository<DietaryRestrictionEntity, String> {
    List<DietaryRestrictionEntity> findByClientUserId(Long clientUserId);
    List<DietaryRestrictionEntity> findByClientId(String clientId);
}
