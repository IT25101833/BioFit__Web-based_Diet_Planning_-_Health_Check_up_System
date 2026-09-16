package com.biofit.backend.domain;

import com.biofit.backend.common.ApiResponse;
import com.biofit.backend.security.UserPrincipal;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    private final BookingAvailabilityService bookingAvailabilityService;

    @GetMapping("/booking/catalog")
    public ApiResponse<Map<String, Object>> bookingCatalog(
            @RequestParam(defaultValue = "CLIENT") String audience) {
        return ApiResponse.ok(bookingAvailabilityService.bookingCatalog(audience));
    }

    @GetMapping("/booking/availability")
    public ApiResponse<Map<String, Object>> bookingAvailability(
            @RequestParam String professionalId,
            @RequestParam String date,
            @RequestParam(defaultValue = "45 min") String duration) {
        return ApiResponse.ok(bookingAvailabilityService.dayAvailability(professionalId, date, duration));
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

    @PatchMapping("/notifications/{id}/read")
    public ApiResponse<Map<String, Object>> markRead(@PathVariable String id) {
        return ApiResponse.ok(domainService.markNotificationRead(id));
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

    @GetMapping("/profile")
    public ApiResponse<Map<String, Object>> profile(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.clientProfile(principal.getId()));
    }

    @PutMapping("/profile")
    public ApiResponse<Map<String, Object>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.updateClientProfile(principal.getId(), body));
    }
}
