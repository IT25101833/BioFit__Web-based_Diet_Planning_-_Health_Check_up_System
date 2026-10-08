package com.biofit.backend.domain;

import com.biofit.backend.common.ApiResponse;
import com.biofit.backend.security.UserPrincipal;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/client")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('CLIENT','ADMIN')")
public class ClientDomainController {

    private final DomainService domainService;
    private final CompletionService completionService;
    private final BookingAvailabilityService bookingAvailabilityService;
    private final MedicalReviewRequestService medicalReviewRequestService;
    private final PlanAccessService planAccessService;
    private final MedicalRequestService medicalRequestService;

    @GetMapping("/booking/catalog")
    public ApiResponse<Map<String, Object>> bookingCatalog(
            @RequestParam(defaultValue = "CLIENT") String audience) {
        return ApiResponse.ok(bookingAvailabilityService.bookingCatalog(audience));
    }

    @GetMapping("/booking/availability")
    public ApiResponse<Map<String, Object>> bookingAvailability(
            @RequestParam String professionalId,
            @RequestParam String date,
            @RequestParam(defaultValue = "45 min") String duration,
            @RequestParam(required = false) String excludeAppointmentId) {
        return ApiResponse.ok(
                bookingAvailabilityService.dayAvailability(
                        professionalId, date, duration, excludeAppointmentId));
    }

