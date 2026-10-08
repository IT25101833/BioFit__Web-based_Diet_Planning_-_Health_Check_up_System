package com.biofit.backend.domain;

import com.biofit.backend.common.ApiException;
import com.biofit.backend.common.ApiResponse;
import com.biofit.backend.security.UserPrincipal;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    private final PlanAccessService planAccessService;

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.coachDashboard(principal));
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
    public ApiResponse<List<Map<String, Object>>> clients(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.coachClients(principal));
    }

    @GetMapping("/clients/{id}")
    public ApiResponse<Map<String, Object>> client(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ApiResponse.ok(domainService.coachClient(principal, id));
    }

    @GetMapping("/appointments")
    public ApiResponse<List<Map<String, Object>>> appointments(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.coachAppointments(principal));
    }

    @PatchMapping("/appointments/{id}/attendance")
    public ApiResponse<Map<String, Object>> markAttendance(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.markCoachAppointmentAttendance(principal, id, body));
    }

    @GetMapping("/workout-plans")
    public ApiResponse<List<Map<String, Object>>> plans(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.workoutPlansForCoach(principal));
    }

    @GetMapping("/workout-plans/{id}")
    public ApiResponse<Map<String, Object>> plan(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ApiResponse.ok(domainService.workoutPlanForCoach(principal, id));
    }

    @PostMapping("/workout-plans")
    public ApiResponse<Map<String, Object>> create(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.saveWorkoutPlanForCoach(principal, null, body));
    }

    @PutMapping("/workout-plans/{id}")
    public ApiResponse<Map<String, Object>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.saveWorkoutPlanForCoach(principal, id, body));
    }

    @PatchMapping("/workout-plans/{id}/archive")
    public ApiResponse<Map<String, Object>> archive(@PathVariable String id) {
        return ApiResponse.ok(domainService.archiveWorkoutPlan(id));
    }

    @DeleteMapping("/workout-plans/{id}")
    public ApiResponse<Map<String, Object>> hardDeleteDraft(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ApiResponse.ok(domainService.hardDeleteUnusedDraftWorkoutPlan(principal.getId(), id));
    }

    @PostMapping("/workout-plans/{id}/duplicate")
    public ApiResponse<Map<String, Object>> duplicate(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        Map<String, Object> existing = domainService.workoutPlanForCoach(principal, id);
        existing.remove("id");
        existing.put("name", existing.get("name") + " (copy)");
        existing.put("status", "Draft");
        existing.remove("progress");
        return ApiResponse.ok(domainService.saveWorkoutPlanForCoach(principal, null, existing));
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
    public ApiResponse<List<Map<String, Object>>> progress(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.progressRows(principal));
    }

    @GetMapping("/progress/{clientId}")
    public ApiResponse<Map<String, Object>> clientProgress(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String clientId) {
        return ApiResponse.ok(
                domainService.progressRows(principal).stream()
                        .filter(r -> clientId.equals(r.get("clientId")))
                        .findFirst()
                        .orElseGet(
                                () -> {
                                    Map<String, Object> empty = new java.util.LinkedHashMap<>();
                                    empty.put("clientId", clientId);
                                    empty.put("clientName", "");
                                    empty.put("workoutPlan", "");
                                    empty.put("currentWeek", "");
                                    empty.put("completion", null);
                                    empty.put("attendance", null);
                                    empty.put("status", "");
                                    empty.put("weeklyCompletion", java.util.List.of());
                                    empty.put("attendanceTrend", java.util.List.of());
                                    return empty;
                                }));
    }

    @PostMapping("/progress")
    public ApiResponse<Map<String, Object>> saveProgress(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(body);
    }

    @GetMapping("/notifications")
    public ApiResponse<List<Map<String, Object>>> notifications(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.notificationsForAudienceUser("COACH", principal.getId()));
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
        return ApiResponse.ok(completionService.specialistRespond(id, principal.getId(), "Fitness Coach", body));
    }

    @PatchMapping("/notifications/{id}/read")
    public ApiResponse<Map<String, Object>> markRead(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ApiResponse.ok(domainService.markNotificationRead(principal.getId(), id));
    }

    @PatchMapping("/notifications/read-all")
    public ApiResponse<Map<String, Object>> markAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.markMyAudienceNotificationsRead(principal.getId(), "COACH"));
    }

    @GetMapping("/assessments")
    public ApiResponse<List<Map<String, Object>>> assessments(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(
                completionService.fitnessAssessments().stream()
                        .filter(item -> coachAssessmentVisible(principal, item))
                        .toList());
    }

    @GetMapping("/assessments/{id}")
    public ApiResponse<Map<String, Object>> assessment(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        Map<String, Object> item = completionService.fitnessAssessment(id);
        if (!coachAssessmentVisible(principal, item)) {
            throw new ApiException(
                    "NOT_FOUND",
                    "Attend this client's appointment before viewing their fitness assessment.",
                    HttpStatus.NOT_FOUND);
        }
        return ApiResponse.ok(item);
    }

    @PostMapping("/assessments")
    public ApiResponse<Map<String, Object>> createAssessment(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        domainService.assertCoachAttendedClient(principal, body);
        return ApiResponse.ok(completionService.saveFitnessAssessment(null, body));
    }

    @PutMapping("/assessments/{id}")
    public ApiResponse<Map<String, Object>> updateAssessment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        domainService.assertCoachAttendedClient(principal, body);
        return ApiResponse.ok(completionService.saveFitnessAssessment(id, body));
    }

    @GetMapping("/health-risk-alerts")
    public ApiResponse<List<Map<String, Object>>> fitnessAlerts(
            @AuthenticationPrincipal UserPrincipal principal) {
        java.util.Set<Long> attended = domainService.coachAttendedClientIds(principal);
        return ApiResponse.ok(
                planAccessService.alertsForCategory("Fitness").stream()
                        .filter(
                                alert -> {
                                    Object userId = alert.get("userId");
                                    return userId instanceof Number number && attended.contains(number.longValue());
                                })
                        .toList());
    }

    private boolean coachAssessmentVisible(UserPrincipal principal, Map<String, Object> item) {
        Long clientUserId = null;
        Object raw = item.get("clientUserId");
        if (raw instanceof Number number) clientUserId = number.longValue();
        return domainService.coachHasAttendedClient(
                principal, clientUserId, item.get("clientId") == null ? null : String.valueOf(item.get("clientId")));
    }
}
