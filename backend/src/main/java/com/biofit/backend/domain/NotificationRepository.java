package com.biofit.backend.domain;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<NotificationEntity, String> {
    List<NotificationEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<NotificationEntity> findByAudienceIgnoreCaseOrderByCreatedAtDesc(String audience);

    @Query(
            """
            SELECT n FROM NotificationEntity n
            WHERE LOWER(n.audience) = LOWER(:audience)
              AND (n.userId = :userId OR n.userId IS NULL)
            ORDER BY n.createdAt DESC
            """)
    List<NotificationEntity> findForAudienceUserOrBroadcast(
            @Param("audience") String audience, @Param("userId") Long userId);

    List<NotificationEntity> findByUserIdAndAudienceIgnoreCaseOrderByCreatedAtDesc(
            Long userId, String audience);

    boolean existsByUserIdAndTypeIgnoreCaseAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
            Long userId, String type, Instant startInclusive, Instant endExclusive);

    Optional<NotificationEntity> findByIdAndAudienceIgnoreCase(String id, String audience);
}
