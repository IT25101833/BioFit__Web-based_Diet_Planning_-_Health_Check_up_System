package com.biofit.backend.domain;

import com.biofit.backend.common.ApiException;
import com.biofit.backend.health.HealthProfile;
import com.biofit.backend.health.HealthProfileRepository;
import com.biofit.backend.security.UserPrincipal;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MedicalReviewRequestService {

    private static final Logger log = LoggerFactory.getLogger(MedicalReviewRequestService.class);
    private static final DateTimeFormatter DISPLAY_DATE =
            DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH);
    private static final String DURATION = "30 min";
    private static final String SERVICE_NAME = "Medical Review";

    private final MedicalReviewRequestRepository reviewRequestRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final BookingAvailabilityService bookingAvailabilityService;
    private final DomainMapper mapper;
    private final WalletService walletService;

    @Transactional
    public void syncFromSource(
            Long clientUserId,
            Long advisorUserId,
            LocalDate reviewDate,
            String sourceType,
            String sourceRecordId) {
        if (clientUserId == null || advisorUserId == null || isBlank(sourceType) || isBlank(sourceRecordId)) {
            return;
        }

        MedicalReviewRequest latest =
                reviewRequestRepository
                        .findFirstByClientUserIdAndSourceTypeIgnoreCaseAndSourceRecordIdOrderByUpdatedAtDesc(
                                clientUserId, sourceType, sourceRecordId)
                        .orElse(null);

        if (reviewDate == null) {
            if (latest != null
                    && MedicalReviewRequest.STATUS_PENDING.equalsIgnoreCase(latest.getStatus())) {
                latest.setStatus(MedicalReviewRequest.STATUS_CANCELLED);
                latest.setUpdatedAt(Instant.now());
                reviewRequestRepository.save(latest);
            }
            return;
        }

        if (latest != null && MedicalReviewRequest.STATUS_BOOKED.equalsIgnoreCase(latest.getStatus())) {
            if (Objects.equals(latest.getReviewDate(), reviewDate)) {
                return;
            }
            moveBookedReview(latest, reviewDate, advisorUserId, advisorName(advisorUserId));
            return;
        }

        MedicalReviewRequest pending =
                reviewRequestRepository
                        .findFirstByClientUserIdAndSourceTypeIgnoreCaseAndSourceRecordIdAndStatusIgnoreCaseOrderByUpdatedAtDesc(
                                clientUserId,
                                sourceType,
                                sourceRecordId,
                                MedicalReviewRequest.STATUS_PENDING)
                        .orElse(null);

        User advisor = userRepository.findById(advisorUserId).orElse(null);
        String advisorName = displayAdvisorName(advisor);

        if (pending != null) {
            boolean dateChanged = !Objects.equals(pending.getReviewDate(), reviewDate);
            boolean advisorChanged = !Objects.equals(pending.getAdvisorUserId(), advisorUserId);
            if (!dateChanged && !advisorChanged) {
                return; // idempotent — same operation submitted twice
            }
            pending.setReviewDate(reviewDate);
            pending.setAdvisorUserId(advisorUserId);
            pending.setAdvisorName(advisorName);
            pending.setUpdatedAt(Instant.now());
            reviewRequestRepository.save(pending);
            notifyReviewRequested(pending, true);
            return;
        }

        MedicalReviewRequest created = new MedicalReviewRequest();
        created.setId("mrr-" + UUID.randomUUID().toString().substring(0, 8));
        created.setClientUserId(clientUserId);
        created.setAdvisorUserId(advisorUserId);
        created.setAdvisorName(advisorName);
        created.setReviewDate(reviewDate);
        created.setSourceType(sourceType);
        created.setSourceRecordId(sourceRecordId);
        created.setStatus(MedicalReviewRequest.STATUS_PENDING);
        created.setCreatedAt(Instant.now());
        created.setUpdatedAt(Instant.now());
        reviewRequestRepository.save(created);
        notifyReviewRequested(created, false);
    }

    private void moveBookedReview(
            MedicalReviewRequest req, LocalDate reviewDate, Long advisorUserId, String advisorName) {
        Appointment appointment =
                isBlank(req.getAppointmentId())
                        ? null
                        : appointmentRepository.findById(req.getAppointmentId()).orElse(null);
        if (appointment != null && canMoveAppointment(appointment)) {
            String time = appointment.getAppointmentTime();
            String duration = firstNonBlank(appointment.getDuration(), DURATION);
            if (!isBlank(time)) {
                bookingAvailabilityService.assertSlotAvailable(
                        "user-" + advisorUserId, reviewDate, time, duration, appointment.getId());
            }
            appointment.setAppointmentDate(reviewDate);
            appointment.setUpdatedAt(Instant.now());
            appointmentRepository.save(appointment);
            req.setReviewDate(reviewDate);
            req.setAdvisorUserId(advisorUserId);
            req.setAdvisorName(advisorName);
            req.setUpdatedAt(Instant.now());
            reviewRequestRepository.save(req);
            notifyReviewMoved(req, time);
            return;
        }

        req.setStatus(MedicalReviewRequest.STATUS_CANCELLED);
        req.setUpdatedAt(Instant.now());
        reviewRequestRepository.save(req);

        MedicalReviewRequest created = new MedicalReviewRequest();
        created.setId("mrr-" + UUID.randomUUID().toString().substring(0, 8));
        created.setClientUserId(req.getClientUserId());
        created.setAdvisorUserId(advisorUserId);
        created.setAdvisorName(advisorName);
        created.setReviewDate(reviewDate);
        created.setSourceType(req.getSourceType());
        created.setSourceRecordId(req.getSourceRecordId());
        created.setStatus(MedicalReviewRequest.STATUS_PENDING);
        created.setCreatedAt(Instant.now());
        created.setUpdatedAt(Instant.now());
        reviewRequestRepository.save(created);
        notifyReviewRequested(created, true);
    }

    private static boolean canMoveAppointment(Appointment appointment) {
        String status = appointment.getStatus() == null ? "" : appointment.getStatus().trim().toLowerCase(Locale.ROOT);
        if (status.startsWith("cancel") || status.equals("completed") || status.equals("attended")) {
            return false;
        }
        String attendance = appointment.getAttendance() == null ? "" : appointment.getAttendance().trim();
        return !attendance.equalsIgnoreCase("ATTENDED");
    }

    private String advisorName(Long advisorUserId) {
        return displayAdvisorName(userRepository.findById(advisorUserId).orElse(null));
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void alignBookedReviewsWithMedicalRecords() {
        for (MedicalReviewRequest req :
                reviewRequestRepository.findByStatusIgnoreCase(MedicalReviewRequest.STATUS_BOOKED)) {
            if (!MedicalReviewRequest.SOURCE_MEDICAL_RECORD.equalsIgnoreCase(req.getSourceType())) {
                continue;
            }
            Long profileId;
            try {
                profileId = Long.valueOf(req.getSourceRecordId());
            } catch (NumberFormatException ex) {
                continue;
            }
            HealthProfile profile = healthProfileRepository.findById(profileId).orElse(null);
            LocalDate desired = profile == null ? null : toLocalDate(profile.getNextCheckupAt());
            if (desired == null || desired.equals(req.getReviewDate())) {
                continue;
            }
            try {
                moveBookedReview(
                        req,
                        desired,
                        req.getAdvisorUserId(),
                        firstNonBlank(req.getAdvisorName(), advisorName(req.getAdvisorUserId())));
            } catch (RuntimeException ex) {
                log.warn(
                        "Could not move medical review {} to {}: {}",
                        req.getId(),
                        desired,
                        ex.getMessage());
            }
        }
    }

    public List<Map<String, Object>> pendingForClient(Long clientUserId) {
        return reviewRequestRepository
                .findByClientUserIdAndStatusIgnoreCaseOrderByReviewDateAsc(
                        clientUserId, MedicalReviewRequest.STATUS_PENDING)
                .stream()
                .map(this::toMap)
                .toList();
    }

    public Map<String, Object> getForClient(Long clientUserId, String id) {
        MedicalReviewRequest req =
                reviewRequestRepository
                        .findByIdAndClientUserId(id, clientUserId)
                        .orElseThrow(
                                () ->
                                        new ApiException(
                                                "NOT_FOUND",
                                                "This review request is no longer active.",
                                                HttpStatus.NOT_FOUND));
        if (MedicalReviewRequest.STATUS_CANCELLED.equalsIgnoreCase(req.getStatus())) {
            throw new ApiException(
                    "GONE", "This review request is no longer active.", HttpStatus.BAD_REQUEST);
        }
        return toMap(req);
    }

    public Map<String, Object> nearestPending(Long clientUserId) {
        return reviewRequestRepository
                .findByClientUserIdAndStatusIgnoreCaseOrderByReviewDateAsc(
                        clientUserId, MedicalReviewRequest.STATUS_PENDING)
                .stream()
                .findFirst()
                .map(this::toMap)
                .orElse(null);
    }

    @Transactional
    public Map<String, Object> bookTime(Long clientUserId, String requestId, Map<String, Object> body) {
        MedicalReviewRequest req =
                reviewRequestRepository
                        .findByIdAndClientUserId(requestId, clientUserId)
                        .orElseThrow(
                                () ->
                                        new ApiException(
                                                "NOT_FOUND",
                                                "This review request is no longer active.",
                                                HttpStatus.NOT_FOUND));

        if (MedicalReviewRequest.STATUS_CANCELLED.equalsIgnoreCase(req.getStatus())) {
            throw new ApiException(
                    "GONE", "This review request is no longer active.", HttpStatus.BAD_REQUEST);
        }
        if (MedicalReviewRequest.STATUS_BOOKED.equalsIgnoreCase(req.getStatus())
                || !isBlank(req.getAppointmentId())) {
            throw new ApiException(
                    "CONFLICT", "Review appointment already booked", HttpStatus.CONFLICT);
        }

        String time = str(body.get("time"));
        if (isBlank(time)) {
            throw new ApiException("VALIDATION_ERROR", "Please select a time.", HttpStatus.BAD_REQUEST);
        }

        String professionalId = "user-" + req.getAdvisorUserId();
        try {
            bookingAvailabilityService.assertSlotAvailable(
                    professionalId, req.getReviewDate(), time, DURATION);
        } catch (ApiException ex) {
            throw new ApiException(
                    "CONFLICT",
                    "This time slot is no longer available. Please select another time.",
                    HttpStatus.CONFLICT);
        }

        User client = userRepository.findById(clientUserId).orElseThrow();
        walletService.pay(new UserPrincipal(client), "MEDICAL");
        User advisor = userRepository.findById(req.getAdvisorUserId()).orElse(null);
        String advisorName =
                firstNonBlank(req.getAdvisorName(), displayAdvisorName(advisor), "Medical Advisor");

        Appointment a = new Appointment();
        a.setId("apt-" + UUID.randomUUID().toString().substring(0, 8));
        a.setClientUserId(clientUserId);
        a.setClientId("BF-C" + clientUserId);
        a.setClientName((client.getFirstName() + " " + client.getLastName()).trim());
        a.setServiceType(SERVICE_NAME);
        a.setProfessional(advisorName);
        a.setProfessionalUserId(req.getAdvisorUserId());
        a.setProfessionalRole("Medical Advisor");
        a.setAppointmentDate(req.getReviewDate());
        a.setAppointmentTime(time);
        a.setDuration(DURATION);
        a.setStatus("Upcoming");
        a.setBookingReference("BF-APT-" + (10000 + (int) (Math.random() * 90000)));
        a.setNotes("Booked from medical review request " + req.getId() + " (" + req.getSourceType() + ")");
        a.setLocation("VitalLife Wellness Centre");
        a.setAudience("CLIENT");
        appointmentRepository.save(a);

        req.setStatus(MedicalReviewRequest.STATUS_BOOKED);
        req.setAppointmentId(a.getId());
        req.setUpdatedAt(Instant.now());
        reviewRequestRepository.save(req);

        notifyReviewConfirmed(req, time, advisorName);

        Map<String, Object> out = toMap(req);
        out.put("appointment", mapper.appointmentMap(a));
        return out;
    }

    public Map<String, Object> toMap(MedicalReviewRequest req) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", req.getId());
        m.put("clientUserId", req.getClientUserId());
        m.put("advisorUserId", req.getAdvisorUserId());
        m.put("medicalAdvisorId", req.getAdvisorUserId());
        m.put("advisorName", req.getAdvisorName());
        m.put("professionalId", "user-" + req.getAdvisorUserId());
        m.put("reviewDate", req.getReviewDate() == null ? null : req.getReviewDate().toString());
        m.put(
                "reviewDateLabel",
                req.getReviewDate() == null ? null : DISPLAY_DATE.format(req.getReviewDate()));
        m.put("sourceType", req.getSourceType());
        m.put("sourceRecordId", req.getSourceRecordId());
        m.put("status", req.getStatus());
        m.put("appointmentId", req.getAppointmentId());
        m.put("serviceId", "medical");
        m.put("serviceName", SERVICE_NAME);
        m.put("duration", DURATION);
        m.put("chooseTimePath", "/client/appointments/book?reviewRequestId=" + req.getId());
        m.put("createdAt", req.getCreatedAt() == null ? null : req.getCreatedAt().toString());
        m.put("updatedAt", req.getUpdatedAt() == null ? null : req.getUpdatedAt().toString());
        return m;
    }

    private void notifyReviewRequested(MedicalReviewRequest req, boolean updated) {
        String dateLabel =
                req.getReviewDate() == null ? "the scheduled date" : DISPLAY_DATE.format(req.getReviewDate());
        String advisor = firstNonBlank(req.getAdvisorName(), "Your Medical Advisor");
        String title = updated ? "Medical Review Updated" : "Medical Review Requested";
        String body =
                advisor
                        + " has requested your next medical review on "
                        + dateLabel
                        + ". Please choose a suitable appointment time.";
        createClientNotification(
                req.getClientUserId(),
                "appointment",
                title,
                body,
                "/client/appointments/book?reviewRequestId=" + req.getId());
    }

    private void notifyReviewMoved(MedicalReviewRequest req, String time) {
        String dateLabel =
                req.getReviewDate() == null ? "the new date" : DISPLAY_DATE.format(req.getReviewDate());
        String when = isBlank(time) ? dateLabel : dateLabel + " at " + time;
        createClientNotification(
                req.getClientUserId(),
                "appointment",
                "Medical Review Moved",
                firstNonBlank(req.getAdvisorName(), "Your Medical Advisor")
                        + " moved your medical review to "
                        + when
                        + ".",
                "/client/appointments");
    }

    private void notifyReviewConfirmed(MedicalReviewRequest req, String time, String advisorName) {
        String dateLabel =
                req.getReviewDate() == null ? "" : DISPLAY_DATE.format(req.getReviewDate());
        createClientNotification(
                req.getClientUserId(),
                "appointment",
                "Medical Review Confirmed",
                "Your medical review with "
                        + firstNonBlank(advisorName, "your Medical Advisor")
                        + " is confirmed for "
                        + dateLabel
                        + " at "
                        + time
                        + ".",
                "/client/appointments");
    }

    private void createClientNotification(
            Long userId, String type, String title, String body, String link) {
        if (userId == null) return;
        NotificationEntity n = new NotificationEntity();
        n.setId("ntf-" + UUID.randomUUID().toString().substring(0, 8));
        n.setUserId(userId);
        n.setAudience("CLIENT");
        n.setType(type);
        n.setTitle(title);
        n.setBody(body);
        n.setLink(link);
        n.setReadFlag(false);
        n.setCreatedAt(Instant.now());
        notificationRepository.save(n);
    }

    private static String displayAdvisorName(User advisor) {
        if (advisor == null) return "Medical Advisor";
        String full = (advisor.getFirstName() + " " + advisor.getLastName()).trim();
        if (full.isBlank()) return "Medical Advisor";
        if (full.toLowerCase(Locale.ROOT).startsWith("dr")) return full;
        return "Dr. " + full;
    }

    public static LocalDate toLocalDate(Instant instant) {
        if (instant == null) return null;
        return instant.atZone(ZoneId.systemDefault()).toLocalDate();
    }

    private static String firstNonBlank(String... values) {
        if (values == null) return null;
        for (String v : values) {
            if (v != null && !v.isBlank()) return v.trim();
        }
        return null;
    }

    private static boolean isBlank(String v) {
        return v == null || v.isBlank();
    }

    private static String str(Object o) {
        return o == null ? null : String.valueOf(o);
    }
}
