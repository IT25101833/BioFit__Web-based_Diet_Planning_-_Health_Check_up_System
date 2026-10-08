package com.biofit.backend.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WellnessCentreRepository extends JpaRepository<WellnessCentre, Long> {
    Optional<WellnessCentre> findByNameIgnoreCase(String name);
}
