package com.biofit.backend.user;

import java.util.List;
import java.util.Optional;
import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCaseAndDeletedAtIsNull(String email);

    @Query(
            """
            select distinct u from User u join u.roles r
            where r.name = :role and u.deletedAt is null and u.status = :status
            """)
    List<User> findActiveByRole(@Param("role") RoleName role, @Param("status") UserStatus status);

    boolean existsByEmailIgnoreCaseAndDeletedAtIsNull(String email);

    Optional<User> findByPasswordResetTokenAndDeletedAtIsNull(String token);

    List<User> findByDeletedAtIsNull();

    Optional<User> findByIdAndDeletedAtIsNull(Long id);

    @Query("select u.wellnessCentre.id from User u where lower(u.email) = lower(:email)")
    Long findWellnessCentreIdByEmail(@Param("email") String email);

    List<User> findByWellnessCentreIdAndDeletedAtIsNull(Long wellnessCentreId);

    @Query(
            """
            select distinct u from User u join u.roles r
            where u.wellnessCentre.id = :centreId
              and u.deletedAt is null
              and r.name in :roles
            """)
    List<User> findCentreStaff(
            @Param("centreId") Long centreId, @Param("roles") List<RoleName> roles);

    @Query(
            """
            select count(distinct u) from User u join u.roles r
            where u.deletedAt is null
              and u.status = :status
              and r.name in :roles
            """)
    long countByStatusAndRoles(@Param("status") UserStatus status, @Param("roles") List<RoleName> roles);

    long countByDeletedAtIsNull();

    long countByStatusAndDeletedAtIsNull(UserStatus status);

    long countByFailedLoginAttemptsGreaterThanAndDeletedAtIsNull(int attempts);

    long countByCreatedAtGreaterThanEqualAndDeletedAtIsNull(Instant createdAt);

    @Query("select coalesce(sum(u.failedLoginAttempts), 0) from User u where u.deletedAt is null")
    long sumFailedLoginAttempts();

    @Query(
            """
            select r.name, count(distinct u) from User u join u.roles r
            where u.deletedAt is null
            group by r.name
            """)
    List<Object[]> countGroupedByRole();
}
