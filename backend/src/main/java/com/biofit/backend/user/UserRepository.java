package com.biofit.backend.user;

import java.util.List;
import java.util.Optional;
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
}
