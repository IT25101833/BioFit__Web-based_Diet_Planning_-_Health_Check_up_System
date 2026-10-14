package com.biofit.backend.domain;

import com.biofit.backend.audit.AuditService;
import com.biofit.backend.common.ApiException;
import com.biofit.backend.security.UserPrincipal;
import com.biofit.backend.user.RoleName;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import com.biofit.backend.user.UserStatus;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MedicalRequestService {

    /** Same centre timezone used for medical reminders, so both sides see one local date and time. */
    static final ZoneId ZONE = ZoneId.of("Asia/Colombo");

    private static final LocalTime WORK_START = LocalTime.of(9, 0);
    private static final LocalTime WORK_END = LocalTime.of(17, 0);
    private static final DateTimeFormatter TIME_LABEL = DateTimeFormatter.ofPattern("hh:mm a", Locale.US);
    private static final DateTimeFormatter DATE_LABEL = DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH);

    //Encapsulation: private final variables are encapsulated and can only be accessed within the class
    private final MedicalRequestRepository medicalRequestRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final AuditService auditService;
    private final WalletService walletService;

    @Transactional
    public Map<String, Object> submit(UserPrincipal principal, Map<String, Object> body) {
        requireClient(principal);
        Map<String, Object> payload = body == null ? Map.of() : body;
        Long advisorId = asLong(payload.get("medicalAdvisorId"));
        if (advisorId == null) advisorId = asLong(payload.get("advisorUserId"));
        return create(
                principal,
                advisorId,
                text(payload.get("reason")),
                text(payload.get("description")),
                parseDate(payload.get("preferredDate")),
                text(payload.get("preferredTime")));
    }

    public List<String> preferredTimeSlots() {
        return timeSlots();
    }

    /** Slots still open on this date: 9:00 AM–5:00 PM, and not already chosen by another client. */
    public List<String> preferredTimeSlots(String dateText) {
        if (dateText == null || dateText.isBlank()) {
            return timeSlots();
        }
        LocalDate date;
        try {
            String raw = dateText.trim();
            date = LocalDate.parse(raw.length() >= 10 ? raw.substring(0, 10) : raw);
        } catch (DateTimeParseException ex) {
            return List.of();
        }
        return availableSlots(date);
    }

    @Transactional
    public Map<String, Object> create(
            UserPrincipal principal,
            Long medicalAdvisorId,
            String reason,
            String description,
            LocalDate preferredDate,
            String preferredTime) {
        requireClient(principal);
        if (medicalAdvisorId == null) {
            throw new ApiException("VALIDATION_ERROR", "Select a Medical Advisor.", HttpStatus.BAD_REQUEST);
        }
        String reasonText = required(reason, "Enter a reason for the request.", 200);
        String descriptionText = required(description, "Describe why you need medical assistance.", 2000);
        String timeText = validatePreferred(preferredDate, preferredTime);
        assertSlotAvailable(preferredDate, timeText);
        if (medicalAdvisorId.equals(principal.getId())) {
            throw new ApiException("VALIDATION_ERROR", "Select a Medical Advisor.", HttpStatus.BAD_REQUEST);
        }

        User client = requireUser(principal.getId());
        User advisor = requireAdvisor(medicalAdvisorId);
        if (medicalRequestRepository.existsByClientIdAndMedicalAdvisorIdAndStatusIn(
                client.getId(),
                advisor.getId(),
                List.of(
                        MedicalRequest.PENDING,
                        MedicalRequest.ACCEPTED,
                        MedicalRequest.ATTENDED,
                        MedicalRequest.IN_PROGRESS))) {
            throw new ApiException(
                    "CONFLICT",
                    "You already have an open medical request with this Medical Advisor.",
                    HttpStatus.CONFLICT);
        }

        walletService.pay(principal, "MEDICAL");

        MedicalRequest request = new MedicalRequest();
        request.setClientId(client.getId());
        request.setClientCode("BF-C" + client.getId());
        request.setClientName(client.getFullName());
        request.setMedicalAdvisorId(advisor.getId());
        request.setAdvisorName(advisor.getFullName());
        request.setReason(reasonText);
        request.setDescription(descriptionText);
        request.setPreferredDate(preferredDate);
        request.setPreferredTime(timeText);
        request.setStatus(MedicalRequest.PENDING);
        request.setRequestedAt(Instant.now());
        medicalRequestRepository.save(request);

        notify(
                advisor.getId(),
                "MEDICAL",
                "New medical request received from "
                        + client.getFullName()
                        + " for "
                        + consultationLabel(request)
                        + ".",
                "/medical/requests");
        audit(client.getId(), "MEDICAL_REQUEST_CREATE", request.getId(), "Client created a medical request");
        return toMap(request);
    }

    public List<Map<String, Object>> listForClient(UserPrincipal principal) {
        requireClient(principal);
        return medicalRequestRepository.findByClientIdOrderByRequestedAtDesc(principal.getId()).stream()
                .map(this::toMap)
                .toList();
    }

    public List<Map<String, Object>> listAdvisors() {
        return userRepository.findActiveByRole(RoleName.MEDICAL_ADVISOR, UserStatus.ACTIVE).stream()
                .map(this::advisorOption)
                .toList();
    }

    @Transactional
    public Map<String, Object> getForClient(UserPrincipal principal, Long id) {
        requireClient(principal);
        MedicalRequest request = require(id);
        if (!principal.getId().equals(request.getClientId())) {
            throw new ApiException("FORBIDDEN", "You cannot access this medical request.", HttpStatus.FORBIDDEN);
        }
        return toMap(request);
    }

    @Transactional
    public Map<String, Object> cancel(UserPrincipal principal, Long id) {
        requireClient(principal);
        MedicalRequest request = require(id);
        if (!principal.getId().equals(request.getClientId())) {
            throw new ApiException("FORBIDDEN", "You cannot access this medical request.", HttpStatus.FORBIDDEN);
        }
        if (!MedicalRequest.PENDING.equals(request.getStatus())) {
            throw new ApiException(
                    "CONFLICT", "Only a pending medical request can be cancelled.", HttpStatus.CONFLICT);
        }
        request.setStatus(MedicalRequest.CANCELLED);
        request.setRespondedAt(Instant.now());
        medicalRequestRepository.save(request);
        audit(principal.getId(), "MEDICAL_REQUEST_CANCEL", request.getId(), "Client cancelled a medical request");
        return toMap(request);
    }

    public List<Map<String, Object>> listForAdvisor(UserPrincipal principal) {
        requireAdvisorPrincipal(principal);
        return medicalRequestRepository.findByMedicalAdvisorIdOrderByRequestedAtDesc(principal.getId()).stream()
                .map(this::toMap)
                .toList();
    }

    @Transactional
    public Map<String, Object> getForAdvisor(UserPrincipal principal, Long id) {
        MedicalRequest request = requireAssigned(principal, id);
        audit(principal.getId(), "MEDICAL_REQUEST_VIEW", request.getId(), "Medical Advisor viewed a medical request");
        return toMap(request);
    }




















    @Transactional
    public Map<String, Object> accept(UserPrincipal principal, Long id) {
        MedicalRequest request = requireAssigned(principal, id);
        if (!MedicalRequest.PENDING.equals(request.getStatus())) {
            throw new ApiException("CONFLICT", "Only a pending medical request can be attended.", HttpStatus.CONFLICT);
        }
        request.setStatus(MedicalRequest.ATTENDED);
        request.setRespondedAt(Instant.now());
        medicalRequestRepository.save(request);
        notify(
                request.getClientId(),
                "CLIENT",
                "Your medical request for " + consultationLabel(request) + " has been accepted.",
                "/client/medical-requests");
        audit(principal.getId(), "MEDICAL_REQUEST_ACCEPT", request.getId(), "Medical Advisor accepted a medical request");
        return toMap(request);
    }



















    

    @Transactional
    public Map<String, Object> reject(UserPrincipal principal, Long id, String rejectionReason) {
        MedicalRequest request = requireAssigned(principal, id);
        if (!MedicalRequest.PENDING.equals(request.getStatus())) {
            throw new ApiException("CONFLICT", "Only a pending medical request can be rejected.", HttpStatus.CONFLICT);
        }
        request.setStatus(MedicalRequest.REJECTED);//encapsulation: the Status field is encapsulated and can only be accessed within the class
        request.setRejectionReason(blankToNull(rejectionReason, 500));//encapsulation: the RejectionReason field is encapsulated and can only be accessed within the class
        request.setRespondedAt(Instant.now());//encapsulation: the RespondedAt field is encapsulated and can only be accessed within the class
        medicalRequestRepository.save(request);//abstraction: the save method is abstracted and can be used to save a medical request
        String body = "Your medical request has been rejected.";
        if (request.getRejectionReason() != null) {
            body = body + " " + request.getRejectionReason();
        }
        notify(request.getClientId(), "CLIENT", body, "/client/medical-requests");
        audit(principal.getId(), "MEDICAL_REQUEST_REJECT", request.getId(), "Medical Advisor rejected a medical request");
        return toMap(request);
    }











    @Transactional
    public Map<String, Object> start(UserPrincipal principal, Long id) {
        MedicalRequest request = requireAssigned(principal, id);
        if (!MedicalRequest.ACCEPTED.equals(request.getStatus())
                && !MedicalRequest.ATTENDED.equals(request.getStatus())) {
            throw new ApiException(
                    "CONFLICT", "Only an attended medical request can be marked in progress.", HttpStatus.CONFLICT);
        }
        request.setStatus(MedicalRequest.IN_PROGRESS);
        medicalRequestRepository.save(request);
        return toMap(request);
    }













    @Transactional
    public Map<String, Object> complete(UserPrincipal principal, Long id) {
        MedicalRequest request = requireAssigned(principal, id);
        if (!MedicalRequest.grantsClinicalAccess(request.getStatus())
                || MedicalRequest.COMPLETED.equals(request.getStatus())) {
            throw new ApiException(
                    "CONFLICT",
                    "Only an attended medical request can be completed.",
                    HttpStatus.CONFLICT);
        }
        request.setStatus(MedicalRequest.COMPLETED);
        medicalRequestRepository.save(request);
        audit(
                principal.getId(),
                "MEDICAL_REQUEST_COMPLETE",
                request.getId(),
                "Medical Advisor completed a medical request");
        return toMap(request);
    }























    

    private MedicalRequest requireAssigned(UserPrincipal principal, Long id) {
        requireAdvisorPrincipal(principal);
        MedicalRequest request = require(id);
        if (!principal.getId().equals(request.getMedicalAdvisorId())) {
            throw new ApiException(
                    "FORBIDDEN",
                    "This medical request is assigned to another Medical Advisor.",
                    HttpStatus.FORBIDDEN);
        }
        return request;
    }

    private MedicalRequest require(Long id) {
        if (id == null) {
            throw new ApiException("NOT_FOUND", "Medical request not found.", HttpStatus.NOT_FOUND);
        }
        return medicalRequestRepository
                .findById(id)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Medical request not found.", HttpStatus.NOT_FOUND));
    }

    private void requireClient(UserPrincipal principal) {
        if (principal == null || !principal.hasRole(RoleName.CLIENT)) {
            throw new ApiException("FORBIDDEN", "Only a client can manage this medical request.", HttpStatus.FORBIDDEN);
        }
    }

    private void requireAdvisorPrincipal(UserPrincipal principal) {
        if (principal == null
                || (!principal.hasRole(RoleName.MEDICAL_ADVISOR) && !principal.hasRole(RoleName.ADMIN))) {
            throw new ApiException("FORBIDDEN", "Medical Advisor access required.", HttpStatus.FORBIDDEN);
        }
    }

    private User requireUser(Long id) {
        User user =
                userRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Account not found.", HttpStatus.NOT_FOUND));
        if (user.getDeletedAt() != null) {
            throw new ApiException("NOT_FOUND", "Account not found.", HttpStatus.NOT_FOUND);
        }
        return user;
    }

    private User requireAdvisor(Long id) {
        User advisor = requireUser(id);
        boolean isAdvisor =
                advisor.getRoles() != null
                        && advisor.getRoles().stream().anyMatch(role -> role.getName() == RoleName.MEDICAL_ADVISOR);
        if (!isAdvisor || advisor.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException("VALIDATION_ERROR", "Select a Medical Advisor.", HttpStatus.BAD_REQUEST);
        }
        return advisor;
    }

    private void notify(Long userId, String audience, String body, String link) {
        if (userId == null) return;
        NotificationEntity notice = new NotificationEntity();
        notice.setId("ntf-" + UUID.randomUUID().toString().substring(0, 8));
        notice.setUserId(userId);
        notice.setAudience(audience);
        notice.setType("medical-request");
        notice.setTitle("Medical request");
        notice.setBody(body);
        notice.setLink(link);
        notice.setReadFlag(false);
        notice.setCreatedAt(Instant.now());
        notificationRepository.save(notice);
    }

    private void audit(Long userId, String action, Long entityId, String details) {
        auditService.log(
                userId, action, "MedicalRequest", entityId == null ? null : String.valueOf(entityId), "SUCCESS", null, null, details);
    }

    private Map<String, Object> advisorOption(User advisor) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", advisor.getId());
        row.put("medicalAdvisorId", advisor.getId());
        row.put("name", advisor.getFullName());
        row.put("email", advisor.getEmail());
        row.put("specialization", advisor.getSpecialization());
        return row;
    }

    private Map<String, Object> toMap(MedicalRequest request) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", request.getId());
        row.put("clientId", request.getClientId());
        row.put("clientUserId", request.getClientId());
        row.put("clientCode", request.getClientCode());
        row.put("clientName", request.getClientName());
        row.put("medicalAdvisorId", request.getMedicalAdvisorId());
        row.put("advisorUserId", request.getMedicalAdvisorId());
        row.put("advisorName", request.getAdvisorName());
        row.put("medicalAdvisorName", request.getAdvisorName());
        row.put("reason", request.getReason());
        row.put("description", request.getDescription());
        row.put("preferredDate", request.getPreferredDate() == null ? null : request.getPreferredDate().toString());
        row.put(
                "preferredDateLabel",
                request.getPreferredDate() == null ? null : request.getPreferredDate().format(DATE_LABEL));
        row.put("preferredTime", request.getPreferredTime());
        row.put("status", request.getStatus());
        row.put("rejectionReason", request.getRejectionReason());
        row.put("requestedAt", request.getRequestedAt());
        row.put("respondedAt", request.getRespondedAt());
        row.put("createdAt", request.getCreatedAt());
        row.put("updatedAt", request.getUpdatedAt());
        return row;
    }

    private static String consultationLabel(MedicalRequest request) {
        String date = request.getPreferredDate() == null ? "" : request.getPreferredDate().format(DATE_LABEL);
        String time = request.getPreferredTime() == null ? "" : request.getPreferredTime();
        return (date + " at " + time).trim();
    }

    private static LocalDate parseDate(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            throw new ApiException("VALIDATION_ERROR", "Select a preferred date.", HttpStatus.BAD_REQUEST);
        }
        String raw = String.valueOf(value).trim();
        try {
            return LocalDate.parse(raw.length() >= 10 ? raw.substring(0, 10) : raw);
        } catch (DateTimeParseException ex) {
            throw new ApiException("VALIDATION_ERROR", "Select a preferred date.", HttpStatus.BAD_REQUEST);
        }
    }

    private static String validatePreferred(LocalDate date, String time) {
        if (date == null) {
            throw new ApiException("VALIDATION_ERROR", "Select a preferred date.", HttpStatus.BAD_REQUEST);
        }
        LocalDate today = LocalDate.now(ZONE);
        if (date.isBefore(today)) {
            throw new ApiException(
                    "VALIDATION_ERROR", "Please select today or a future date.", HttpStatus.BAD_REQUEST);
        }
        if (date.getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new ApiException(
                    "VALIDATION_ERROR",
                    "Please select a Monday to Saturday date.",
                    HttpStatus.BAD_REQUEST);
        }
        String normalized = normalizeTime(time);
        if (normalized == null || !timeSlots().contains(normalized)) {
            throw new ApiException("VALIDATION_ERROR", "Select a preferred time.", HttpStatus.BAD_REQUEST);
        }
        if (date.equals(today)) {
            LocalTime now = LocalTime.now(ZONE);
            int nowMinutes = now.getHour() * 60 + now.getMinute();
            Integer slot = minutes(normalized);
            if (slot != null && slot <= nowMinutes) {
                throw new ApiException(
                        "VALIDATION_ERROR",
                        "That time has already passed today. Please choose a later slot.",
                        HttpStatus.BAD_REQUEST);
            }
        }
        return normalized;
    }

    private static final List<String> SLOT_HELD =
            List.of(
                    MedicalRequest.PENDING,
                    MedicalRequest.ACCEPTED,
                    MedicalRequest.ATTENDED,
                    MedicalRequest.IN_PROGRESS,
                    MedicalRequest.COMPLETED);

    private List<String> availableSlots(LocalDate date) {
        LocalDate today = LocalDate.now(ZONE);
        if (date.isBefore(today) || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
            return List.of();
        }
        Set<String> taken = takenTimes(date);
        int nowMinutes = LocalTime.now(ZONE).getHour() * 60 + LocalTime.now(ZONE).getMinute();
        List<String> open = new ArrayList<>();
        for (String slot : timeSlots()) {
            if (taken.contains(slot)) continue;
            if (date.equals(today)) {
                Integer slotMinutes = minutes(slot);
                if (slotMinutes == null || slotMinutes <= nowMinutes) continue;
            }
            open.add(slot);
        }
        return open;
    }

    private Set<String> takenTimes(LocalDate date) {
        return medicalRequestRepository.findByPreferredDateAndStatusIn(date, SLOT_HELD).stream()
                .map(request -> normalizeTime(request.getPreferredTime()))
                .filter(time -> time != null)
                .collect(Collectors.toSet());
    }

    private void assertSlotAvailable(LocalDate date, String time) {
        if (takenTimes(date).contains(time)) {
            throw new ApiException(
                    "CONFLICT",
                    "This time is already booked for that date. Please choose another time.",
                    HttpStatus.CONFLICT);
        }
    }

    private static List<String> timeSlots() {
        List<String> slots = new ArrayList<>();
        for (LocalTime time = WORK_START; time.isBefore(WORK_END); time = time.plusMinutes(30)) {
            slots.add(time.format(TIME_LABEL));
        }
        return slots;
    }

    private static String normalizeTime(String value) {
        if (value == null || value.isBlank()) return null;
        String trimmed = value.trim().toUpperCase(Locale.US).replaceAll("\\s+", " ");
        for (DateTimeFormatter parser :
                List.of(
                        DateTimeFormatter.ofPattern("h:mm a", Locale.US),
                        DateTimeFormatter.ofPattern("hh:mm a", Locale.US),
                        DateTimeFormatter.ofPattern("H:mm"),
                        DateTimeFormatter.ofPattern("HH:mm"))) {
            try {
                return LocalTime.parse(trimmed, parser).format(TIME_LABEL);
            } catch (DateTimeParseException ignored) {
                // try the next accepted label
            }
        }
        return null;
    }

    private static Integer minutes(String label) {
        try {
            LocalTime time = LocalTime.parse(label, TIME_LABEL);
            return time.getHour() * 60 + time.getMinute();
        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    private static String required(String value, String message, int max) {
        String trimmed = value == null ? "" : value.trim();
        if (trimmed.isEmpty()) {
            throw new ApiException("VALIDATION_ERROR", message, HttpStatus.BAD_REQUEST);
        }
        return trimmed.length() <= max ? trimmed : trimmed.substring(0, max);
    }

    private static String text(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private static String blankToNull(String value, int max) {
        if (value == null || value.isBlank()) return null;
        String trimmed = value.trim();
        return trimmed.length() <= max ? trimmed : trimmed.substring(0, max);
    }

    private static Long asLong(Object value) {
        if (value instanceof Number number) return number.longValue();
        if (value instanceof String text && !text.isBlank()) {
            try {
                return Long.parseLong(text.trim());
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }
}
