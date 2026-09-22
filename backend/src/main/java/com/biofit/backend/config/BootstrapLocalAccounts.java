package com.biofit.backend.config;

import com.biofit.backend.user.Role;
import com.biofit.backend.user.RoleName;
import com.biofit.backend.user.RoleRepository;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import com.biofit.backend.user.UserStatus;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates a local Medical Advisor + Client when enabled, so the medical portal can be tested
 * without demo seed data. Safe to leave enabled: it only inserts missing emails.
 */
@Component
@Order(100)
@RequiredArgsConstructor
@Slf4j
public class BootstrapLocalAccounts implements ApplicationRunner {

    public static final String MEDICAL_EMAIL = "medical@biofit.local";
    public static final String CLIENT_EMAIL = "client@biofit.local";
    public static final String DEFAULT_PASSWORD = "Demo123!";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${biofit.bootstrap-accounts:true}")
    private boolean bootstrapAccounts;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!bootstrapAccounts) {
            log.info("Local account bootstrap skipped (biofit.bootstrap-accounts=false)");
            return;
        }

        String hash = passwordEncoder.encode(DEFAULT_PASSWORD);
        boolean createdMedical = ensureUser(
                MEDICAL_EMAIL,
                "Maya",
                "Jayawardena",
                RoleName.MEDICAL_ADVISOR,
                "Preventive health",
                hash);
        boolean createdClient = ensureUser(
                CLIENT_EMAIL,
                "Ruwan",
                "Perera",
                RoleName.CLIENT,
                null,
                hash);

        if (createdMedical || createdClient) {
            log.info(
                    "Bootstrap accounts ready — medical: {} / client: {} (password: {})",
                    MEDICAL_EMAIL,
                    CLIENT_EMAIL,
                    DEFAULT_PASSWORD);
        }
    }

    private boolean ensureUser(
            String email,
            String firstName,
            String lastName,
            RoleName roleName,
            String specialization,
            String passwordHash) {
        if (userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(email).isPresent()) {
            return false;
        }
        Role role =
                roleRepository
                        .findByName(roleName)
                        .orElseThrow(() -> new IllegalStateException("Missing role " + roleName));
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordHash);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setSpecialization(specialization);
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(true);
        user.setRoles(Set.of(role));
        userRepository.save(user);
        log.info("Created bootstrap user {} ({})", email, roleName);
        return true;
    }
}
