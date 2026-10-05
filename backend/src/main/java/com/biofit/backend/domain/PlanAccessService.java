package com.biofit.backend.domain;

import com.biofit.backend.audit.AuditService;
import com.biofit.backend.common.ApiException;
import com.biofit.backend.health.HealthRiskAlert;
import com.biofit.backend.health.HealthRiskAlertRepository;
import com.biofit.backend.security.UserPrincipal;
import com.biofit.backend.user.RoleName;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PlanAccessService {

    private final PlanAccessRequestRepository planAccessRequestRepository;
    private final HealthRiskAlertRepository healthRiskAlertRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final MedicalAdvisorService medicalAdvisorService;
    private final DomainService domainService;
    private final AuditService auditService;

    public Map<String, Object> statusForClient(UserPrincipal principal, Long clientUserId) {
        requireAdvisor(principal);
        medicalAdvisorService.assertAdvisorCanAccessClient(principal, clientUserId);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("clientUserId", clientUserId);
        body.put("workout", statusBlock(principal.getId(), clientUserId, PlanAccessRequest.WORKOUT_PLAN));
        body.put("fitness", statusBlock(principal.getId(), clientUserId, PlanAccessRequest.WORKOUT_PLAN));
        body.put("nutrition", statusBlock(principal.getId(), clientUserId, PlanAccessRequest.NUTRITION_PLAN));
        return body;
    }

    @Transactional
    public Map<String, Object> requestAccess(
            UserPrincipal principal, Long clientUserId, String resourceType, String reason) {
        requireAdvisor(principal);
        medicalAdvisorService.assertAdvisorCanAccessClient(principal, clientUserId);
        String type = normalizeResource(resourceType);
        PlanAccessRequest latest = latest(principal.getId(), clientUserId, type).orElse(null);
        if (latest != null && PlanAccessRequest.PENDING.equals(latest.getStatus())) {
            return mapRequest(latest);
        }
        if (latest != null && PlanAccessRequest.APPROVED.equals(latest.getStatus())) {
            throw new ApiException("CONFLICT", "Access is already approved.", HttpStatus.CONFLICT);
        }
        User client = userRepository.findById(clientUserId).orElse(null);
        PlanAccessRequest request = new PlanAccessRequest();
        request.setClientUserId(clientUserId);
        request.setClientCode("BF-C" + clientUserId);
        request.setClientName(client == null ? "Client" : client.getFullName());
        request.setAdvisorUserId(principal.getId());
        request.setAdvisorName(displayName(principal));
        request.setResourceType(type);
        request.setStatus(PlanAccessRequest.PENDING);
        request.setRequestedAt(Instant.now());
        request.setReason(reasonText(reason, type));
        planAccessRequestRepository.save(request);
        notifyClient(request);
        audit(
                principal.getId(),
                isWorkout(type) ? "PLAN_ACCESS_REQUEST_WORKOUT" : "PLAN_ACCESS_REQUEST_NUTRITION",
                String.valueOf(request.getId()),
                "Requested " + label(type) + " access for client " + clientUserId);
        return mapRequest(request);
    }

    @Transactional
    public Map<String, Object> cancel(UserPrincipal principal, Long requestId) {
        requireAdvisor(principal);
        PlanAccessRequest request = require(requestId);
        if (!principal.getId().equals(request.getAdvisorUserId()) && !principal.hasRole(RoleName.ADMIN)) {
            throw new ApiException("FORBIDDEN", "You can only cancel your own request.", HttpStatus.FORBIDDEN);
        }
        if (!PlanAccessRequest.PENDING.equals(request.getStatus())) {
            throw new ApiException("CONFLICT", "Only a pending request can be cancelled.", HttpStatus.CONFLICT);
        }
        request.setStatus(PlanAccessRequest.CANCELLED);
        request.setRespondedAt(Instant.now());
        request.setRespondedByUserId(principal.getId());
        planAccessRequestRepository.save(request);
        audit(principal.getId(), "PLAN_ACCESS_CANCEL", String.valueOf(request.getId()), "Cancelled " + label(request.getResourceType()));
        return mapRequest(request);
    }

    public List<Map<String, Object>> listForClient(UserPrincipal principal) {
        requireClient(principal);
        return planAccessRequestRepository.findByClientUserIdOrderByRequestedAtDesc(principal.getId()).stream()
                .filter(request -> !PlanAccessRequest.CANCELLED.equals(request.getStatus()))
                .map(this::mapRequest)
                .toList();
    }

    @Transactional
    public Map<String, Object> decide(UserPrincipal principal, Long requestId, String decision, String rejectionReason) {
        PlanAccessRequest request = require(requestId);
        assertClientOwner(principal, request);
        if (!PlanAccessRequest.PENDING.equals(request.getStatus())) {
            throw new ApiException("CONFLICT", "This request has already been answered.", HttpStatus.CONFLICT);
        }
        String next = normalizeDecision(decision);
        request.setStatus(next);
        request.setRespondedAt(Instant.now());
        request.setRespondedByUserId(principal.getId());
        if (PlanAccessRequest.REJECTED.equals(next)) {
            request.setRejectionReason(blankToNull(rejectionReason));
        }
        planAccessRequestRepository.save(request);
        boolean workout = isWorkout(request.getResourceType());
        String action =
                PlanAccessRequest.APPROVED.equals(next)
                        ? (workout ? "PLAN_ACCESS_APPROVE_WORKOUT" : "PLAN_ACCESS_APPROVE_NUTRITION")
                        : (workout ? "PLAN_ACCESS_REJECT_WORKOUT" : "PLAN_ACCESS_REJECT_NUTRITION");
        audit(principal.getId(), action, String.valueOf(request.getId()), next + " " + label(request.getResourceType()));
        return mapRequest(request);
    }

    @Transactional
    public Map<String, Object> revoke(UserPrincipal principal, Long requestId) {
        PlanAccessRequest request = require(requestId);
        assertClientOwner(principal, request);
        if (!PlanAccessRequest.APPROVED.equals(request.getStatus())) {
            throw new ApiException("CONFLICT", "Only approved access can be revoked.", HttpStatus.CONFLICT);
        }
        request.setStatus(PlanAccessRequest.REVOKED);
        request.setRespondedAt(Instant.now());
        request.setRespondedByUserId(principal.getId());
        planAccessRequestRepository.save(request);
        boolean workout = isWorkout(request.getResourceType());
        audit(
                principal.getId(),
                workout ? "PLAN_ACCESS_REVOKE_WORKOUT" : "PLAN_ACCESS_REVOKE_NUTRITION",
                String.valueOf(request.getId()),
                "Client revoked " + label(request.getResourceType()) + " access");
        return mapRequest(request);
    }

    @Transactional
    public Map<String, Object> viewWorkoutPlan(UserPrincipal principal, Long clientUserId) {
        requireAdvisor(principal);
        medicalAdvisorService.assertAdvisorCanAccessClient(principal, clientUserId);
        assertApproved(principal.getId(), clientUserId, PlanAccessRequest.WORKOUT_PLAN);
        audit(principal.getId(), "PLAN_ACCESS_VIEW_WORKOUT", String.valueOf(clientUserId), "Viewed workout plan");
        return domainService.clientWorkoutPlan(clientUserId);
    }

    @Transactional
    public Map<String, Object> viewNutritionPlan(UserPrincipal principal, Long clientUserId) {
        requireAdvisor(principal);
        medicalAdvisorService.assertAdvisorCanAccessClient(principal, clientUserId);
        assertApproved(principal.getId(), clientUserId, PlanAccessRequest.NUTRITION_PLAN);
        audit(principal.getId(), "PLAN_ACCESS_VIEW_NUTRITION", String.valueOf(clientUserId), "Viewed nutrition plan");
        return domainService.clientMealPlan(clientUserId);
    }

    public List<Map<String, Object>> alertsForCategory(String category) {
        String normalized = normalizeCategory(category);
        return healthRiskAlertRepository.findByCategoryIgnoreCaseAndActiveTrueOrderByDateRaisedDesc(normalized).stream()
                .map(this::mapAlert)
                .toList();
    }

    public static String normalizeCategory(String raw) {
        if (raw == null || raw.isBlank()) return "General";
        String value = raw.trim().toLowerCase(Locale.ROOT);
        return switch (value) {
            case "fitness" -> "Fitness";
            case "nutrition" -> "Nutrition";
            case "medical" -> "Medical";
            case "general" -> "General";
            default -> "General";
        };
    }

    private void assertApproved(Long advisorUserId, Long clientUserId, String resourceType) {
        PlanAccessRequest latest = latest(advisorUserId, clientUserId, resourceType).orElse(null);
        if (latest != null && PlanAccessRequest.APPROVED.equals(latest.getStatus())) return;
        throw new ApiException("FORBIDDEN", denialMessage(latest, resourceType), HttpStatus.FORBIDDEN);
    }

    private String denialMessage(PlanAccessRequest latest, String resourceType) {
        if (latest != null && PlanAccessRequest.APPROVED.equals(latest.getStatus())) return null;
        boolean workout = isWorkout(resourceType);
        if (latest != null && PlanAccessRequest.PENDING.equals(latest.getStatus())) {
            return workout
                    ? "Workout Plan access request pending."
                    : "Nutrition Plan access request pending.";
        }
        if (latest != null
                && (PlanAccessRequest.REJECTED.equals(latest.getStatus())
                        || PlanAccessRequest.REVOKED.equals(latest.getStatus()))) {
            return workout
                    ? "Workout Plan access denied by client."
                    : "Nutrition Plan access denied by client.";
        }
        return workout ? "Access required" : "Access required";
    }

    private java.util.Optional<PlanAccessRequest> latest(Long advisorUserId, Long clientUserId, String resourceType) {
        return planAccessRequestRepository
                .findFirstByAdvisorUserIdAndClientUserIdAndResourceTypeOrderByRequestedAtDescIdDesc(
                        advisorUserId, clientUserId, resourceType);
    }

    private Map<String, Object> statusBlock(Long advisorUserId, Long clientUserId, String resourceType) {
        PlanAccessRequest latest = latest(advisorUserId, clientUserId, resourceType).orElse(null);
        Map<String, Object> block = new LinkedHashMap<>();
        if (latest == null || PlanAccessRequest.CANCELLED.equals(latest.getStatus())) {
            block.put("status", "NOT_REQUESTED");
            block.put("requestId", null);
            block.put("message", "Access required");
            return block;
        }
        block.put("status", latest.getStatus());
        block.put("requestId", latest.getId());
        block.put("requestedAt", latest.getRequestedAt() == null ? null : latest.getRequestedAt().toString());
        block.put("respondedAt", latest.getRespondedAt() == null ? null : latest.getRespondedAt().toString());
        block.put("rejectionReason", latest.getRejectionReason());
        block.put("reason", latest.getReason());
        block.put("message", denialMessage(latest, resourceType));
        return block;
    }

    private Map<String, Object> mapRequest(PlanAccessRequest request) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", request.getId());
        row.put("clientUserId", request.getClientUserId());
        row.put("clientId", request.getClientCode());
        row.put("clientName", request.getClientName());
        row.put("requestedBy", request.getAdvisorName() == null ? "Medical Advisor" : request.getAdvisorName());
        row.put("advisorUserId", request.getAdvisorUserId());
        row.put("resourceType", request.getResourceType());
        row.put("resource", label(request.getResourceType()));
        row.put("planType", request.getResourceType());
        row.put("status", request.getStatus());
        row.put("reason", request.getReason());
        row.put("requestedAt", request.getRequestedAt() == null ? null : request.getRequestedAt().toString());
        row.put("respondedAt", request.getRespondedAt() == null ? null : request.getRespondedAt().toString());
        row.put("respondedBy", request.getRespondedByUserId());
        row.put("rejectionReason", request.getRejectionReason());
        return row;
    }

    private Map<String, Object> mapAlert(HealthRiskAlert alert) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", alert.getId());
        row.put("userId", alert.getUserId());
        row.put("clientId", alert.getClientCode());
        row.put("clientName", alert.getClientName());
        row.put("title", alert.getTitle());
        row.put("reason", alert.getReason() != null ? alert.getReason() : alert.getGuidance());
        row.put("priority", alert.getPriority());
        row.put("category", alert.getCategory() == null ? "General" : alert.getCategory());
        row.put("status", alert.getStatus());
        row.put("dateRaised", alert.getDateRaised() == null ? null : alert.getDateRaised().toString());
        row.put("createdBy", alert.getAssignedAdvisor());
        return row;
    }

    private PlanAccessRequest require(Long id) {
        return planAccessRequestRepository
                .findById(id)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Access request not found.", HttpStatus.NOT_FOUND));
    }

    private void requireAdvisor(UserPrincipal principal) {
        if (principal == null
                || !(principal.hasRole(RoleName.MEDICAL_ADVISOR) || principal.hasRole(RoleName.ADMIN))) {
            throw new ApiException("FORBIDDEN", "Medical Advisor access is required.", HttpStatus.FORBIDDEN);
        }
    }

    private void assertClientOwner(UserPrincipal principal, PlanAccessRequest request) {
        if (principal == null
                || !principal.hasRole(RoleName.CLIENT)
                || !principal.getId().equals(request.getClientUserId())) {
            throw new ApiException(
                    "FORBIDDEN", "Only this client can respond to the access request.", HttpStatus.FORBIDDEN);
        }
    }

    private void requireClient(UserPrincipal principal) {
        if (principal == null || !principal.hasRole(RoleName.CLIENT)) {
            throw new ApiException("FORBIDDEN", "Client access is required.", HttpStatus.FORBIDDEN);
        }
    }

    private static String normalizeResource(String raw) {
        if (raw == null) {
            throw new ApiException("VALIDATION_ERROR", "Resource type is required.", HttpStatus.BAD_REQUEST);
        }
        String value = raw.trim().toUpperCase(Locale.ROOT).replace(' ', '_').replace('-', '_');
        if ("FITNESS".equals(value)
                || "WORKOUT".equals(value)
                || "FITNESS_PLAN".equals(value)
                || PlanAccessRequest.WORKOUT_PLAN.equals(value)) {
            return PlanAccessRequest.WORKOUT_PLAN;
        }
        if ("NUTRITION".equals(value) || "MEAL_PLAN".equals(value) || PlanAccessRequest.NUTRITION_PLAN.equals(value)) {
            return PlanAccessRequest.NUTRITION_PLAN;
        }
        throw new ApiException(
                "VALIDATION_ERROR", "Plan type must be WORKOUT_PLAN or NUTRITION_PLAN.", HttpStatus.BAD_REQUEST);
    }

    private static String normalizeDecision(String raw) {
        if (raw == null) {
            throw new ApiException("VALIDATION_ERROR", "Decision is required.", HttpStatus.BAD_REQUEST);
        }
        String value = raw.trim().toUpperCase(Locale.ROOT);
        if ("APPROVE".equals(value) || PlanAccessRequest.APPROVED.equals(value)) return PlanAccessRequest.APPROVED;
        if ("REJECT".equals(value) || PlanAccessRequest.REJECTED.equals(value)) return PlanAccessRequest.REJECTED;
        throw new ApiException("VALIDATION_ERROR", "Decision must be APPROVED or REJECTED.", HttpStatus.BAD_REQUEST);
    }

    private static boolean isWorkout(String resourceType) {
        return PlanAccessRequest.WORKOUT_PLAN.equals(resourceType);
    }

    private static String label(String resourceType) {
        return isWorkout(resourceType) ? "Workout Plan" : "Nutrition Plan";
    }

    private static String reasonText(String reason, String resourceType) {
        String trimmed = blankToNull(reason);
        if (trimmed != null) return trimmed;
        if (isWorkout(resourceType)) {
            return "Medical Advisor requested access to review your workout plan for health and safety purposes.";
        }
        return "Medical Advisor requested access to review your nutrition plan for health and safety purposes.";
    }

    private void notifyClient(PlanAccessRequest request) {
        NotificationEntity notice = new NotificationEntity();
        notice.setId("ntf-" + UUID.randomUUID().toString().substring(0, 8));
        notice.setUserId(request.getClientUserId());
        notice.setAudience("CLIENT");
        notice.setType("plan-access");
        notice.setTitle("Medical Advisor access request");
        notice.setBody(request.getAdvisorName() + " wants to view your " + label(request.getResourceType()) + ".");
        notice.setLink("/client/plan-access");
        notice.setReadFlag(false);
        notice.setCreatedAt(Instant.now());
        notificationRepository.save(notice);
    }

    private String displayName(UserPrincipal principal) {
        return userRepository
                .findById(principal.getId())
                .map(User::getFullName)
                .filter(name -> name != null && !name.isBlank())
                .orElse(principal.getUsername());
    }

    private void audit(Long userId, String action, String entityId, String details) {
        auditService.log(userId, action, "PlanAccessRequest", entityId, "SUCCESS", null, null, details);
    }

    private static String blankToNull(String value) {
        if (value == null || value.isBlank()) return null;
        String trimmed = value.trim();
        return trimmed.length() <= 500 ? trimmed : trimmed.substring(0, 500);
    }
}
