package com.biofit.backend.domain;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    List<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(Long walletId);

    List<WalletTransaction> findAllByOrderByCreatedAtDesc();

    Optional<WalletTransaction> findByTopUpRequestIdAndType(Long topUpRequestId, String type);

    long countByReferenceStartingWith(String prefix);
}
