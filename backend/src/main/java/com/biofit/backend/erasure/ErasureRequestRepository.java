package com.biofit.backend.erasure;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ErasureRequestRepository extends JpaRepository<ErasureRequest, Long> {
    List<ErasureRequest> findAllByOrderByRequestedAtDesc();
}
