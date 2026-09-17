package com.biofit.backend.erasure;

import com.biofit.backend.audit.AuditService;
import com.biofit.backend.common.ApiException;
import com.biofit.backend.health.HealthProfile;
import com.biofit.backend.health.HealthProfileRepository;
import com.biofit.backend.health.HealthRiskAlert;
import com.biofit.backend.health.HealthRiskAlertRepository;
import com.biofit.backend.health.MedicalHistoryEntry;
import com.biofit.backend.health.MedicalHistoryEntryRepository;
import com.biofit.backend.security.UserPrincipal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ErasureService {

    private static final Set<String> RECORD_TYPES =
            Set.of("MEDICAL_HISTORY", "HEALTH_RECORD", "HEALTH_ALERT");

    private final ErasureRequestRepository erasureRequestRepository;
    private final MedicalHistoryEntryRepository medicalHistoryEntryRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final HealthRiskAlertRepository healthRiskAlertRepository;
    private final AuditService auditService;

    public List<Map<String, Object>> list() {
        return erasureRequestRepository.findAllByOrderByRequestedAtDesc().stream()
                .map(this::map)
                .toList();
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body, UserPrincipal principal) {
        String legalBasis = str(body.get("legalBasis"));
        String reason = str(body.get("reason"));
        if (isBlank(legalBasis) || isBlank(reason)) {
            throw new ApiException(
                    "VALIDATION_ERROR",
                    "legal_basis and reason are required",
                    HttpStatus.BAD_REQUEST);
        }
        String recordType = normalizeRecordType(str(body.get("recordType")));
        Long recordId = asLong(body.get("recordId"));
        if (recordId == null) {
            throw new ApiException("VALIDATION_ERROR", "record_id is required", HttpStatus.BAD_REQUEST);
        }
        Long clientUserId = requireInactiveTarget(recordType, recordId);

        ErasureRequest request = new ErasureRequest();
        request.setRecordType(recordType);
        request.setRecordId(recordId);
        request.setClientUserId(clientUserId);
        request.setLegalBasis(legalBasis.trim());
        request.setReason(reason.trim());
        request.setStatus("PENDING");
        request.setRequestedByUserId(principal.getId());
        request.setRequestedAt(Instant.now());
        erasureRequestRepository.save(request);

        audit(
                principal,
                "ERASURE_REQUEST_CREATE",
                request.getId(),
                "Created erasure request for " + recordType + " id=" + recordId);
        return map(request);
    }

    @Transactional
    public Map<String, Object> approve(Long id, Map<String, Object> body, UserPrincipal principal) {
        ErasureRequest request = requireRequest(id);
        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new ApiException(
                    "CONFLICT",
                    "Only PENDING erasure requests can be approved",
                    HttpStatus.CONFLICT);
        }
        if (principal.getId().equals(request.getRequestedByUserId())) {
            throw new ApiException(
                    "FORBIDDEN",
                    "The admin who requested erasure cannot approve the same request",
                    HttpStatus.FORBIDDEN);
        }
        requireInactiveTarget(request.getRecordType(), request.getRecordId());

        request.setStatus("APPROVED");
        request.setReviewedByUserId(principal.getId());
        request.setReviewedAt(Instant.now());
        request.setReviewNotes(str(body.get("reviewNotes")));
        erasureRequestRepository.save(request);

        audit(
                principal,
                "ERASURE_REQUEST_APPROVE",
                request.getId(),
                "Approved erasure request for "
                        + request.getRecordType()
                        + " id="
                        + request.getRecordId());
        return map(request);
    }

    @Transactional
    public Map<String, Object> reject(Long id, Map<String, Object> body, UserPrincipal principal) {
        ErasureRequest request = requireRequest(id);
        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new ApiException(
                    "CONFLICT",
                    "Only PENDING erasure requests can be rejected",
                    HttpStatus.CONFLICT);
        }
        request.setStatus("REJECTED");
        request.setReviewedByUserId(principal.getId());
        request.setReviewedAt(Instant.now());
        request.setReviewNotes(str(body.get("reviewNotes")));
        erasureRequestRepository.save(request);

        audit(
                principal,
                "ERASURE_REQUEST_REJECT",
                request.getId(),
                "Rejected erasure request for "
                        + request.getRecordType()
                        + " id="
                        + request.getRecordId());
        return map(request);
    }

    @Transactional
    public Map<String, Object> execute(Long id, UserPrincipal principal) {
        ErasureRequest request = requireRequest(id);
        if (!"APPROVED".equalsIgnoreCase(request.getStatus())) {
            throw new ApiException(
                    "CONFLICT",
                    "Erasure can only be executed when the request is APPROVED",
                    HttpStatus.CONFLICT);
        }
        requireInactiveTarget(request.getRecordType(), request.getRecordId());
        hardDelete(request.getRecordType(), request.getRecordId());

        request.setStatus("EXECUTED");
        request.setExecutedByUserId(principal.getId());
        request.setExecutedAt(Instant.now());
        erasureRequestRepository.save(request);

        audit(
                principal,
                "ERASURE_REQUEST_EXECUTE",
                request.getId(),
                "Executed hard delete for "
                        + request.getRecordType()
                        + " id="
                        + request.getRecordId());
        return map(request);
    }

    private Long requireInactiveTarget(String recordType, Long recordId) {
        return switch (recordType) {
            case "MEDICAL_HISTORY" -> {
                MedicalHistoryEntry entry =
                        medicalHistoryEntryRepository
                                .findById(recordId)
                                .orElseThrow(
                                        () ->
                                                new ApiException(
                                                        "NOT_FOUND",
                                                        "Medical history record not found",
                                                        HttpStatus.NOT_FOUND));
                if (!"Inactive".equalsIgnoreCase(entry.getStatus())) {
                    throw new ApiException(
                            "CONFLICT",
                            "Record must be marked inactive before erasure",
                            HttpStatus.CONFLICT);
                }
                yield entry.getUserId();
            }
            case "HEALTH_RECORD" -> {
                HealthProfile profile =
                        healthProfileRepository
                                .findById(recordId)
                                .orElseThrow(
                                        () ->
                                                new ApiException(
                                                        "NOT_FOUND",
                                                        "Health record not found",
                                                        HttpStatus.NOT_FOUND));
                if (profile.isActive()) {
                    throw new ApiException(
                            "CONFLICT",
                            "Record must be marked inactive before erasure",
                            HttpStatus.CONFLICT);
                }
                yield profile.getUserId();
            }
            case "HEALTH_ALERT" -> {
                HealthRiskAlert alert =
                        healthRiskAlertRepository
                                .findById(recordId)
                                .orElseThrow(
                                        () ->
                                                new ApiException(
                                                        "NOT_FOUND",
                                                        "Health alert not found",
                                                        HttpStatus.NOT_FOUND));
                if (alert.isActive()) {
                    throw new ApiException(
                            "CONFLICT",
                            "Record must be marked inactive before erasure",
                            HttpStatus.CONFLICT);
                }
                yield alert.getUserId();
            }
            default ->
                    throw new ApiException(
                            "VALIDATION_ERROR", "Unsupported record_type", HttpStatus.BAD_REQUEST);
        };
    }

    private void hardDelete(String recordType, Long recordId) {
        switch (recordType) {
            case "MEDICAL_HISTORY" -> medicalHistoryEntryRepository.deleteById(recordId);
            case "HEALTH_RECORD" -> healthProfileRepository.deleteById(recordId);
            case "HEALTH_ALERT" -> healthRiskAlertRepository.deleteById(recordId);
            default ->
                    throw new ApiException(
                            "VALIDATION_ERROR", "Unsupported record_type", HttpStatus.BAD_REQUEST);
        }
    }

    private ErasureRequest requireRequest(Long id) {
        return erasureRequestRepository
                .findById(id)
                .orElseThrow(
                        () ->
                                new ApiException(
                                        "NOT_FOUND",
                                        "Erasure request not found",
                                        HttpStatus.NOT_FOUND));
    }

    private String normalizeRecordType(String raw) {
        if (isBlank(raw)) {
            throw new ApiException(
                    "VALIDATION_ERROR", "record_type is required", HttpStatus.BAD_REQUEST);
        }
        String normalized = raw.trim().toUpperCase(Locale.ROOT).replace('-', '_').replace(' ', '_');
        if ("MEDICALHISTORY".equals(normalized)) normalized = "MEDICAL_HISTORY";
        if ("HEALTHRECORD".equals(normalized)) normalized = "HEALTH_RECORD";
        if ("HEALTHALERT".equals(normalized) || "RISK_ALERT".equals(normalized)) {
            normalized = "HEALTH_ALERT";
        }
        if (!RECORD_TYPES.contains(normalized)) {
            throw new ApiException(
                    "VALIDATION_ERROR",
                    "record_type must be MEDICAL_HISTORY, HEALTH_RECORD, or HEALTH_ALERT",
                    HttpStatus.BAD_REQUEST);
        }
        return normalized;
    }

    private Map<String, Object> map(ErasureRequest r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("recordType", r.getRecordType());
        m.put("recordId", r.getRecordId());
        m.put("clientUserId", r.getClientUserId());
        m.put("legalBasis", r.getLegalBasis());
        m.put("reason", r.getReason());
        m.put("status", r.getStatus());
        m.put("requestedByUserId", r.getRequestedByUserId());
        m.put("requestedAt", r.getRequestedAt() == null ? null : r.getRequestedAt().toString());
        m.put("reviewedByUserId", r.getReviewedByUserId());
        m.put("reviewedAt", r.getReviewedAt() == null ? null : r.getReviewedAt().toString());
        m.put("reviewNotes", r.getReviewNotes());
        m.put("executedByUserId", r.getExecutedByUserId());
        m.put("executedAt", r.getExecutedAt() == null ? null : r.getExecutedAt().toString());
        return m;
    }

    private void audit(UserPrincipal principal, String action, Long requestId, String details) {
        auditService.log(
                principal.getId(),
                action,
                "ErasureRequest",
                String.valueOf(requestId),
                "SUCCESS",
                null,
                null,
                details);
    }

    private static String str(Object o) {
        return o == null ? null : String.valueOf(o);
    }

    private static boolean isBlank(Object o) {
        return o == null || String.valueOf(o).isBlank();
    }

    private static Long asLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.longValue();
        String s = String.valueOf(o).trim();
        if (s.startsWith("hr-")) s = s.substring(3);
        s = s.replaceAll("\\D+", "");
        if (s.isEmpty()) return null;
        try {
            return Long.parseLong(s);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
