package com.biofit.backend.domain;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SupportTicketRepository extends JpaRepository<SupportTicketEntity, String> {
    List<SupportTicketEntity> findByClientUserIdOrderByUpdatedAtDesc(Long clientUserId);

    List<SupportTicketEntity> findByClientIdOrderByUpdatedAtDesc(String clientId);

    long countByClientId(String clientId);

    Optional<SupportTicketEntity> findByIdAndClientUserId(String id, Long clientUserId);

    List<SupportTicketEntity> findByAssignedToIgnoreCaseOrderByUpdatedAtDesc(String assignedTo);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from SupportTicketEntity t where t.id = :id and t.clientUserId = :clientUserId")
    int deleteOwnedTicket(@Param("id") String id, @Param("clientUserId") Long clientUserId);
}
