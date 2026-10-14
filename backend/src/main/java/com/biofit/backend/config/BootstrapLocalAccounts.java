package com.biofit.backend.config;

import com.biofit.backend.domain.MealPlanRepository;
import com.biofit.backend.domain.MedicalRequest;
import com.biofit.backend.domain.MedicalRequestRepository;
import com.biofit.backend.domain.WorkoutPlanRepository;
import com.biofit.backend.user.Role;
import com.biofit.backend.user.RoleName;
import com.biofit.backend.user.RoleRepository;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import com.biofit.backend.user.UserStatus;
import java.util.List;
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
 * Creates local Medical Advisor + Client login accounts when enabled.
 * Does not seed Medical Advisor portal request rows.
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
    private final MedicalRequestRepository medicalRequestRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final MealPlanRepository mealPlanRepository;

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

        User localClient = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(CLIENT_EMAIL).orElse(null);
        if (localClient != null) {
            removeBootstrapPortalDummy(localClient);
        }

        // Ensure developer test accounts can also be authenticated with Demo123!
        userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("ramh75379@gmail.com").ifPresent(u -> {
            u.setPasswordHash(hash);
            userRepository.save(u);
        });
        userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("ramh81069@gmail.com").ifPresent(u -> {
            u.setPasswordHash(hash);
            userRepository.save(u);
        });

        if (createdMedical || createdClient) {
            log.info(
                    "Bootstrap accounts ready — medical: {} / client: {} (password: {})",
                    MEDICAL_EMAIL,
                    CLIENT_EMAIL,
                    DEFAULT_PASSWORD);
        }
    }

    /** Removes the seeded Ruwan Perera medical-request row from the Medical Advisor portal. */
    private void removeBootstrapPortalDummy(User client) {
        List<MedicalRequest> seeded =
                medicalRequestRepository.findByClientIdOrderByRequestedAtDesc(client.getId()).stream()
                        .filter(request -> "Preventive health review".equals(request.getReason()))
                        .toList();
        if (!seeded.isEmpty()) {
            medicalRequestRepository.deleteAll(seeded);
            log.info("Removed {} bootstrap medical request(s) for {}", seeded.size(), client.getEmail());
        }
        workoutPlanRepository
                .findById("wp-bootstrap-" + client.getId())
                .ifPresent(workoutPlanRepository::delete);
        mealPlanRepository.findById("mp-bootstrap-" + client.getId()).ifPresent(mealPlanRepository::delete);
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
