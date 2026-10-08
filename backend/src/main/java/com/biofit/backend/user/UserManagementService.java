package com.biofit.backend.user;

import com.biofit.backend.audit.AuditService;
import com.biofit.backend.auth.RefreshTokenRepository;
import com.biofit.backend.common.ApiException;
import com.biofit.backend.domain.SupportTicketRepository;
import com.biofit.backend.security.UserPrincipal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    static final List<String> OPEN_TICKET_STATUSES =
            List.of("Open", "Assigned", "In Progress", "Pending Client Reply", "Escalated");

    private static final Set<RoleName> MANAGER_STAFF_ROLES =
            Set.of(RoleName.MEDICAL_ADVISOR, RoleName.NUTRITION_CONSULTANT, RoleName.FITNESS_COACH);

    private static final List<RoleName> STAFF_ROLES =
            List.of(
                    RoleName.WELLNESS_CENTRE_MANAGER,
                    RoleName.FITNESS_COACH,
                    RoleName.NUTRITION_CONSULTANT,
                    RoleName.MEDICAL_ADVISOR,
                    RoleName.CUSTOMER_EXPERIENCE_OFFICER,
                    RoleName.DIGITAL_OPERATIONS_EXECUTIVE,
                    RoleName.ADMIN);

    /** Administrative lock stays until an authorized unlock. It is not the 15-minute sign-in lock. */
    private static final Duration ADMIN_LOCK = Duration.ofDays(3650);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final WellnessCentreRepository wellnessCentreRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listAdminUsers() {
        return listAdminUsers(null, null, null, null, null);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listAdminUsers(String role, String status, String type, String q, String sort) {
        List<Map<String, Object>> users = new ArrayList<>();
        for (User user : userRepository.findByDeletedAtIsNull()) {
            Map<String, Object> row = toAdminUser(user);
            if (matches(row, role, status, type, q)) {
                users.add(row);
            }
        }
        sortUsers(users, sort);
        return users;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAdminUser(Long id) {
        return toAdminUser(findUser(id));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> dashboardMetrics() {
        Instant monthStart =
                LocalDate.now(ZoneOffset.UTC).withDayOfMonth(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        long totalUsers = userRepository.countByDeletedAtIsNull();
        long activeStaff = userRepository.countByStatusAndRoles(UserStatus.ACTIVE, STAFF_ROLES);
        long inactive = userRepository.countByStatusAndDeletedAtIsNull(UserStatus.INACTIVE);
        long locked = userRepository.countByStatusAndDeletedAtIsNull(UserStatus.LOCKED);
        long failed = userRepository.sumFailedLoginAttempts();
        long newUsers = userRepository.countByCreatedAtGreaterThanEqualAndDeletedAtIsNull(monthStart);
        long openTickets = supportTicketRepository.countByStatusIn(OPEN_TICKET_STATUSES);

        List<Map<String, Object>> usersByRole = new ArrayList<>();
        for (Object[] row : userRepository.countGroupedByRole()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("role", String.valueOf(row[0]));
            item.put("count", ((Number) row[1]).longValue());
            usersByRole.add(item);
        }
        usersByRole.sort(Comparator.comparing(item -> String.valueOf(item.get("role"))));

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("totalUsers", totalUsers);
        metrics.put("activeStaff", activeStaff);
        metrics.put("inactiveAccounts", inactive);
        metrics.put("lockedAccounts", locked);
        metrics.put("failedLoginAttempts", failed);
        metrics.put("newUsersThisMonth", newUsers);
        metrics.put("openTickets", openTickets);
        metrics.put("usersByRole", usersByRole);
        return metrics;
    }

    @Transactional
    public Map<String, Object> createAdminUser(UserPrincipal actor, Map<String, Object> body, String ip, String userAgent) {
        RoleName roleName = parseRole(body.get("role"));
        assertCanAssign(actor, roleName);
        User user = buildUser(body, roleName);
        if (body.get("wellnessCentreId") != null) {
            user.setWellnessCentre(resolveCentre(asLong(body.get("wellnessCentreId"))));
        } else if (body.get("wellnessCentreName") != null) {
            user.setWellnessCentre(resolveOrCreateCentre(str(body.get("wellnessCentreName"))));
        }
        userRepository.save(user);
        auditService.log(
                actor.getId(),
                "USER_CREATED",
                "User",
                String.valueOf(user.getId()),
                "SUCCESS",
                ip,
                userAgent,
                "role=" + roleName);
        return toAdminUser(user);
    }

    @Transactional
    public Map<String, Object> updateAdminUser(
            UserPrincipal actor, Long id, Map<String, Object> body, String ip, String userAgent) {
        User user = findUser(id);
        assertCanManage(actor, user);
        if (body.get("role") != null && actor.getId().equals(user.getId())) {
            throw new ApiException("FORBIDDEN", "You cannot change your own role.", HttpStatus.FORBIDDEN);
        }
        UserStatus previousStatus = user.getStatus();
        boolean roleChanged = false;
        if (body.get("role") != null) {
            RoleName roleName = parseRole(body.get("role"));
            assertCanAssign(actor, roleName);
            assertNotLastActiveAdmin(user, roleName, user.getStatus());
            setSingleRole(user, roleName);
            roleChanged = true;
        }
        boolean statusChanged = false;
        if (body.get("status") != null) {
            UserStatus status = parseStatus(body.get("status"));
            assertNotLastActiveAdmin(user, primaryRole(user), status);
            applyStatus(user, status);
            statusChanged = previousStatus != user.getStatus();
        }
        updateEditableFields(user, body);
        if (body.get("wellnessCentreId") != null) {
            user.setWellnessCentre(resolveCentre(asLong(body.get("wellnessCentreId"))));
        }
        userRepository.save(user);
        if (roleChanged) {
            auditService.log(
                    actor.getId(),
                    "USER_ROLE_CHANGED",
                    "User",
                    String.valueOf(user.getId()),
                    "SUCCESS",
                    ip,
                    userAgent,
                    "role=" + primaryRole(user));
        }
        if (statusChanged) {
            auditService.log(
                    actor.getId(),
                    statusAction(previousStatus, user.getStatus()),
                    "User",
                    String.valueOf(user.getId()),
                    "SUCCESS",
                    ip,
                    userAgent,
                    "status=" + user.getStatus());
        }
        if (!roleChanged && !statusChanged) {
            auditService.log(
                    actor.getId(),
                    "USER_UPDATED",
                    "User",
                    String.valueOf(user.getId()),
                    "SUCCESS",
                    ip,
                    userAgent,
                    null);
        }
        return toAdminUser(user);
    }

    @Transactional
    public Map<String, Object> setAdminUserStatus(
            UserPrincipal actor, Long id, UserStatus status, String ip, String userAgent) {
        return updateAdminUser(actor, id, Map.of("status", status.name()), ip, userAgent);
    }

    @Transactional
    public Map<String, Object> issuePasswordReset(UserPrincipal actor, Long id, String ip, String userAgent) {
        User user = findUser(id);
        assertCanManage(actor, user);
        UserStatus before = user.getStatus();
        user.setPasswordResetToken(UUID.randomUUID().toString());
        user.setPasswordResetExpiresAt(Instant.now().plusSeconds(3600));
        userRepository.save(user);
        if (user.getStatus() != before) {
            throw new ApiException(
                    "STATUS_UNCHANGED",
                    "Password reset must not change account status.",
                    HttpStatus.CONFLICT);
        }
        auditService.log(
                actor.getId(),
                "PASSWORD_RESET_ISSUED",
                "User",
                String.valueOf(user.getId()),
                "SUCCESS",
                ip,
                userAgent,
                "status=" + user.getStatus());
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("issued", true);
        result.put("emailSent", false);
        result.put("status", user.getStatus().name());
        result.put(
                "message",
                "Password reset was issued. Account status was not changed. Email is sent only when mail delivery is configured.");
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listManagerStaff(UserPrincipal manager) {
        return listManagerStaff(manager, null, null, null, null);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listManagerStaff(
            UserPrincipal manager, String role, String status, String q, String sort) {
        User actor = findUser(manager.getId());
        WellnessCentre centre = requireCentre(actor);
        List<Map<String, Object>> staff = new ArrayList<>();
        for (User user : userRepository.findCentreStaff(centre.getId(), List.copyOf(MANAGER_STAFF_ROLES))) {
            Map<String, Object> row = toAdminUser(user);
            if (matches(row, role, status, "staff", q)) {
                staff.add(row);
            }
        }
        sortUsers(staff, sort);
        return staff;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getManagerStaff(UserPrincipal manager, Long id) {
        return toAdminUser(findOwnedStaff(manager, id));
    }

    @Transactional
    public Map<String, Object> createManagerStaff(
            UserPrincipal manager, Map<String, Object> body, String ip, String userAgent) {
        User actor = findUser(manager.getId());
        WellnessCentre centre = requireCentre(actor);
        rejectForeignCentre(body, centre);
        RoleName roleName = parseRole(body.get("role"));
        if (!MANAGER_STAFF_ROLES.contains(roleName)) {
            throw new ApiException("FORBIDDEN", "Managers can only create centre staff roles.", HttpStatus.FORBIDDEN);
        }
        User staff = buildUser(body, roleName);
        staff.setWellnessCentre(centre);
        userRepository.save(staff);
        auditService.log(
                manager.getId(),
                "CENTRE_STAFF_CREATED",
                "User",
                String.valueOf(staff.getId()),
                "SUCCESS",
                ip,
                userAgent,
                "centre=" + centre.getId() + ", role=" + roleName);
        return toAdminUser(staff);
    }

    @Transactional
    public Map<String, Object> updateManagerStaff(
            UserPrincipal manager, Long id, Map<String, Object> body, String ip, String userAgent) {
        User staff = findOwnedStaff(manager, id);
        rejectForeignCentre(body, staff.getWellnessCentre());
        UserStatus previousStatus = staff.getStatus();
        boolean roleChanged = false;
        if (body.get("role") != null) {
            RoleName roleName = parseRole(body.get("role"));
            if (!MANAGER_STAFF_ROLES.contains(roleName)) {
                throw new ApiException("FORBIDDEN", "Managers can only assign centre staff roles.", HttpStatus.FORBIDDEN);
            }
            setSingleRole(staff, roleName);
            roleChanged = true;
        }
        boolean statusChanged = false;
        if (body.get("status") != null) {
            applyStatus(staff, parseStatus(body.get("status")));
            statusChanged = previousStatus != staff.getStatus();
        }
        updateEditableFields(staff, body);
        userRepository.save(staff);
        auditService.log(
                manager.getId(),
                statusChanged ? statusAction(previousStatus, staff.getStatus()) : roleChanged ? "USER_ROLE_CHANGED" : "CENTRE_STAFF_UPDATED",
                "User",
                String.valueOf(staff.getId()),
                "SUCCESS",
                ip,
                userAgent,
                "centre=" + staff.getWellnessCentre().getId());
        return toAdminUser(staff);
    }

    private User buildUser(Map<String, Object> body, RoleName roleName) {
        String email = str(body.get("email"));
        if (isBlank(email)) {
            throw new ApiException("VALIDATION_ERROR", "Email is required.", HttpStatus.BAD_REQUEST);
        }
        if (userRepository.existsByEmailIgnoreCaseAndDeletedAtIsNull(email)) {
            throw new ApiException("EMAIL_EXISTS", "An account with this email already exists.", HttpStatus.CONFLICT);
        }
        String password = str(body.get("password"));
        if (password == null || password.length() < 8) {
            throw new ApiException("VALIDATION_ERROR", "Password must be at least 8 characters.", HttpStatus.BAD_REQUEST);
        }
        User user = new User();
        user.setEmail(email.trim().toLowerCase(Locale.ROOT));
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setEmailVerified(true);
        user.setStatus(UserStatus.ACTIVE);
        updateEditableFields(user, body);
        if (isBlank(user.getFirstName()) || isBlank(user.getLastName())) {
            throw new ApiException("VALIDATION_ERROR", "First name and last name are required.", HttpStatus.BAD_REQUEST);
        }
        if (body.get("status") != null) {
            applyStatus(user, parseStatus(body.get("status")));
        }
        setSingleRole(user, roleName);
        return user;
    }

    private void applyStatus(User user, UserStatus status) {
        user.setStatus(status);
        if (status == UserStatus.ACTIVE) {
            user.setLockedUntil(null);
            user.setFailedLoginAttempts(0);
            return;
        }
        if (status == UserStatus.LOCKED) {
            user.setLockedUntil(Instant.now().plus(ADMIN_LOCK));
        } else {
            user.setLockedUntil(null);
        }
        if (user.getId() != null) {
            refreshTokenRepository.deleteByUserId(user.getId());
        }
    }

    private void updateEditableFields(User user, Map<String, Object> body) {
        if (body.get("firstName") != null) user.setFirstName(str(body.get("firstName")).trim());
        if (body.get("lastName") != null) user.setLastName(str(body.get("lastName")).trim());
        if (body.get("contactNumber") != null) user.setContactNumber(str(body.get("contactNumber")).trim());
        if (body.get("specialization") != null) user.setSpecialization(str(body.get("specialization")).trim());
    }

    private User findOwnedStaff(UserPrincipal manager, Long id) {
        User actor = findUser(manager.getId());
        WellnessCentre centre = requireCentre(actor);
        User staff = findUser(id);
        if (staff.getWellnessCentre() == null
                || !centre.getId().equals(staff.getWellnessCentre().getId())
                || !MANAGER_STAFF_ROLES.contains(primaryRole(staff))) {
            throw new ApiException("NOT_FOUND", "Staff member not found.", HttpStatus.NOT_FOUND);
        }
        return staff;
    }

    private void rejectForeignCentre(Map<String, Object> body, WellnessCentre centre) {
        if (body.get("wellnessCentreId") != null) {
            Long requested = asLong(body.get("wellnessCentreId"));
            if (requested != null && !requested.equals(centre.getId())) {
                throw new ApiException(
                        "FORBIDDEN",
                        "You cannot assign staff to another wellness centre.",
                        HttpStatus.FORBIDDEN);
            }
        }
        if (!isBlank(body.get("wellnessCentreName"))
                && !centre.getName().equalsIgnoreCase(str(body.get("wellnessCentreName")).trim())) {
            throw new ApiException(
                    "FORBIDDEN",
                    "You cannot assign staff to another wellness centre.",
                    HttpStatus.FORBIDDEN);
        }
    }

    private User findUser(Long id) {
        return userRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "User not found.", HttpStatus.NOT_FOUND));
    }

    private WellnessCentre requireCentre(User user) {
        if (user.getWellnessCentre() == null) {
            throw new ApiException(
                    "CENTRE_REQUIRED", "Manager is not assigned to a wellness centre.", HttpStatus.FORBIDDEN);
        }
        return user.getWellnessCentre();
    }

    private WellnessCentre resolveCentre(Long id) {
        if (id == null) {
            throw new ApiException("VALIDATION_ERROR", "Wellness centre is required.", HttpStatus.BAD_REQUEST);
        }
        return wellnessCentreRepository
                .findById(id)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Wellness centre not found.", HttpStatus.NOT_FOUND));
    }

    private WellnessCentre resolveOrCreateCentre(String name) {
        if (isBlank(name)) {
            throw new ApiException("VALIDATION_ERROR", "Wellness centre name is required.", HttpStatus.BAD_REQUEST);
        }
        return wellnessCentreRepository
                .findByNameIgnoreCase(name.trim())
                .orElseGet(
                        () -> {
                            WellnessCentre centre = new WellnessCentre();
                            centre.setName(name.trim());
                            return wellnessCentreRepository.save(centre);
                        });
    }

    private void setSingleRole(User user, RoleName roleName) {
        Role role =
                roleRepository
                        .findByName(roleName)
                        .orElseThrow(() -> new ApiException("ROLE_MISSING", "Role missing.", HttpStatus.BAD_REQUEST));
        user.setRoles(new java.util.HashSet<>());
        user.getRoles().add(role);
    }

    private void assertCanAssign(UserPrincipal actor, RoleName roleName) {
        if (actor.hasRole(RoleName.ADMIN)) {
            return;
        }
        if (actor.hasRole(RoleName.DIGITAL_OPERATIONS_EXECUTIVE)
                && roleName != RoleName.ADMIN
                && roleName != RoleName.DIGITAL_OPERATIONS_EXECUTIVE) {
            return;
        }
        throw new ApiException("FORBIDDEN", "You are not allowed to assign this role.", HttpStatus.FORBIDDEN);
    }

    private void assertCanManage(UserPrincipal actor, User target) {
        if (actor.hasRole(RoleName.ADMIN)) {
            return;
        }
        RoleName targetRole = primaryRole(target);
        if (targetRole == RoleName.ADMIN || targetRole == RoleName.DIGITAL_OPERATIONS_EXECUTIVE) {
            throw new ApiException(
                    "FORBIDDEN", "You cannot manage this privileged account.", HttpStatus.FORBIDDEN);
        }
    }

    private void assertNotLastActiveAdmin(User user, RoleName nextRole, UserStatus nextStatus) {
        if (primaryRole(user) != RoleName.ADMIN) {
            return;
        }
        if (nextRole == RoleName.ADMIN && nextStatus == UserStatus.ACTIVE) {
            return;
        }
        long activeAdmins =
                userRepository.findByDeletedAtIsNull().stream()
                        .filter(u -> u.getStatus() == UserStatus.ACTIVE)
                        .filter(u -> primaryRole(u) == RoleName.ADMIN)
                        .count();
        if (activeAdmins <= 1) {
            throw new ApiException(
                    "LAST_ADMIN", "At least one active ADMIN account must remain.", HttpStatus.CONFLICT);
        }
    }

    private static String statusAction(UserStatus previous, UserStatus next) {
        if (next == UserStatus.LOCKED) {
            return "USER_LOCKED";
        }
        if (next == UserStatus.INACTIVE) {
            return "USER_DEACTIVATED";
        }
        if (next == UserStatus.ACTIVE && previous == UserStatus.LOCKED) {
            return "USER_UNLOCKED";
        }
        if (next == UserStatus.ACTIVE) {
            return "USER_REINSTATED";
        }
        return "USER_STATUS_CHANGED";
    }

    private static boolean matches(Map<String, Object> row, String role, String status, String type, String q) {
        if (!isBlank(role) && !role.equalsIgnoreCase(String.valueOf(row.get("role")))) {
            return false;
        }
        if (!isBlank(status) && !status.equalsIgnoreCase(String.valueOf(row.get("status")))) {
            return false;
        }
        if ("client".equalsIgnoreCase(type) && !"Client".equals(row.get("type"))) {
            return false;
        }
        if ("staff".equalsIgnoreCase(type) && !"Staff".equals(row.get("type"))) {
            return false;
        }
        if (isBlank(q)) {
            return true;
        }
        String needle = q.trim().toLowerCase(Locale.ROOT);
        String haystack =
                (row.get("name")
                                + " "
                                + row.get("id")
                                + " "
                                + row.get("email")
                                + " "
                                + row.get("role")
                                + " "
                                + row.get("status"))
                        .toLowerCase(Locale.ROOT);
        return haystack.contains(needle);
    }

    private static void sortUsers(List<Map<String, Object>> users, String sort) {
        String key = isBlank(sort) ? "created" : sort.trim().toLowerCase(Locale.ROOT);
        Comparator<Map<String, Object>> comparator =
                switch (key) {
                    case "name" -> Comparator.comparing(row -> String.valueOf(row.getOrDefault("name", "")), String.CASE_INSENSITIVE_ORDER);
                    case "lastlogin", "recentlyactive" ->
                            Comparator.comparing(
                                    (Map<String, Object> row) -> String.valueOf(row.getOrDefault("lastLogin", "")),
                                    Comparator.reverseOrder());
                    default ->
                            Comparator.comparing(
                                    (Map<String, Object> row) -> String.valueOf(row.getOrDefault("created", "")),
                                    Comparator.reverseOrder());
                };
        users.sort(comparator);
    }

    private static Map<String, Object> toAdminUser(User user) {
        RoleName role = primaryRole(user);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", "USR-" + user.getId());
        map.put("userId", user.getId());
        map.put("name", user.getFullName());
        map.put("firstName", user.getFirstName());
        map.put("lastName", user.getLastName());
        map.put("initials", initials(user));
        map.put("role", role.name());
        map.put("email", user.getEmail());
        map.put("contactNumber", user.getContactNumber());
        map.put("specialization", user.getSpecialization());
        map.put("status", user.getStatus() == null ? "ACTIVE" : user.getStatus().name());
        map.put("type", role == RoleName.CLIENT ? "Client" : "Staff");
        map.put("created", user.getCreatedAt() == null ? "" : user.getCreatedAt().toString());
        map.put("lastLogin", user.getLastLoginAt() == null ? null : user.getLastLoginAt().toString());
        map.put("verification", user.isEmailVerified() ? "Verified" : "Pending");
        map.put("wellnessCentreId", user.getWellnessCentre() == null ? null : user.getWellnessCentre().getId());
        map.put("wellnessCentreName", user.getWellnessCentre() == null ? null : user.getWellnessCentre().getName());
        return map;
    }

    private static RoleName primaryRole(User user) {
        return user.getRoles().stream().map(Role::getName).findFirst().orElse(RoleName.CLIENT);
    }

    private static String initials(User user) {
        String first = isBlank(user.getFirstName()) ? "" : user.getFirstName().substring(0, 1);
        String last = isBlank(user.getLastName()) ? "" : user.getLastName().substring(0, 1);
        return (first + last).toUpperCase(Locale.ROOT);
    }

    private static RoleName parseRole(Object value) {
        if (value == null || isBlank(value)) {
            throw new ApiException("VALIDATION_ERROR", "Role is required.", HttpStatus.BAD_REQUEST);
        }
        try {
            return RoleName.valueOf(str(value).trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ApiException("VALIDATION_ERROR", "Unsupported role.", HttpStatus.BAD_REQUEST);
        }
    }

    private static UserStatus parseStatus(Object value) {
        try {
            return UserStatus.valueOf(str(value).trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new ApiException("VALIDATION_ERROR", "Unsupported account status.", HttpStatus.BAD_REQUEST);
        }
    }

    private static Long asLong(Object value) {
        if (value instanceof Number n) return n.longValue();
        if (isBlank(value)) return null;
        try {
            return Long.parseLong(str(value));
        } catch (NumberFormatException ex) {
            throw new ApiException("VALIDATION_ERROR", "Invalid numeric identifier.", HttpStatus.BAD_REQUEST);
        }
    }

    private static boolean isBlank(Object value) {
        return value == null || String.valueOf(value).trim().isEmpty();
    }

    private static String str(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
