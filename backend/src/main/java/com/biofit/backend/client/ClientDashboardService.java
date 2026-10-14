package com.biofit.backend.client;

import com.biofit.backend.client.dto.ClientDashboardDtos.ActivityItem;
import com.biofit.backend.client.dto.ClientDashboardDtos.CareRecommendation;
import com.biofit.backend.client.dto.ClientDashboardDtos.DashboardResponse;
import com.biofit.backend.client.dto.ClientDashboardDtos.HealthItem;
import com.biofit.backend.client.dto.ClientDashboardDtos.MetricCard;
import com.biofit.backend.client.dto.ClientDashboardDtos.NotificationItem;
import com.biofit.backend.client.dto.ClientDashboardDtos.ProgressItem;
import com.biofit.backend.client.dto.ClientDashboardDtos.ReviewRequestItem;
import com.biofit.backend.domain.Appointment;
import com.biofit.backend.domain.AppointmentRepository;
import com.biofit.backend.domain.DomainMapper;
import com.biofit.backend.domain.NotificationEntity;
import com.biofit.backend.domain.NotificationRepository;
import com.biofit.backend.domain.MedicalReviewRequestService;
import com.biofit.backend.health.HealthAssessment;
import com.biofit.backend.health.HealthAssessmentRepository;
import com.biofit.backend.health.HealthGoalRepository;
import com.biofit.backend.health.HealthMetricRepository;
import com.biofit.backend.health.HealthProfile;
import com.biofit.backend.health.HealthProfileRepository;
import com.biofit.backend.health.HealthRiskAlertRepository;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClientDashboardService {

    private static final DateTimeFormatter SHORT_DAY = DateTimeFormatter.ofPattern("d", Locale.ENGLISH);
    private static final DateTimeFormatter SHORT_MONTH =
            DateTimeFormatter.ofPattern("MMM", Locale.ENGLISH);
    private static final DateTimeFormatter SHORT_DATE =
            DateTimeFormatter.ofPattern("d MMM", Locale.ENGLISH);

    private final UserRepository userRepository;
    private final HealthProfileRepository profileRepository;
    private final HealthMetricRepository metricRepository;
    private final HealthGoalRepository goalRepository;
    private final HealthRiskAlertRepository alertRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationRepository notificationRepository;
    private final DomainMapper domainMapper;
    private final MedicalReviewRequestService medicalReviewRequestService;
    private final HealthAssessmentRepository healthAssessmentRepository;

    @Transactional(readOnly = true)
    public DashboardResponse dashboard(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        HealthProfile profile = profileRepository.findByUserId(userId).orElse(null);

        String weightDisplay = null;
        String bmiDisplay = null;
        if (profile != null && profile.getWeightKg() != null) {
            weightDisplay = profile.getWeightKg().stripTrailingZeros().toPlainString() + " kg";
            if (profile.getHeightCm() != null
                    && profile.getHeightCm().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal meters =
                        profile.getHeightCm().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
                BigDecimal bmi =
                        profile.getWeightKg().divide(meters.multiply(meters), 1, RoundingMode.HALF_UP);
                bmiDisplay = bmi.toPlainString();
            }
        }

        long activeAlerts = alertRepository.countByUserIdAndStatusIgnoreCase(userId, "Monitoring");
        var goals = goalRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        Integer avgGoal =
                goals.isEmpty()
                        ? null
                        : (int) goals.stream().mapToInt(g -> g.getProgressPercent()).average().orElse(0);

        String programmeName = null;
        String programmeWeek = null;
        Integer programmeProgress = null;
        String todayFocus = null;
        String todayFocusSupport = null;

        List<Appointment> upcomingAppointments = upcomingAppointmentsForClient(userId);
        Appointment next = upcomingAppointments.isEmpty() ? null : upcomingAppointments.get(0);

        String nextAppointmentTitle = null;
        String nextAppointmentWhen = null;
        String nextAppointmentProfessional = null;
        String nextAppointmentStatus = null;
        String nextAppointmentDateLabel = null;
        String nextAppointmentStartTime = null;

        if (next != null) {
            nextAppointmentTitle = blankToNull(next.getServiceType());
            nextAppointmentProfessional = blankToNull(next.getProfessional());
            nextAppointmentStatus = displayAppointmentStatus(next.getStatus());
            nextAppointmentDateLabel =
                    next.getAppointmentDate() == null
                            ? null
                            : SHORT_DATE.format(next.getAppointmentDate());
            nextAppointmentStartTime = blankToNull(next.getAppointmentTime());
            String endTime = domainMapper.endTimeFor(next);
            if (nextAppointmentDateLabel != null && nextAppointmentStartTime != null) {
                nextAppointmentWhen =
                        nextAppointmentDateLabel
                                + " · "
                                + nextAppointmentStartTime
                                + (endTime != null ? " – " + endTime : "");
            } else if (nextAppointmentDateLabel != null) {
                nextAppointmentWhen = nextAppointmentDateLabel;
            }
        }

        List<MetricCard> summary =
                List.of(
                        new MetricCard(
                                "Current Programme",
                                programmeName,
                                programmeWeek,
                                programmeName != null ? "Active" : null,
                                programmeName != null ? "green" : null),
                        new MetricCard(
                                "Next Appointment",
                                nextAppointmentDateLabel,
                                nextAppointmentTitle != null && nextAppointmentStartTime != null
                                        ? nextAppointmentTitle + " · " + nextAppointmentStartTime
                                        : null,
                                nextAppointmentStatus,
                                next != null ? "teal" : null),
                        new MetricCard(
                                "Today's Focus",
                                todayFocus,
                                todayFocusSupport,
                                todayFocus != null ? "Not Started" : null,
                                todayFocus != null ? "amber" : null),
                        new MetricCard(
                                "Overall Progress",
                                avgGoal != null ? avgGoal + "%" : null,
                                avgGoal != null ? "Based on your goals" : null,
                                avgGoal != null ? "Good" : null,
                                avgGoal != null ? "green" : null));

        List<ProgressItem> progress =
                goals.stream()
                        .limit(3)
                        .map(
                                g ->
                                        new ProgressItem(
                                                g.getTitle(),
                                                g.getProgressPercent(),
                                                g.getTargetValue() == null
                                                        ? "In progress"
                                                        : g.getTargetValue()))
                        .toList();

        List<HealthItem> health = new ArrayList<>();
        health.add(new HealthItem("Weight", weightDisplay));
        health.add(new HealthItem("BMI", bmiDisplay));
        health.add(new HealthItem("Active alerts", String.valueOf(activeAlerts)));
        metricRepository.findByUserIdAndMetricTypeOrderByRecordedAtDesc(userId, "HYDRATION").stream()
                .findFirst()
                .ifPresentOrElse(
                        m ->
                                health.add(
                                        new HealthItem(
                                                "Hydration",
                                                m.getValueText() != null
                                                        ? m.getValueText()
                                                        : m.getValueNum() + " " + m.getUnit())),
                        () -> health.add(new HealthItem("Hydration", null)));

        List<ActivityItem> upcoming =
                upcomingAppointments.stream()
                        .limit(3)
                        .map(
                                a ->
                                        new ActivityItem(
                                                a.getAppointmentDate() == null
                                                        ? null
                                                        : SHORT_DAY.format(a.getAppointmentDate()),
                                                a.getAppointmentDate() == null
                                                        ? null
                                                        : SHORT_MONTH.format(a.getAppointmentDate()),
                                                blankToNull(a.getServiceType()),
                                                blankToNull(a.getAppointmentTime())))
                        .toList();

        List<NotificationItem> notifications =
                notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                        .limit(3)
                        .map(this::toNotificationItem)
                        .toList();

        ReviewRequestItem pendingReview = null;
        Map<String, Object> pending = medicalReviewRequestService.nearestPending(userId);
        if (pending != null) {
            pendingReview =
                    new ReviewRequestItem(
                            str(pending.get("id")),
                            str(pending.get("advisorName")),
                            str(pending.get("reviewDate")),
                            str(pending.get("reviewDateLabel")),
                            str(pending.get("chooseTimePath")),
                            str(pending.get("status")),
                            pending.get("advisorUserId") instanceof Number n ? n.longValue() : null,
                            str(pending.get("professionalId")),
                            str(pending.get("sourceType")));
        }

        return new DashboardResponse(
                user.getFirstName(),
                summary,
                programmeName,
                programmeWeek,
                programmeProgress,
                nextAppointmentTitle,
                nextAppointmentWhen,
                nextAppointmentProfessional,
                nextAppointmentStatus,
                progress,
                health,
                upcoming,
                notifications,
                pendingReview,
                careRecommendation(userId));
    }

    private CareRecommendation careRecommendation(Long userId) {
        HealthAssessment latest =
                healthAssessmentRepository.findFirstByUserIdOrderByAssessedAtDesc(userId).orElse(null);
        if (latest == null) return null;
        Object observations = domainMapper.parseJson(latest.getObservationsJson(), Map.of());
        boolean nutrition = recommendationFlag(observations, "recommendNutrition");
        boolean fitness = recommendationFlag(observations, "recommendFitness");
        if (!nutrition && !fitness) return null;
        String assessmentDate = null;
        if (latest.getAssessedAt() != null) {
            assessmentDate =
                    DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH)
                            .format(latest.getAssessedAt().atZone(ZoneId.of("UTC")));
        }
        return new CareRecommendation(
                latest.getId() == null ? null : String.valueOf(latest.getId()),
                blankToNull(latest.getAdvisorName()),
                assessmentDate,
                nutrition,
                fitness);
    }

    private static boolean recommendationFlag(Object observations, String key) {
        if (!(observations instanceof Map<?, ?> map)) return false;
        Object value = map.get(key);
        if (value instanceof Boolean flag) return flag;
        return value != null && "true".equalsIgnoreCase(String.valueOf(value).trim());
    }

    private static String str(Object o) {
        return o == null ? null : String.valueOf(o);
    }

    private List<Appointment> upcomingAppointmentsForClient(Long userId) {
        LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());
        return appointmentRepository.findByClientUserIdOrderByAppointmentDateAsc(userId).stream()
                .filter(ClientDashboardService::isActiveUpcomingAppointment)
                .filter(a -> isAtOrAfter(a, now))
                .sorted(
                        Comparator.comparing(
                                        Appointment::getAppointmentDate,
                                        Comparator.nullsLast(Comparator.naturalOrder()))
                                .thenComparing(
                                        a -> parseTimeMinutes(a.getAppointmentTime()),
                                        Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    /**
     * Future dashboard slots only: exclude completed/attended/cancelled appointments while
     * keeping them stored for history.
     */
    private static boolean isActiveUpcomingAppointment(Appointment a) {
        if (a == null) {
            return false;
        }
        if (isInactiveAppointmentStatus(a.getStatus())) {
            return false;
        }
        String attendance = a.getAttendance() == null ? "" : a.getAttendance().trim();
        if (attendance.equalsIgnoreCase("ATTENDED")
                || attendance.equalsIgnoreCase("ADVISOR_UNAVAILABLE")) {
            return false;
        }
        return true;
    }

    private static boolean isInactiveAppointmentStatus(String status) {
        if (status == null || status.isBlank()) {
            return false;
        }
        String normalized = status.trim().toLowerCase(Locale.ROOT);
        if (normalized.equals("completed")
                || normalized.equals("attended")
                || normalized.equals("cancelled")
                || normalized.startsWith("cancelled ")) {
            return true;
        }
        return false;
    }

    private static boolean isAtOrAfter(Appointment a, LocalDateTime now) {
        if (a.getAppointmentDate() == null) {
            return false;
        }
        LocalDate date = a.getAppointmentDate();
        if (date.isAfter(now.toLocalDate())) {
            return true;
        }
        if (date.isBefore(now.toLocalDate())) {
            return false;
        }
        Integer minutes = parseTimeMinutes(a.getAppointmentTime());
        if (minutes == null) {
            // Same-day appointment with unknown time — still treat as upcoming.
            return true;
        }
        LocalTime start = LocalTime.of(minutes / 60, minutes % 60);
        return !LocalDateTime.of(date, start).isBefore(now);
    }

    private static String displayAppointmentStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        if ("Upcoming".equalsIgnoreCase(status) || "Confirmed".equalsIgnoreCase(status)) {
            return "Confirmed";
        }
        return status;
    }

    private NotificationItem toNotificationItem(NotificationEntity n) {
        String type = n.getType() == null ? "" : n.getType().toLowerCase(Locale.ROOT);
        String icon = "default";
        String tone = "green";
        if (type.contains("plan-access") || type.contains("plan_access")) {
            icon = "access";
            tone = "amber";
        } else if (type.contains("appointment")) {
            icon = "appointment";
            tone = "teal";
        } else if (type.contains("health")) {
            icon = "health";
            tone = "green";
        } else if (type.contains("meal") || type.contains("nutrition")) {
            icon = "health";
            tone = "teal";
        }
        return new NotificationItem(
                icon, n.getTitle(), n.getBody(), relativeTime(n.getCreatedAt()), tone);
    }

    private static String relativeTime(Instant createdAt) {
        if (createdAt == null) {
            return null;
        }
        Duration d = Duration.between(createdAt, Instant.now());
        if (d.isNegative()) {
            d = Duration.ZERO;
        }
        long minutes = d.toMinutes();
        if (minutes < 1) {
            return "Just now";
        }
        if (minutes < 60) {
            return minutes + "m ago";
        }
        long hours = d.toHours();
        if (hours < 24) {
            return hours + "h ago";
        }
        long days = d.toDays();
        if (days == 1) {
            return "Yesterday";
        }
        if (days < 7) {
            return days + "d ago";
        }
        return SHORT_DATE.format(createdAt.atZone(ZoneId.systemDefault()).toLocalDate());
    }

    private static Integer parseTimeMinutes(String label) {
        if (label == null || label.isBlank()) {
            return null;
        }
        String t = label.trim().toUpperCase(Locale.ROOT);
        try {
            if (t.endsWith("AM") || t.endsWith("PM")) {
                boolean pm = t.endsWith("PM");
                String core = t.replace("AM", "").replace("PM", "").trim();
                String[] parts = core.split(":");
                int h = Integer.parseInt(parts[0].trim());
                int m = parts.length > 1 ? Integer.parseInt(parts[1].trim()) : 0;
                if (h == 12) {
                    h = 0;
                }
                if (pm) {
                    h += 12;
                }
                return h * 60 + m;
            }
            String[] parts = t.split(":");
            return Integer.parseInt(parts[0].trim()) * 60
                    + (parts.length > 1 ? Integer.parseInt(parts[1].trim()) : 0);
        } catch (Exception ex) {
            return null;
        }
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
