package com.biofit.backend.domain;

import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.biofit.backend.security.JwtService;
import com.biofit.backend.support.AuditObserver;
import com.biofit.backend.support.NotificationObserver;
import com.biofit.backend.support.SupportTicketEventPublisher;
import com.biofit.backend.support.TicketObserver;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import com.jayway.jsonpath.JsonPath;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
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
            "spring.datasource.url=jdbc:h2:mem:supportflow;DB_CLOSE_DELAY=-1",
            "biofit.seed-demo-data=true",
            "biofit.bootstrap-accounts=true"
        })
class SupportTicketFlowTest {

    private static final String NOTE = "STAFF-ONLY-NOTE-9f3a";

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository userRepository;
    @Autowired private SupportTicketRepository supportTicketRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private SupportTicketEventPublisher ticketPublisher;

    private User client;
    private User support;
    private User medical;
    private User nutrition;
    private User coach;

    @BeforeEach
    void cleanTickets() {
        notificationRepository.deleteAll();
        supportTicketRepository.deleteAll();
        client = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("client@biofit.local").orElseThrow();
        support = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("support@biofit.demo").orElseThrow();
        medical = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("medical@biofit.demo").orElseThrow();
        nutrition = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("nutrition@biofit.demo").orElseThrow();
        coach = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("coach@biofit.demo").orElseThrow();
    }

    @Test
    void observersAreRegisteredAndCreatePublishesNotificationAndAudit() throws Exception {
        assertTrue(ticketPublisher.registeredObservers().stream().anyMatch(o -> o instanceof NotificationObserver));
        assertTrue(ticketPublisher.registeredObservers().stream().anyMatch(o -> o instanceof AuditObserver));
        assertEquals(2, ticketPublisher.registeredObservers().stream().map(TicketObserver::getClass).distinct().count());

        String id = createTicket("Observer check", "Please help with my booking.");
        String stored = supportTicketRepository.findById(id).orElseThrow().getActivityJson();
        assertTrue(stored.contains("TICKET_CREATED"));
        assertEquals(1, stored.split("TICKET_CREATED", -1).length - 1);

        List<NotificationEntity> created =
                notificationRepository.findAll().stream()
                        .filter(n -> "TICKET_CREATED".equals(n.getEventType()))
                        .filter(n -> id.equals(n.getTicketId()))
                        .toList();
        assertFalse(created.isEmpty());
        assertTrue(created.stream().allMatch(n -> "SUPPORT".equals(n.getAudience())));
        assertTrue(created.stream().anyMatch(n -> support.getId().equals(n.getUserId())));
        assertEquals(1, created.stream().filter(n -> support.getId().equals(n.getUserId())).count());
    }