    @GetMapping("/programmes")
    public ApiResponse<List<Map<String, Object>>> programmes(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.clientProgrammes(principal.getId()));
    }

    @GetMapping("/programmes/{id}")
    public ApiResponse<Map<String, Object>> programme(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ApiResponse.ok(domainService.clientProgramme(principal.getId(), id));
    }

    @GetMapping("/appointments")
    public ApiResponse<List<Map<String, Object>>> appointments(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.clientAppointments(principal.getId()));
    }

    @GetMapping("/appointments/{id}")
    public ApiResponse<Map<String, Object>> appointment(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ApiResponse.ok(domainService.clientAppointment(principal.getId(), id));
    }

    @PostMapping("/appointments")
    public ApiResponse<Map<String, Object>> createAppointment(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.createClientAppointment(principal.getId(), body));
    }

    @PatchMapping("/appointments/{id}/cancel")
    public ApiResponse<Map<String, Object>> cancelAppointment(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ApiResponse.ok(domainService.cancelClientAppointment(principal.getId(), id));
    }

    @PatchMapping("/appointments/{id}/reschedule")
    public ApiResponse<Map<String, Object>> rescheduleAppointment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.rescheduleClientAppointment(principal.getId(), id, body));
    }

    @GetMapping("/workout-plan")
    public ApiResponse<Map<String, Object>> workoutPlan(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.clientWorkoutPlan(principal.getId()));
    }

    @GetMapping("/fitness-progress")
    public ApiResponse<Map<String, Object>> fitnessProgress(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.clientFitnessProgress(principal.getId()));
    }

    @GetMapping("/meal-plan")
    public ApiResponse<Map<String, Object>> mealPlan(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.clientMealPlan(principal.getId()));
    }

    @GetMapping("/nutrition-progress")
    public ApiResponse<Map<String, Object>> nutritionProgress(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.clientNutritionProgress(principal.getId()));
    }

    @GetMapping("/notifications")
    public ApiResponse<List<Map<String, Object>>> notifications(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.clientNotifications(principal.getId()));
    }

    @GetMapping("/review-requests/pending")
    public ApiResponse<List<Map<String, Object>>> pendingReviewRequests(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(medicalReviewRequestService.pendingForClient(principal.getId()));
    }

    @GetMapping("/review-requests/{id}")
    public ApiResponse<Map<String, Object>> reviewRequest(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ApiResponse.ok(medicalReviewRequestService.getForClient(principal.getId(), id));
    }

    @PostMapping("/review-requests/{id}/book")
    public ApiResponse<Map<String, Object>> bookReviewRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(medicalReviewRequestService.bookTime(principal.getId(), id, body));
    }

    @GetMapping("/notifications/unread-count")
    public ApiResponse<Map<String, Object>> unreadNotificationCount(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(
                Map.of("count", domainService.clientUnreadNotificationCount(principal.getId())));
    }

    @PatchMapping("/notifications/{id}/read")
    public ApiResponse<Map<String, Object>> markRead(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ApiResponse.ok(domainService.markNotificationRead(principal.getId(), id));
    }

    @PatchMapping("/notifications/read-all")
    public ApiResponse<Map<String, Object>> markAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.markAllNotificationsRead(principal.getId()));
    }

    @GetMapping("/support")
    public ApiResponse<List<Map<String, Object>>> tickets(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.clientTickets(principal.getId()));
    }

    @GetMapping("/support/{id}")
    public ApiResponse<Map<String, Object>> ticket(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ApiResponse.ok(domainService.clientTicket(principal.getId(), id));
    }

    @PostMapping("/support")
    public ApiResponse<Map<String, Object>> createTicket(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.createClientTicket(principal.getId(), body));
    }

    @PostMapping("/support/{id}/replies")
    public ApiResponse<Map<String, Object>> reply(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.replyClientTicket(principal.getId(), id, body));
    }

    @PostMapping("/support/{id}/reopen")
    public ApiResponse<Map<String, Object>> reopen(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> body) {
        return ApiResponse.ok(
                domainService.reopenClientTicket(
                        principal.getId(), id, body == null ? Map.of() : body));
    }

    @DeleteMapping("/support/{id}")
    public ApiResponse<Map<String, Object>> deleteTicket(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ApiResponse.ok(domainService.deleteClientTicket(principal.getId(), id));
    }

    @PostMapping("/inquiries")
    public ApiResponse<Map<String, Object>> createInquiry(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(completionService.createClientInquiry(principal.getId(), body));
    }

    @GetMapping("/profile")
    public ApiResponse<Map<String, Object>> profile(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.clientProfile(principal.getId()));
    }

    @PutMapping("/profile")
    public ApiResponse<Map<String, Object>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.updateClientProfile(principal.getId(), body));
    }

    @GetMapping("/plan-access-requests")
    public ApiResponse<List<Map<String, Object>>> planAccessRequests(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(planAccessService.listForClient(principal));
    }

    @PostMapping("/plan-access-requests/{id}/decide")
    public ApiResponse<Map<String, Object>> decidePlanAccess(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String decision =
                body.get("status") != null ? String.valueOf(body.get("status")) : String.valueOf(body.get("decision"));
        String reason = body.get("rejectionReason") == null ? null : String.valueOf(body.get("rejectionReason"));
        return ApiResponse.ok(planAccessService.decide(principal, id, decision, reason));
    }

    @PostMapping("/plan-access-requests/{id}/revoke")
    public ApiResponse<Map<String, Object>> revokePlanAccess(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return ApiResponse.ok(planAccessService.revoke(principal, id));
    }

    @GetMapping("/medical-advisors")
    public ApiResponse<List<Map<String, Object>>> medicalAdvisors() {
        return ApiResponse.ok(medicalRequestService.listAdvisors());
    }

    @GetMapping("/medical-requests/time-slots")
    public ApiResponse<List<String>> medicalRequestTimeSlots(
            @RequestParam(required = false) String date) {
        return ApiResponse.ok(
                date == null || date.isBlank()
                        ? medicalRequestService.preferredTimeSlots()
                        : medicalRequestService.preferredTimeSlots(date));
    }

    @GetMapping("/medical-requests")
    public ApiResponse<List<Map<String, Object>>> medicalRequests(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(medicalRequestService.listForClient(principal));
    }

    @PostMapping("/medical-requests")
    public ApiResponse<Map<String, Object>> createMedicalRequest(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(medicalRequestService.submit(principal, body));
    }

    @GetMapping("/medical-requests/{id}")
    public ApiResponse<Map<String, Object>> medicalRequest(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return ApiResponse.ok(medicalRequestService.getForClient(principal, id));
    }

    @PostMapping("/medical-requests/{id}/cancel")
    public ApiResponse<Map<String, Object>> cancelMedicalRequest(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return ApiResponse.ok(medicalRequestService.cancel(principal, id));
    }
}
