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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/coach")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('FITNESS_COACH','ADMIN')")
public class CoachDomainController {

    private final DomainService domainService;
    private final CompletionService completionService;

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.coachDashboard(principal.getId()));
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
        return ApiResponse.ok(domainService.coachClients());
    }

    @GetMapping("/clients/{id}")
    public ApiResponse<Map<String, Object>> client(@PathVariable String id) {
        return ApiResponse.ok(
                domainService.coachClients().stream()
                        .filter(c -> id.equals(c.get("id")))
                        .findFirst()
                        .orElseThrow());
    }

    @GetMapping("/workout-plans")
    public ApiResponse<List<Map<String, Object>>> plans() {
        return ApiResponse.ok(domainService.workoutPlans());
    }

    @GetMapping("/workout-plans/{id}")
    public ApiResponse<Map<String, Object>> plan(@PathVariable String id) {
        return ApiResponse.ok(domainService.workoutPlan(id));
    }

    @PostMapping("/workout-plans")
    public ApiResponse<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.saveWorkoutPlan(null, body));
    }

    @PutMapping("/workout-plans/{id}")
    public ApiResponse<Map<String, Object>> update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.saveWorkoutPlan(id, body));
    }

    @PatchMapping("/workout-plans/{id}/archive")
    public ApiResponse<Map<String, Object>> archive(@PathVariable String id) {
        return ApiResponse.ok(domainService.archiveWorkoutPlan(id));
    }

    @PostMapping("/workout-plans/{id}/duplicate")
    public ApiResponse<Map<String, Object>> duplicate(@PathVariable String id) {
        Map<String, Object> existing = domainService.workoutPlan(id);
        existing.remove("id");
        existing.put("name", existing.get("name") + " (copy)");
        return ApiResponse.ok(domainService.saveWorkoutPlan(null, existing));
    }

    @GetMapping("/exercises")
    public ApiResponse<List<Map<String, Object>>> exercises() {
        return ApiResponse.ok(domainService.exercises());
    }

    @GetMapping("/exercises/{id}")
    public ApiResponse<Map<String, Object>> exercise(@PathVariable String id) {
        return ApiResponse.ok(domainService.exercise(id));
    }

    @PostMapping("/exercises")
    public ApiResponse<Map<String, Object>> createExercise(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.saveExercise(null, body));
    }

    @PutMapping("/exercises/{id}")
    public ApiResponse<Map<String, Object>> updateExercise(
            @PathVariable String id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.saveExercise(id, body));
    }

    @DeleteMapping("/exercises/{id}")
    public ApiResponse<Map<String, Object>> deleteExercise(@PathVariable String id) {
        domainService.deleteExercise(id);
        return ApiResponse.ok(Map.of("id", id, "deleted", true));
    }

    @GetMapping("/progress")
    public ApiResponse<List<Map<String, Object>>> progress() {
        return ApiResponse.ok(domainService.progressRows());
    }

    @GetMapping("/progress/{clientId}")
    public ApiResponse<Map<String, Object>> clientProgress(@PathVariable String clientId) {
        return ApiResponse.ok(
                domainService.progressRows().stream()
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
        return ApiResponse.ok(domainService.notificationsByAudience("COACH"));
    }

    @GetMapping("/escalations")
    public ApiResponse<List<Map<String, Object>>> escalations() {
        return ApiResponse.ok(completionService.escalatedTicketsFor("Fitness Coach"));
    }

    @PostMapping("/escalations/{id}/respond")
    public ApiResponse<Map<String, Object>> respondEscalation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        String author = principal == null ? "Fitness Coach" : principal.getUsername();
        return ApiResponse.ok(completionService.specialistRespond(id, author, body));
    }

    @PatchMapping("/notifications/{id}/read")
    public ApiResponse<Map<String, Object>> markRead(@PathVariable String id) {
        return ApiResponse.ok(domainService.markNotificationRead(id));
    }

    @PatchMapping("/notifications/read-all")
    public ApiResponse<Map<String, Object>> markAll() {
        return ApiResponse.ok(domainService.markAudienceNotificationsRead("COACH"));
    }

    @GetMapping("/assessments")
    public ApiResponse<List<Map<String, Object>>> assessments() {
        return ApiResponse.ok(completionService.fitnessAssessments());
    }

    @GetMapping("/assessments/{id}")
    public ApiResponse<Map<String, Object>> assessment(@PathVariable String id) {
        return ApiResponse.ok(completionService.fitnessAssessment(id));
    }

    @PostMapping("/assessments")
    public ApiResponse<Map<String, Object>> createAssessment(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(completionService.saveFitnessAssessment(null, body));
    }

    @PutMapping("/assessments/{id}")
    public ApiResponse<Map<String, Object>> updateAssessment(
            @PathVariable String id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(completionService.saveFitnessAssessment(id, body));
    }
}
