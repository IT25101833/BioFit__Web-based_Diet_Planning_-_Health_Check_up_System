package com.biofit.backend.domain;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WalletTopUpRequestRepository extends JpaRepository<WalletTopUpRequest, Long> {

    List<WalletTopUpRequest> findByClientIdOrderByCreatedAtDesc(Long clientId);

    List<WalletTopUpRequest> findAllByOrderByCreatedAtDesc();

    long countByRequestNumberStartingWith(String prefix);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from WalletTopUpRequest r where r.id = :id")
    Optional<WalletTopUpRequest> findByIdForUpdate(@Param("id") Long id);
}