    @Test
    void dashboardUsesRealCountsIncludingZero() throws Exception {
        mockMvc.perform(get("/api/support/dashboard").header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stats.openTickets.value").value(0))
                .andExpect(jsonPath("$.data.stats.inProgress.value").value(0))
                .andExpect(jsonPath("$.data.stats.resolvedToday.value").value(0))
                .andExpect(jsonPath("$.data.stats.escalated.value").value(0))
                .andExpect(jsonPath("$.data.categoryBreakdown.length()").value(0));

        createTicket("Dashboard ticket", "A real open ticket.");
        long open =
                supportTicketRepository.findAll().stream().filter(t -> "Open".equals(t.getStatus())).count();
        mockMvc.perform(get("/api/support/dashboard").header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stats.openTickets.value").value((int) open))
                .andExpect(jsonPath("$.data.stats.resolvedToday.value").value(0));
    }

    @Test
    void internalNoteIsStoredForSupportAndHiddenFromClient() throws Exception {
        String id = createTicket("Privacy", "Client can see this.");
        mockMvc.perform(
                        patch("/api/support/tickets/" + id)
                                .header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"internal\":true,\"note\":\"" + NOTE + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.messages[?(@.body == '" + NOTE + "')].visibility").value("INTERNAL_NOTE"));

        String stored = supportTicketRepository.findById(id).orElseThrow().getMessagesJson();
        assertTrue(stored.contains(NOTE));

        mockMvc.perform(get("/api/support/tickets/" + id).header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.messages[?(@.body == '" + NOTE + "')]").isNotEmpty());

        String clientBody =
                mockMvc.perform(get("/api/client/support/" + id).header("Authorization", bearer(client, "CLIENT")))
                        .andExpect(status().isOk())
                        .andReturn()
                        .getResponse()
                        .getContentAsString();
        assertFalse(clientBody.contains(NOTE));
        assertFalse(clientBody.contains("INTERNAL_NOTE"));
        assertFalse(clientBody.contains("escalation"));
    }

    @Test
    void markAllReadUpdatesOnlyTheSignedInUser() throws Exception {
        NotificationEntity mine = notification("ntf-mine01", support.getId(), "SUPPORT");
        NotificationEntity other = notification("ntf-other1", medical.getId(), "SUPPORT");
        notificationRepository.save(mine);
        notificationRepository.save(other);

        mockMvc.perform(
                        patch("/api/support/notifications/read-all")
                                .header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.updated").value(1));

        assertTrue(notificationRepository.findById("ntf-mine01").orElseThrow().isReadFlag());
        assertFalse(notificationRepository.findById("ntf-other1").orElseThrow().isReadFlag());
    }

    @Test
    void invalidCloseAndWrongSpecialistAreRejected() throws Exception {
        String id = createTicket("Rules", "Need a ruling.");
        mockMvc.perform(
                        patch("/api/support/tickets/" + id)
                                .header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"status\":\"Closed\"}"))
                .andExpect(status().isConflict());

        assignAndStart(id);
        escalate(id, "Nutrition Consultant", "Meal plan question");
        mockMvc.perform(
                        post("/api/medical/escalations/" + id + "/respond")
                                .header("Authorization", bearer(medical, "MEDICAL_ADVISOR"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"message\":\"This is not my case.\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/nutrition/escalations").header("Authorization", bearer(nutrition, "NUTRITION_CONSULTANT")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.id == '" + id + "')]").isNotEmpty());
        mockMvc.perform(get("/api/medical/escalations").header("Authorization", bearer(medical, "MEDICAL_ADVISOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.id == '" + id + "')]").isEmpty());
    }

    @Test
    void endToEndSupportEscalationResolveReopenAndClose() throws Exception {
        String id = createTicket("Knee pain after workout", "The new plan hurts my knee.");
        assertTrue(
                notificationRepository.findAll().stream()
                        .anyMatch(n -> "TICKET_CREATED".equals(n.getEventType()) && support.getId().equals(n.getUserId())));

        assignAndStart(id);
        assertTrue(
                notificationRepository.findAll().stream()
                        .anyMatch(
                                n ->
                                        "TICKET_ASSIGNED".equals(n.getEventType())
                                                && support.getId().equals(n.getUserId())));

        mockMvc.perform(
                        patch("/api/support/tickets/" + id)
                                .header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"message\":\"I am checking this with our medical advisor.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("Pending Client Reply"))
                .andExpect(jsonPath("$.data.waitingOn").value("Client"));

        mockMvc.perform(
                        post("/api/client/support/" + id + "/replies")
                                .header("Authorization", bearer(client, "CLIENT"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"message\":\"It still hurts when I squat.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("In Progress"))
                .andExpect(jsonPath("$.data.waitingOn").value("Support"));

        escalate(id, "Medical Advisor", "Client reports knee pain during squats.");
        mockMvc.perform(get("/api/coach/escalations").header("Authorization", bearer(coach, "FITNESS_COACH")))
                .andExpect(jsonPath("$.data[?(@.id == '" + id + "')]").isEmpty());

        mockMvc.perform(
                        post("/api/medical/escalations/" + id + "/respond")
                                .header("Authorization", bearer(medical, "MEDICAL_ADVISOR"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"message\":\"Pause squats and book a check-up.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("In Progress"))
                .andExpect(jsonPath("$.data.waitingOn").value("Support"))
                .andExpect(jsonPath("$.data.escalation.status").value("Responded"));
        mockMvc.perform(get("/api/medical/escalations").header("Authorization", bearer(medical, "MEDICAL_ADVISOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.id == '" + id + "')]").isEmpty());

        mockMvc.perform(get("/api/support/tickets/" + id).header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER")))
                .andExpect(jsonPath("$.data.escalation.specialistResponse").value("Pause squats and book a check-up."));
        assertTrue(
                notificationRepository.findAll().stream()
                        .anyMatch(
                                n ->
                                        "SPECIALIST_RESPONDED".equals(n.getEventType())
                                                && support.getId().equals(n.getUserId())));

        String clientAfterSpecialist =
                mockMvc.perform(get("/api/client/support/" + id).header("Authorization", bearer(client, "CLIENT")))
                        .andReturn()
                        .getResponse()
                        .getContentAsString();
        assertFalse(clientAfterSpecialist.contains("Pause squats"));

        mockMvc.perform(
                        patch("/api/support/tickets/" + id)
                                .header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"message\":\"Please pause squats and book a health check-up.\"}"))
                .andExpect(jsonPath("$.data.status").value("Pending Client Reply"));

        mockMvc.perform(
                        patch("/api/support/tickets/" + id)
                                .header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"status\":\"Resolved\",\"resolution\":{\"summary\":\"Advised to pause squats and book a check-up.\",\"category\":\"Guidance\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("Resolved"))
                .andExpect(jsonPath("$.data.resolution.summary").value("Advised to pause squats and book a check-up."));

        mockMvc.perform(
                        post("/api/client/support/" + id + "/reopen")
                                .header("Authorization", bearer(client, "CLIENT"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"message\":\"The pain is still there.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("In Progress"))
                .andExpect(jsonPath("$.data.waitingOn").value("Support"))
                .andExpect(jsonPath("$.data.resolution").value(nullValue()));
        assertTrue(
                notificationRepository.findAll().stream()
                        .anyMatch(n -> "TICKET_REOPENED".equals(n.getEventType()) && support.getId().equals(n.getUserId())));

        mockMvc.perform(
                        patch("/api/support/tickets/" + id)
                                .header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"status\":\"Resolved\",\"resolution\":{\"summary\":\"Check-up booked and plan adjusted.\",\"category\":\"Resolved\"}}"))
                .andExpect(status().isOk());
        mockMvc.perform(
                        patch("/api/support/tickets/" + id)
                                .header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"status\":\"Closed\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("Closed"));

        String activity = supportTicketRepository.findById(id).orElseThrow().getActivityJson();
        assertTrue(activity.contains("TICKET_CREATED"));
        assertTrue(activity.contains("TICKET_ASSIGNED"));
        assertTrue(activity.contains("TICKET_ESCALATED"));
        assertTrue(activity.contains("SPECIALIST_RESPONDED"));
        assertTrue(activity.contains("TICKET_RESOLVED"));
        assertTrue(activity.contains("TICKET_REOPENED"));
        assertTrue(activity.contains("TICKET_CLOSED"));
        assertEquals(1, activity.split("TICKET_ESCALATED", -1).length - 1);
    }

    @Test
    void respondedEscalationLeavesTheSpecialistQueue() throws Exception {
        String id = createTicket("Queue exit", "Need a medical look.");
        assignAndStart(id);
        escalate(id, "Medical Advisor", "Please review the symptoms.");
        mockMvc.perform(get("/api/medical/escalations").header("Authorization", bearer(medical, "MEDICAL_ADVISOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.id == '" + id + "')]").isNotEmpty());

        mockMvc.perform(
                        post("/api/medical/escalations/" + id + "/respond")
                                .header("Authorization", bearer(medical, "MEDICAL_ADVISOR"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"message\":\"Rest and book a check-up.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("In Progress"))
                .andExpect(jsonPath("$.data.waitingOn").value("Support"))
                .andExpect(jsonPath("$.data.escalation.status").value("Responded"));

        mockMvc.perform(get("/api/medical/escalations").header("Authorization", bearer(medical, "MEDICAL_ADVISOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.id == '" + id + "')]").isEmpty());
    }

    @Test
    void invalidAssigneeIsRejectedAndNotStored() throws Exception {
        String id = createTicket("Bad assign", "Please assign a real officer.");
        mockMvc.perform(
                        patch("/api/support/tickets/" + id)
                                .header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"assignedTo\":\"Batman\"}"))
                .andExpect(status().isBadRequest());

        SupportTicketEntity stored = supportTicketRepository.findById(id).orElseThrow();
        assertEquals("Open", stored.getStatus());
        assertTrue(stored.getAssignedTo() == null || stored.getAssignedTo().isBlank());
        assertFalse(stored.getMessagesJson() != null && stored.getMessagesJson().contains("Batman"));
    }

    @Test
    void waitingPartyFollowsStatusAndClockResetsOnlyWhenThePartyChanges() throws Exception {
        String id = createTicket("Waiting clock", "Track who the ticket is waiting on.");
        SupportTicketEntity created = supportTicketRepository.findById(id).orElseThrow();
        assertEquals("Support", created.getWaitingOn());
        java.time.Instant openedAt = created.getWaitingSince();

        Thread.sleep(30);
        assignAndStart(id);
        SupportTicketEntity started = supportTicketRepository.findById(id).orElseThrow();
        assertEquals("In Progress", started.getStatus());
        assertEquals("Support", started.getWaitingOn());
        assertEquals(openedAt, started.getWaitingSince());

        Thread.sleep(30);
        mockMvc.perform(
                        patch("/api/support/tickets/" + id)
                                .header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"status\":\"Pending Client Reply\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.waitingOn").value("Client"));
        SupportTicketEntity pending = supportTicketRepository.findById(id).orElseThrow();
        assertTrue(pending.getWaitingSince().isAfter(openedAt));

        Thread.sleep(30);
        mockMvc.perform(
                        patch("/api/support/tickets/" + id)
                                .header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"message\":\"Please confirm the appointment time.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("Pending Client Reply"))
                .andExpect(jsonPath("$.data.waitingOn").value("Client"));
        assertEquals(pending.getWaitingSince(), supportTicketRepository.findById(id).orElseThrow().getWaitingSince());

        Thread.sleep(30);
        mockMvc.perform(
                        post("/api/client/support/" + id + "/replies")
                                .header("Authorization", bearer(client, "CLIENT"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"message\":\"Friday afternoon works.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("In Progress"))
                .andExpect(jsonPath("$.data.waitingOn").value("Support"));
        assertTrue(
                supportTicketRepository.findById(id).orElseThrow().getWaitingSince().isAfter(pending.getWaitingSince()));
    }

    @Test
    void clientReplyDuringEscalationStaysWithTheSpecialist() throws Exception {
        String id = createTicket("More detail", "My knee still hurts.");
        assignAndStart(id);
        escalate(id, "Medical Advisor", "Pain during squats.");
        java.time.Instant waiting = supportTicketRepository.findById(id).orElseThrow().getWaitingSince();

        Thread.sleep(30);
        mockMvc.perform(
                        post("/api/client/support/" + id + "/replies")
                                .header("Authorization", bearer(client, "CLIENT"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"message\":\"It is worse on stairs.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("Escalated"))
                .andExpect(jsonPath("$.data.waitingOn").value("Specialist"));

        SupportTicketEntity stored = supportTicketRepository.findById(id).orElseThrow();
        assertEquals("Escalated", stored.getStatus());
        assertEquals("Specialist", stored.getWaitingOn());
        assertEquals(waiting, stored.getWaitingSince());
        assertTrue(stored.getMessagesJson().contains("It is worse on stairs."));
        assertTrue(stored.getActivityJson().contains("CLIENT_REPLIED"));
        assertFalse(stored.getActivityJson().contains("TICKET_REOPENED"));

        mockMvc.perform(get("/api/medical/escalations").header("Authorization", bearer(medical, "MEDICAL_ADVISOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.id == '" + id + "')].messages[?(@.body == 'It is worse on stairs.')]").isNotEmpty());
    }

    @Test
    void supportProfileUsesStoredAccountFieldsOnly() throws Exception {
        mockMvc.perform(get("/api/support/profile").header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.firstName").value("Priya"))
                .andExpect(jsonPath("$.data.lastName").value("Nair"))
                .andExpect(jsonPath("$.data.email").value("support@biofit.demo"))
                .andExpect(jsonPath("$.data.role").value("Customer Experience Officer"))
                .andExpect(jsonPath("$.data.department").doesNotExist())
                .andExpect(jsonPath("$.data.team").doesNotExist())
                .andExpect(jsonPath("$.data.workingHours").doesNotExist())
                .andExpect(jsonPath("$.data.bio").doesNotExist())
                .andExpect(jsonPath("$.data.skills").doesNotExist());

        mockMvc.perform(
                        patch("/api/support/profile")
                                .header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        "{\"contactNumber\":\"+94 77 000 0000\",\"specialization\":\"Client care\",\"bio\":\"Not stored\",\"department\":\"Fake desk\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.contactNumber").value("+94 77 000 0000"))
                .andExpect(jsonPath("$.data.specialization").value("Client care"))
                .andExpect(jsonPath("$.data.bio").doesNotExist())
                .andExpect(jsonPath("$.data.department").doesNotExist());
    }

    private String createTicket(String subject, String description) throws Exception {
        MvcResult created =
                mockMvc.perform(
                                post("/api/client/support")
                                        .header("Authorization", bearer(client, "CLIENT"))
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(
                                                "{\"subject\":\""
                                                        + subject
                                                        + "\",\"description\":\""
                                                        + description
                                                        + "\",\"priority\":\"High\",\"category\":\"Health Check-up Support\"}"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.data.status").value("Open"))
                        .andExpect(jsonPath("$.data.waitingOn").value("Support"))
                        .andReturn();
        return JsonPath.read(created.getResponse().getContentAsString(), "$.data.id");
    }

    private void assignAndStart(String id) throws Exception {
        mockMvc.perform(
                        patch("/api/support/tickets/" + id)
                                .header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"assignedTo\":\"Priya Nair\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("Assigned"))
                .andExpect(jsonPath("$.data.assignedTo").value("Priya Nair"));
        mockMvc.perform(
                        patch("/api/support/tickets/" + id)
                                .header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"status\":\"In Progress\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("In Progress"));
    }

    private void escalate(String id, String destination, String reason) throws Exception {
        mockMvc.perform(
                        patch("/api/support/tickets/" + id)
                                .header("Authorization", bearer(support, "CUSTOMER_EXPERIENCE_OFFICER"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        "{\"escalation\":{\"escalatedTo\":\""
                                                + destination
                                                + "\",\"reason\":\""
                                                + reason
                                                + "\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("Escalated"))
                .andExpect(jsonPath("$.data.waitingOn").value("Specialist"));
    }

    private NotificationEntity notification(String id, Long userId, String audience) {
        NotificationEntity notification = new NotificationEntity();
        notification.setId(id);
        notification.setUserId(userId);
        notification.setAudience(audience);
        notification.setType("tickets");
        notification.setEventType("TICKET_ASSIGNED");
        notification.setTitle("Test");
        notification.setBody("Test");
        notification.setReadFlag(false);
        notification.setCreatedAt(java.time.Instant.now());
        return notification;
    }

    private String bearer(User user, String role) {
        return "Bearer " + jwtService.createAccessToken(user.getId(), user.getEmail(), List.of(role));
    }
}
