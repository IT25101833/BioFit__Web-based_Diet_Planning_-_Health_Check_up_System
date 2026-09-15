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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/nutrition")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('NUTRITION_CONSULTANT','ADMIN')")
public class NutritionDomainController {

    private final DomainService domainService;

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.nutritionDashboard(principal.getId()));
    }

    @GetMapping("/profile")
    public ApiResponse<Map<String, Object>> profile(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.clientProfile(principal.getId()));
    }

    @PatchMapping("/profile")
    public ApiResponse<Map<String, Object>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.updateClientProfile(principal.getId(), body));
    }

    @GetMapping("/clients")
    public ApiResponse<List<Map<String, Object>>> clients() {
        return ApiResponse.ok(domainService.nutritionClients());
    }

    @GetMapping("/clients/{id}")
    public ApiResponse<Map<String, Object>> client(@PathVariable String id) {
        return ApiResponse.ok(
                domainService.nutritionClients().stream()
                        .filter(c -> id.equals(c.get("id")))
                        .findFirst()
                        .orElseThrow());
    }

    @GetMapping("/meal-plans")
    public ApiResponse<List<Map<String, Object>>> plans() {
        return ApiResponse.ok(domainService.mealPlans());
    }

    @GetMapping("/meal-plans/{id}")
    public ApiResponse<Map<String, Object>> plan(@PathVariable String id) {
        return ApiResponse.ok(domainService.mealPlan(id));
    }

    @PostMapping("/meal-plans")
    public ApiResponse<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.saveMealPlan(null, body));
    }

    @PutMapping("/meal-plans/{id}")
    public ApiResponse<Map<String, Object>> update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.saveMealPlan(id, body));
    }

    @PatchMapping("/meal-plans/{id}/archive")
    public ApiResponse<Map<String, Object>> archive(@PathVariable String id) {
        return ApiResponse.ok(domainService.archiveMealPlan(id));
    }

    @PostMapping("/meal-plans/{id}/duplicate")
    public ApiResponse<Map<String, Object>> duplicate(@PathVariable String id) {
        Map<String, Object> existing = domainService.mealPlan(id);
        existing.remove("id");
        existing.put("name", existing.get("name") + " (copy)");
        return ApiResponse.ok(domainService.saveMealPlan(null, existing));
    }

    @GetMapping("/dietary-restrictions")
    public ApiResponse<List<Map<String, Object>>> dietary() {
        return ApiResponse.ok(domainService.dietaryRestrictions());
    }

    @GetMapping("/dietary-restrictions/client/{clientId}")
    public ApiResponse<List<Map<String, Object>>> dietaryByClient(@PathVariable String clientId) {
        return ApiResponse.ok(domainService.dietaryByClient(clientId));
    }

    @PostMapping("/dietary-restrictions")
    public ApiResponse<Map<String, Object>> createDietary(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.saveDietary(null, body));
    }

    @PutMapping("/dietary-restrictions/{id}")
    public ApiResponse<Map<String, Object>> updateDietary(
            @PathVariable String id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.saveDietary(id, body));
    }

    @PatchMapping("/dietary-restrictions/{id}/deactivate")
    public ApiResponse<Map<String, Object>> deactivateDietary(@PathVariable String id) {
        return ApiResponse.ok(domainService.deactivateDietary(id));
    }

    @GetMapping("/appointments")
    public ApiResponse<List<Map<String, Object>>> appointments() {
        return ApiResponse.ok(domainService.appointmentsForRole("Nutrition"));
    }

    @GetMapping("/progress")
    public ApiResponse<List<Map<String, Object>>> progress() {
        return ApiResponse.ok(domainService.nutritionProgressRows());
    }

    @GetMapping("/progress/{clientId}")
    public ApiResponse<Map<String, Object>> clientProgress(@PathVariable String clientId) {
        return ApiResponse.ok(
                domainService.nutritionProgressRows().stream()
                        .filter(r -> clientId.equals(r.get("clientId")))
                        .findFirst()
                        .orElse(Map.of("clientId", clientId)));
    }

    @PostMapping("/progress")
    public ApiResponse<Map<String, Object>> saveProgress(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(body);
    }

    @GetMapping("/notifications")
    public ApiResponse<List<Map<String, Object>>> notifications() {
        return ApiResponse.ok(domainService.notificationsByAudience("NUTRITION"));
    }

    @PatchMapping("/notifications/{id}/read")
    public ApiResponse<Map<String, Object>> markRead(@PathVariable String id) {
        return ApiResponse.ok(domainService.markNotificationRead(id));
    }

    @PatchMapping("/notifications/read-all")
    public ApiResponse<Map<String, Object>> markAll() {
        return ApiResponse.ok(domainService.markAudienceNotificationsRead("NUTRITION"));
    }
}
