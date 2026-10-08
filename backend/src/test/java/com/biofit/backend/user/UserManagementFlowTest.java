package com.biofit.backend.user;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.biofit.backend.audit.AuditLog;
import com.biofit.backend.audit.AuditLogRepository;
import com.biofit.backend.domain.SupportTicketRepository;
import com.jayway.jsonpath.JsonPath;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(
        properties = {
            "spring.datasource.url=jdbc:h2:mem:usermgmt;DB_CLOSE_DELAY=-1;MODE=LEGACY",
            "biofit.seed-demo-data=true",
            "biofit.bootstrap-accounts=true"
        })
class UserManagementFlowTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private SupportTicketRepository supportTicketRepository;

    @Test
    void tcUm01ViewUserAccounts() throws Exception {
        String admin = login("admin@biofit.demo", "Demo123!");
        mockMvc.perform(get("/api/admin/users").header("Authorization", admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value((int) userRepository.countByDeletedAtIsNull()))
                .andExpect(jsonPath("$.data[0].email").exists())
                .andExpect(jsonPath("$.data[0].status").exists());
    }

    @Test
    void tcUm02CreateAndEditRole() throws Exception {
        String admin = login("admin@biofit.demo", "Demo123!");
        String email = uniqueEmail("staff");
        long id = createAdminUser(admin, email, "FITNESS_COACH", "Coach1234!");
        mockMvc.perform(
                        patch("/api/admin/users/" + id)
                                .header("Authorization", admin)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"role\":\"NUTRITION_CONSULTANT\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("NUTRITION_CONSULTANT"));
        assertEquals(RoleName.NUTRITION_CONSULTANT, primaryRole(id));
    }

    @Test
    void tcUm04And05SuspendAndReinstate() throws Exception {
        String admin = login("admin@biofit.demo", "Demo123!");
        String email = uniqueEmail("cycle");
        long id = createAdminUser(admin, email, "FITNESS_COACH", "Coach1234!");
        mockMvc.perform(patch("/api/admin/users/" + id + "/deactivate").header("Authorization", admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("INACTIVE"));
        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(loginBody(email, "Coach1234!")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("ACCOUNT_DISABLED"));
        mockMvc.perform(patch("/api/admin/users/" + id + "/activate").header("Authorization", admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(loginBody(email, "Coach1234!")))
                .andExpect(status().isOk());
    }

    @Test
    void tcUm06InsufficientPermissions() throws Exception {
        String client = login("client@biofit.demo", "Demo123!");
        mockMvc.perform(
                        post("/api/admin/users")
                                .header("Authorization", client)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(userJson(uniqueEmail("nope"), "FITNESS_COACH", "Coach1234!")))
                .andExpect(status().isForbidden());
    }

    @Test
    void tcUm08And09DuplicateAndValidation() throws Exception {
        String admin = login("admin@biofit.demo", "Demo123!");
        String email = uniqueEmail("dup");
        createAdminUser(admin, email, "FITNESS_COACH", "Coach1234!");
        mockMvc.perform(
                        post("/api/admin/users")
                                .header("Authorization", admin)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(userJson(email, "FITNESS_COACH", "Coach1234!")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("EMAIL_EXISTS"));
        mockMvc.perform(
                        post("/api/admin/users")
                                .header("Authorization", admin)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"email\":\"\",\"role\":\"FITNESS_COACH\",\"password\":\"short\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }

    @Test
    void tcUm10And20AuditTrail() throws Exception {
        String admin = login("admin@biofit.demo", "Demo123!");
        long id = createAdminUser(admin, uniqueEmail("audit"), "MEDICAL_ADVISOR", "Coach1234!");
        mockMvc.perform(patch("/api/admin/users/" + id + "/deactivate").header("Authorization", admin))
                .andExpect(status().isOk());
        List<AuditLog> logs =
                auditLogRepository.findAll().stream()
                        .filter(log -> String.valueOf(id).equals(log.getEntityId()))
                        .toList();
        assertTrue(logs.stream().anyMatch(log -> "USER_CREATED".equals(log.getAction()) && "SUCCESS".equals(log.getResultStatus())));
        assertTrue(logs.stream().anyMatch(log -> "USER_DEACTIVATED".equals(log.getAction())));
    }

    @Test
    void tcUm12To14And23To26ManagerStaffIsolation() throws Exception {
        String admin = login("admin@biofit.demo", "Demo123!");
        String manager = login("manager@biofit.demo", "Demo123!");
        String otherEmail = uniqueEmail("harbour-manager");
        MvcResult otherCreated =
                mockMvc.perform(
                                post("/api/admin/users")
                                        .header("Authorization", admin)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(
                                                """
                                                {"firstName":"Harbour","lastName":"Manager","email":"%s","password":"Manager123!","role":"WELLNESS_CENTRE_MANAGER","wellnessCentreName":"Harbour Wellness %s"}
                                                """
                                                        .formatted(otherEmail, UUID.randomUUID())))
                        .andExpect(status().isOk())
                        .andReturn();
        int otherCentreId = JsonPath.read(otherCreated.getResponse().getContentAsString(), "$.data.wellnessCentreId");
        String otherManager = login(otherEmail, "Manager123!");

        String coachEmail = uniqueEmail("coach");
        MvcResult created =
                mockMvc.perform(
                                post("/api/manager/staff")
                                        .header("Authorization", manager)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(userJson(coachEmail, "FITNESS_COACH", "Coach1234!")))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.data.role").value("FITNESS_COACH"))
                        .andExpect(jsonPath("$.data.wellnessCentreName").value("VitalLife Wellness Centre"))
                        .andReturn();
        int staffId = JsonPath.read(created.getResponse().getContentAsString(), "$.data.userId");
        int centreId = JsonPath.read(created.getResponse().getContentAsString(), "$.data.wellnessCentreId");
        assertEquals(userRepository.findWellnessCentreIdByEmail("manager@biofit.demo").intValue(), centreId);

        mockMvc.perform(
                        post("/api/manager/staff")
                                .header("Authorization", manager)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(userJson(uniqueEmail("nutri"), "NUTRITION_CONSULTANT", "Coach1234!")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.wellnessCentreId").value(centreId));
        mockMvc.perform(
                        post("/api/manager/staff")
                                .header("Authorization", manager)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(userJson(uniqueEmail("doctor"), "MEDICAL_ADVISOR", "Coach1234!")))
                .andExpect(status().isOk());

        mockMvc.perform(
                        post("/api/manager/staff")
                                .header("Authorization", manager)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(userJson(uniqueEmail("admin-try"), "ADMIN", "Coach1234!")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));

        mockMvc.perform(get("/api/manager/staff/" + staffId).header("Authorization", otherManager))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/manager/staff").header("Authorization", otherManager))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.email == '" + coachEmail + "')]").isEmpty());

        mockMvc.perform(
                        post("/api/manager/staff")
                                .header("Authorization", manager)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        userJson(uniqueEmail("bypass"), "FITNESS_COACH", "Coach1234!")
                                                .replace(
                                                        "}",
                                                        ",\"wellnessCentreId\":" + otherCentreId + "}")))
                .andExpect(status().isForbidden());

        mockMvc.perform(
                        post("/api/manager/staff")
                                .header("Authorization", manager)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(userJson(coachEmail, "FITNESS_COACH", "Coach1234!")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("EMAIL_EXISTS"));
        mockMvc.perform(
                        post("/api/manager/staff")
                                .header("Authorization", manager)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"role\":\"FITNESS_COACH\",\"password\":\"x\"}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/manager/schedules").header("Authorization", otherManager))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.events[?(@.staffName == 'Daniel Perera')]").isEmpty());
    }

    @Test
    void tcUm16SuspendedTokenCannotAccessProtectedApi() throws Exception {
        String admin = login("admin@biofit.demo", "Demo123!");
        String email = uniqueEmail("token");
        long id = createAdminUser(admin, email, "CUSTOMER_EXPERIENCE_OFFICER", "Coach1234!");
        String staffToken = login(email, "Coach1234!");
        mockMvc.perform(get("/api/auth/me").header("Authorization", staffToken)).andExpect(status().isOk());
        mockMvc.perform(patch("/api/admin/users/" + id + "/deactivate").header("Authorization", admin))
                .andExpect(status().isOk());
        MvcResult blocked =
                mockMvc.perform(get("/api/auth/me").header("Authorization", staffToken)).andReturn();
        int blockedStatus = blocked.getResponse().getStatus();
        assertTrue(blockedStatus == 401 || blockedStatus == 403, "suspended token status was " + blockedStatus);
    }

    @Test
    void tcUm17PasswordResetDoesNotReactivate() throws Exception {
        String admin = login("admin@biofit.demo", "Demo123!");
        String email = uniqueEmail("reset");
        long id = createAdminUser(admin, email, "FITNESS_COACH", "Coach1234!");
        mockMvc.perform(patch("/api/admin/users/" + id + "/deactivate").header("Authorization", admin))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/admin/users/" + id + "/password-reset").header("Authorization", admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("INACTIVE"));
        User user = userRepository.findById(id).orElseThrow();
        assertEquals(UserStatus.INACTIVE, user.getStatus());
        user.setPasswordResetToken("reset-" + UUID.randomUUID());
        user.setPasswordResetExpiresAt(Instant.now().plusSeconds(600));
        userRepository.save(user);
        mockMvc.perform(
                        post("/api/auth/reset-password")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        "{\"token\":\""
                                                + user.getPasswordResetToken()
                                                + "\",\"newPassword\":\"Newpass123!\"}"))
                .andExpect(status().isOk());
        assertEquals(UserStatus.INACTIVE, userRepository.findById(id).orElseThrow().getStatus());
        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(loginBody(email, "Newpass123!")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("ACCOUNT_DISABLED"));
    }

    @Test
    void tcUm18UnauthorizedRoleEscalation() throws Exception {
        String doe = login("operations@biofit.demo", "Demo123!");
        mockMvc.perform(
                        post("/api/admin/users")
                                .header("Authorization", doe)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(userJson(uniqueEmail("escalation"), "ADMIN", "Coach1234!")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));
        User admin = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("admin@biofit.demo").orElseThrow();
        mockMvc.perform(
                        patch("/api/admin/users/" + admin.getId())
                                .header("Authorization", doe)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"role\":\"CLIENT\"}"))
                .andExpect(status().isForbidden());
        String adminToken = login("admin@biofit.demo", "Demo123!");
        mockMvc.perform(
                        patch("/api/admin/users/" + admin.getId())
                                .header("Authorization", adminToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"role\":\"CLIENT\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));
        assertEquals(RoleName.ADMIN, primaryRole(admin.getId()));
    }

    @Test
    void tcUm19LastActiveAdminCannotBeRemoved() throws Exception {
        String adminToken = login("admin@biofit.demo", "Demo123!");
        User seedAdmin = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("admin@biofit.demo").orElseThrow();
        List<User> others =
                userRepository.findByDeletedAtIsNull().stream()
                        .filter(user -> user.getStatus() == UserStatus.ACTIVE)
                        .filter(user -> primaryRole(user.getId()) == RoleName.ADMIN)
                        .filter(user -> !user.getId().equals(seedAdmin.getId()))
                        .toList();
        others.forEach(
                user -> {
                    user.setStatus(UserStatus.INACTIVE);
                    userRepository.save(user);
                });
        try {
            mockMvc.perform(patch("/api/admin/users/" + seedAdmin.getId() + "/deactivate").header("Authorization", adminToken))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.error.code").value("LAST_ADMIN"));
            assertEquals(UserStatus.ACTIVE, userRepository.findById(seedAdmin.getId()).orElseThrow().getStatus());
        } finally {
            others.forEach(
                    user -> {
                        User current = userRepository.findById(user.getId()).orElseThrow();
                        current.setStatus(UserStatus.ACTIVE);
                        userRepository.save(current);
                    });
        }
    }

    @Test
    void tcUm21UserDetailsMatchDatabase() throws Exception {
        String admin = login("admin@biofit.demo", "Demo123!");
        String email = uniqueEmail("details");
        long id = createAdminUser(admin, email, "MEDICAL_ADVISOR", "Coach1234!");
        mockMvc.perform(get("/api/admin/users/" + id).header("Authorization", admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.userId").value((int) id))
                .andExpect(jsonPath("$.data.email").value(email))
                .andExpect(jsonPath("$.data.firstName").value("Ada"))
                .andExpect(jsonPath("$.data.role").value("MEDICAL_ADVISOR"));
    }

    @Test
    void tcUm22And30DashboardMetricsMatchDatabase() throws Exception {
        String admin = login("admin@biofit.demo", "Demo123!");
        Instant monthStart = LocalDate.now(ZoneOffset.UTC).withDayOfMonth(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        long newUsers = userRepository.countByCreatedAtGreaterThanEqualAndDeletedAtIsNull(monthStart);
        long openTickets = supportTicketRepository.countByStatusIn(UserManagementService.OPEN_TICKET_STATUSES);
        long activeStaff =
                userRepository.countByStatusAndRoles(
                        UserStatus.ACTIVE,
                        List.of(
                                RoleName.WELLNESS_CENTRE_MANAGER,
                                RoleName.FITNESS_COACH,
                                RoleName.NUTRITION_CONSULTANT,
                                RoleName.MEDICAL_ADVISOR,
                                RoleName.CUSTOMER_EXPERIENCE_OFFICER,
                                RoleName.DIGITAL_OPERATIONS_EXECUTIVE,
                                RoleName.ADMIN));
        long inactive = userRepository.countByStatusAndDeletedAtIsNull(UserStatus.INACTIVE);
        mockMvc.perform(get("/api/admin/dashboard").header("Authorization", admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.metrics.newUsersThisMonth").value((int) newUsers))
                .andExpect(jsonPath("$.data.metrics.openTickets").value((int) openTickets))
                .andExpect(jsonPath("$.data.metrics.activeStaff").value((int) activeStaff))
                .andExpect(jsonPath("$.data.metrics.inactiveAccounts").value((int) inactive))
                .andExpect(jsonPath("$.data.metrics.usersByRole").isArray());
    }

    @Test
    void tcUm28LockedAccountCannotSignInUntilUnlock() throws Exception {
        String admin = login("admin@biofit.demo", "Demo123!");
        String email = uniqueEmail("locked");
        long id = createAdminUser(admin, email, "FITNESS_COACH", "Coach1234!");
        mockMvc.perform(patch("/api/admin/users/" + id + "/lock").header("Authorization", admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("LOCKED"));
        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(loginBody(email, "Coach1234!")))
                .andExpect(status().is(423));
        mockMvc.perform(patch("/api/admin/users/" + id + "/unlock").header("Authorization", admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
        MvcResult loginResult =
                mockMvc.perform(
                                post("/api/auth/login")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(loginBody(email, "Coach1234!")))
                        .andExpect(status().isOk())
                        .andReturn();
        assertNotNull(JsonPath.read(loginResult.getResponse().getContentAsString(), "$.data.accessToken"));
        mockMvc.perform(get("/api/admin/users/" + id).header("Authorization", admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.lastLogin").isNotEmpty());
    }

    @Test
    void tcUm29RoleFilterAndSearch() throws Exception {
        String admin = login("admin@biofit.demo", "Demo123!");
        String email = uniqueEmail("filter");
        createAdminUser(admin, email, "FITNESS_COACH", "Coach1234!");
        mockMvc.perform(get("/api/admin/users").header("Authorization", admin).param("role", "CLIENT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.role != 'CLIENT')]").isEmpty());
        mockMvc.perform(get("/api/admin/users").header("Authorization", admin).param("q", email))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].email").value(email));
        mockMvc.perform(get("/api/manager/staff").header("Authorization", login("manager@biofit.demo", "Demo123!")).param("role", "FITNESS_COACH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.role != 'FITNESS_COACH')]").isEmpty());
    }

    @Test
    void passwordResetDoesNotClearAdministrativeLock() throws Exception {
        String admin = login("admin@biofit.demo", "Demo123!");
        String email = uniqueEmail("lock-reset");
        long id = createAdminUser(admin, email, "FITNESS_COACH", "Coach1234!");
        mockMvc.perform(patch("/api/admin/users/" + id + "/lock").header("Authorization", admin)).andExpect(status().isOk());
        User user = userRepository.findById(id).orElseThrow();
        user.setPasswordResetToken("lock-reset-" + UUID.randomUUID());
        user.setPasswordResetExpiresAt(Instant.now().plusSeconds(600));
        userRepository.save(user);
        mockMvc.perform(
                        post("/api/auth/reset-password")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        "{\"token\":\""
                                                + user.getPasswordResetToken()
                                                + "\",\"newPassword\":\"Newpass123!\"}"))
                .andExpect(status().isOk());
        User after = userRepository.findById(id).orElseThrow();
        assertEquals(UserStatus.LOCKED, after.getStatus());
        assertNotEquals(UserStatus.ACTIVE, after.getStatus());
    }

    private long createAdminUser(String admin, String email, String role, String password) throws Exception {
        MvcResult result =
                mockMvc.perform(
                                post("/api/admin/users")
                                        .header("Authorization", admin)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(userJson(email, role, password)))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.data.email").value(email))
                        .andReturn();
        Number id = JsonPath.read(result.getResponse().getContentAsString(), "$.data.userId");
        return id.longValue();
    }

    private String login(String email, String password) throws Exception {
        MvcResult result =
                mockMvc.perform(
                                post("/api/auth/login")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(loginBody(email, password)))
                        .andExpect(status().isOk())
                        .andReturn();
        return "Bearer " + JsonPath.read(result.getResponse().getContentAsString(), "$.data.accessToken");
    }

    private RoleName primaryRole(long id) {
        return userRepository.findById(id).orElseThrow().getRoles().stream().map(Role::getName).findFirst().orElseThrow();
    }

    private static String uniqueEmail(String label) {
        return label + "-" + UUID.randomUUID() + "@biofit.test";
    }

    private static String loginBody(String email, String password) {
        return "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}";
    }

    private static String userJson(String email, String role, String password) {
        return "{\"firstName\":\"Ada\",\"lastName\":\"Lovelace\",\"email\":\""
                + email
                + "\",\"password\":\""
                + password
                + "\",\"role\":\""
                + role
                + "\",\"contactNumber\":\"+94112223344\"}";
    }
}
