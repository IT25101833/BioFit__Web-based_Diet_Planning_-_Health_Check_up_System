package com.biofit.backend.domain;

import com.biofit.backend.common.ApiResponse;
import com.biofit.backend.security.UserPrincipal;
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
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@PreAuthorize(
        "hasAnyRole('WELLNESS_CENTRE_MANAGER','FITNESS_COACH','NUTRITION_CONSULTANT','MEDICAL_ADVISOR','CUSTOMER_EXPERIENCE_OFFICER','DIGITAL_OPERATIONS_EXECUTIVE','ADMIN')")
public class StaffDomainController {

    private final BookingAvailabilityService bookingAvailabilityService;
    private final DomainService domainService;

    @GetMapping("/booking/catalog")
    public ApiResponse<Map<String, Object>> bookingCatalog(
            @RequestParam(defaultValue = "STAFF") String audience) {
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

    @GetMapping("/appointments")
    public ApiResponse<java.util.List<Map<String, Object>>> appointments(
            @AuthenticationPrincipal UserPrincipal principal) {
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
        body.putIfAbsent("audience", "STAFF");
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

    @GetMapping("/availability")
    public ApiResponse<Map<String, Object>> profile(@RequestParam String professionalId) {
        return ApiResponse.ok(bookingAvailabilityService.availabilityProfile(professionalId));
    }

    @PutMapping("/availability/hours")
    public ApiResponse<Map<String, Object>> saveHours(@RequestBody Map<String, Object> body) {
        String professionalId = String.valueOf(body.get("professionalId"));
        @SuppressWarnings("unchecked")
        Map<String, Object> weekly = (Map<String, Object>) body.get("weeklyHours");
        return ApiResponse.ok(bookingAvailabilityService.saveWeeklyHours(professionalId, weekly));
    }

    @PostMapping("/availability/blocks")
    public ApiResponse<Map<String, Object>> addBlock(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(bookingAvailabilityService.addBlock(body));
    }

    @DeleteMapping("/availability/blocks/{id}")
    public ApiResponse<Map<String, Object>> removeBlock(@PathVariable String id) {
        return ApiResponse.ok(bookingAvailabilityService.removeBlock(id));
    }
}
