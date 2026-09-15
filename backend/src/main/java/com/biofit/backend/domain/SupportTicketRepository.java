package com.biofit.backend.domain;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SupportTicketRepository extends JpaRepository<SupportTicketEntity, String> {
    List<SupportTicketEntity> findByClientUserIdOrderByUpdatedAtDesc(Long clientUserId);
    Optional<SupportTicketEntity> findByIdAndClientUserId(String id, Long clientUserId);
}
