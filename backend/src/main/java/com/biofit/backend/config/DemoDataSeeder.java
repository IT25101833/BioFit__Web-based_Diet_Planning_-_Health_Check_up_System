package com.biofit.backend.config;

import com.biofit.backend.domain.DomainSeedService;
import com.biofit.backend.health.HealthAssessment;
import com.biofit.backend.health.HealthAssessmentRepository;
import com.biofit.backend.health.HealthGoal;
import com.biofit.backend.health.HealthGoalRepository;
import com.biofit.backend.health.HealthMetric;
import com.biofit.backend.health.HealthMetricRepository;
import com.biofit.backend.health.HealthProfile;
import com.biofit.backend.health.HealthProfileRepository;
import com.biofit.backend.health.HealthRiskAlert;
import com.biofit.backend.health.HealthRiskAlertRepository;
import com.biofit.backend.user.Role;
import com.biofit.backend.user.RoleName;
import com.biofit.backend.user.RoleRepository;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import com.biofit.backend.user.UserStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DemoDataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final HealthProfileRepository healthProfileRepository;
    private final HealthMetricRepository healthMetricRepository;
    private final HealthGoalRepository healthGoalRepository;
    private final HealthAssessmentRepository healthAssessmentRepository;
    private final HealthRiskAlertRepository healthRiskAlertRepository;
    private final DomainSeedService domainSeedService;

    @Value("${biofit.seed-demo-data:false}")
    private boolean seedDemoData;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!seedDemoData) {
            log.info("Demo data seeding skipped (biofit.seed-demo-data=false)");
            return;
        }
        if (userRepository.count() == 0) {
            seedUsers();
        }
        seedMedicalPortalClients();
        if (healthProfileRepository.count() == 0) {
            seedClientHealth();
        }
        domainSeedService.seedIfEmpty();
    }

    private void seedUsers() {
        String hash = passwordEncoder.encode("Demo123!");
        List<SeedUser> seeds =
                List.of(
                        new SeedUser("client@biofit.demo", "Alex", "Morgan", RoleName.CLIENT, null),
                        new SeedUser(
                                "manager@biofit.demo",
                                "Sarah",
                                "Williams",
                                RoleName.WELLNESS_CENTRE_MANAGER,
                                "Centre operations"),
                        new SeedUser(
                                "coach@biofit.demo",
                                "Daniel",
                                "Perera",
                                RoleName.FITNESS_COACH,
                                "Strength & conditioning"),
                        new SeedUser(
                                "nutrition@biofit.demo",
                                "Maya",
                                "Fernando",
                                RoleName.NUTRITION_CONSULTANT,
                                "Clinical nutrition"),
                        new SeedUser(
                                "operations@biofit.demo",
                                "Jordan",
                                "Lee",
                                RoleName.DIGITAL_OPERATIONS_EXECUTIVE,
                                "Platform operations"),
                        new SeedUser(
                                "support@biofit.demo",
                                "Priya",
                                "Nair",
                                RoleName.CUSTOMER_EXPERIENCE_OFFICER,
                                "Customer experience"),
                        new SeedUser(
                                "medical@biofit.demo",
                                "Elena",
                                "Costa",
                                RoleName.MEDICAL_ADVISOR,
                                "Preventive health"),
                        new SeedUser("admin@biofit.demo", "Sam", "Okoye", RoleName.ADMIN, "System admin"));

        for (SeedUser seed : seeds) {
            Role role =
                    roleRepository
                            .findByName(seed.role())
                            .orElseThrow(() -> new IllegalStateException("Missing role " + seed.role()));
            User user = new User();
            user.setEmail(seed.email());
            user.setPasswordHash(hash);
            user.setFirstName(seed.firstName());
            user.setLastName(seed.lastName());
            user.setSpecialization(seed.specialization());
            user.setStatus(UserStatus.ACTIVE);
            user.setEmailVerified(true);
            user.setRoles(Set.of(role));
            userRepository.save(user);
        }

        log.info("Seeded {} BioFit demo users (password: Demo123!)", seeds.size());
    }

    private void seedMedicalPortalClients() {
        Role clientRole =
                roleRepository
                        .findByName(RoleName.CLIENT)
                        .orElseThrow(() -> new IllegalStateException("Missing role CLIENT"));
        String hash = passwordEncoder.encode("Demo123!");
        List<MedicalClientSeed> seeds =
                List.of(
                        new MedicalClientSeed(
                                "alex.perera@biofit.demo",
                                "Alex",
                                "Perera",
                                "BF-C1024",
                                "Weight Management Programme"),
                        new MedicalClientSeed(
                                "nimali.silva@biofit.demo",
                                "Nimali",
                                "Silva",
                                "BF-C1095",
                                "Health Monitoring Pathway"),
                        new MedicalClientSeed(
                                "sahan.desilva@biofit.demo",
                                "Sahan",
                                "De Silva",
                                "BF-C1088",
                                "Complete Wellness Programme"),
                        new MedicalClientSeed(
                                "dilani.fernando@biofit.demo",
                                "Dilani",
                                "Fernando",
                                "BF-C1110",
                                "Weight Management Programme"),
                        new MedicalClientSeed(
                                "taylor.kim@biofit.demo",
                                "Taylor",
                                "Kim",
                                "BF-C1102",
                                "Health Monitoring Pathway"),
                        new MedicalClientSeed(
                                "kasuni.abeysekara@biofit.demo",
                                "Kasuni",
                                "Abeysekara",
                                "BF-C1201",
                                "Complete Wellness Programme"));

        int created = 0;
        for (MedicalClientSeed seed : seeds) {
            User user =
                    userRepository
                            .findByEmailIgnoreCaseAndDeletedAtIsNull(seed.email())
                            .orElseGet(
                                    () -> {
                                        User createdUser = new User();
                                        createdUser.setEmail(seed.email());
                                        createdUser.setPasswordHash(hash);
                                        createdUser.setFirstName(seed.firstName());
                                        createdUser.setLastName(seed.lastName());
                                        createdUser.setStatus(UserStatus.ACTIVE);
                                        createdUser.setEmailVerified(true);
                                        createdUser.setRoles(Set.of(clientRole));
                                        return userRepository.save(createdUser);
                                    });

            HealthProfile profile =
                    healthProfileRepository
                            .findByUserId(user.getId())
                            .orElseGet(
                                    () -> {
                                        HealthProfile createdProfile = new HealthProfile();
                                        createdProfile.setUserId(user.getId());
                                        createdProfile.setMedicalRecordStatus("Up to Date");
                                        return createdProfile;
                                    });
            boolean dirty = profile.getId() == null;
            if (profile.getClientCode() == null || !seed.clientCode().equals(profile.getClientCode())) {
                profile.setClientCode(seed.clientCode());
                dirty = true;
            }
            if (profile.getProgrammeLabel() == null || profile.getProgrammeLabel().isBlank()) {
                profile.setProgrammeLabel(seed.programme());
                dirty = true;
            }
            if (profile.getAssignedCoach() == null) {
                profile.setAssignedCoach("Daniel Perera");
                dirty = true;
            }
            if (profile.getAssignedNutrition() == null) {
                profile.setAssignedNutrition("Maya Fernando");
                dirty = true;
            }
            if (dirty) {
                healthProfileRepository.save(profile);
                created += 1;
            }
        }
        if (created > 0) {
            log.info("Ensured {} medical portal demo clients/profiles", created);
        }
    }

    private record MedicalClientSeed(
            String email, String firstName, String lastName, String clientCode, String programme) {}

    private void seedClientHealth() {
        User client =
                userRepository
                        .findByEmailIgnoreCaseAndDeletedAtIsNull("client@biofit.demo")
                        .orElse(null);
        if (client == null) {
            return;
        }

        HealthProfile profile = new HealthProfile();
        profile.setUserId(client.getId());
        profile.setHeightCm(new BigDecimal("170.00"));
        profile.setWeightKg(new BigDecimal("72.50"));
        profile.setBloodType("O+");
        profile.setActivityLevel("Moderate");
        profile.setMedicalRecordStatus("Up to date");
        profile.setSafetyNotes(
                "Continue gradual activity increases as advised by your coach.|Stay hydrated and rest when you feel unusually tired.|Contact support if symptoms feel new or concerning.");
        healthProfileRepository.save(profile);

        Instant now = Instant.now();

        HealthMetric weight = new HealthMetric();
        weight.setUserId(client.getId());
        weight.setMetricType("WEIGHT");
        weight.setValueNum(new BigDecimal("72.50"));
        weight.setUnit("kg");
        weight.setRecordedAt(now.minus(3, ChronoUnit.DAYS));
        weight.setSource("CLIENT");
        healthMetricRepository.save(weight);

        HealthMetric hydration = new HealthMetric();
        hydration.setUserId(client.getId());
        hydration.setMetricType("HYDRATION");
        hydration.setValueNum(new BigDecimal("2.1"));
        hydration.setValueText("2.1 L today");
        hydration.setUnit("L");
        hydration.setRecordedAt(now.minus(1, ChronoUnit.HOURS));
        hydration.setSource("CLIENT");
        healthMetricRepository.save(hydration);

        HealthGoal g1 = new HealthGoal();
        g1.setUserId(client.getId());
        g1.setTitle("Steady weekly activity");
        g1.setDescription("Complete planned movement sessions");
        g1.setTargetValue("4 sessions / week");
        g1.setStatus("ACTIVE");
        g1.setProgressPercent(78);
        healthGoalRepository.save(g1);

        HealthGoal g2 = new HealthGoal();
        g2.setUserId(client.getId());
        g2.setTitle("Meal-plan participation");
        g2.setDescription("Follow assigned meal structure");
        g2.setTargetValue("85% weekly");
        g2.setStatus("ACTIVE");
        g2.setProgressPercent(84);
        healthGoalRepository.save(g2);

        HealthAssessment assessment = new HealthAssessment();
        assessment.setUserId(client.getId());
        assessment.setTitle("General health assessment");
        assessment.setSummary("No urgent concerns noted for client-facing guidance.");
        assessment.setAssessmentType("General");
        assessment.setStatus("COMPLETED");
        assessment.setAssessedAt(now.minus(25, ChronoUnit.DAYS));
        assessment.setNextReviewAt(now.plus(11, ChronoUnit.DAYS));
        healthAssessmentRepository.save(assessment);

        HealthRiskAlert alert = new HealthRiskAlert();
        alert.setUserId(client.getId());
        alert.setTitle("Hydration reminder");
        alert.setStatus("Monitoring");
        alert.setGuidance(
                "Aim for steady water intake through the day. Your care team will review this at your next check-in.");
        alert.setDateRaised(now.minus(13, ChronoUnit.DAYS));
        alert.setFollowUpAt(now.plus(1, ChronoUnit.DAYS));
        healthRiskAlertRepository.save(alert);

        HealthRiskAlert resolved = new HealthRiskAlert();
        resolved.setUserId(client.getId());
        resolved.setTitle("Post-session recovery note");
        resolved.setStatus("Resolved");
        resolved.setGuidance(
                "Extra rest days were recommended after a busy training week. This alert is now resolved.");
        resolved.setDateRaised(now.minus(33, ChronoUnit.DAYS));
        resolved.setFollowUpAt(now.minus(19, ChronoUnit.DAYS));
        healthRiskAlertRepository.save(resolved);

        log.info("Seeded client health profile, metrics, goals, assessment and alerts");
    }

    private record SeedUser(
            String email, String firstName, String lastName, RoleName role, String specialization) {}
}
