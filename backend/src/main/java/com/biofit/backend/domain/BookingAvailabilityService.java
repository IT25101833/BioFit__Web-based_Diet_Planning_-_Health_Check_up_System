package com.biofit.backend.domain;

import com.biofit.backend.common.ApiException;
import com.biofit.backend.user.RoleName;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingAvailabilityService {

    private static final Pattern AMPM =
            Pattern.compile("^(\\d{1,2}):(\\d{2})\\s*(AM|PM)$", Pattern.CASE_INSENSITIVE);
    private static final Pattern H24 = Pattern.compile("^(\\d{1,2}):(\\d{2})$");
    private static final DateTimeFormatter LABEL =
            DateTimeFormatter.ofPattern("h:mm a", Locale.US);

    private final StaffAvailabilityRepository availabilityRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public Map<String, Object> bookingCatalog(String audience) {
        boolean staffAudience = "STAFF".equalsIgnoreCase(audience);
        List<Map<String, Object>> services = new ArrayList<>();
        if (staffAudience) {
            services.add(service("staff-meeting", "Manager Check-in", "Staff meeting with the Wellness Centre Manager.", "30 min", "STAFF"));
            services.add(service("ops-review", "Operations Review", "Centre operations discussion with the manager.", "45 min", "STAFF"));
        } else {
            services.add(service("fitness", "Fitness Consultation", "Movement guidance and programme check-in.", "45 min", "CLIENT"));
            services.add(service("nutrition", "Nutrition Consultation", "Meal rhythm support and dietary guidance.", "45 min", "CLIENT"));
            services.add(service("checkup", "Health Check-up", "Scheduled wellness assessment.", "60 min", "CLIENT"));
            services.add(service("medical", "Medical Review", "Follow-up of authorised health information.", "30 min", "CLIENT"));
            services.add(service("wellness", "Wellness Consultation", "Holistic lifestyle support.", "40 min", "CLIENT"));
            services.add(service("support", "Customer Experience Session", "Help with bookings and centre experience.", "30 min", "CLIENT"));
            services.add(service("ops-support", "Digital Operations Support", "Platform access assistance.", "30 min", "CLIENT"));
        }

        List<Map<String, Object>> professionals = new ArrayList<>();
        for (User user : userRepository.findAll()) {
            if (user.getDeletedAt() != null) continue;
            RoleName role = primaryRole(user);
            if (role == null || role == RoleName.CLIENT || role == RoleName.ADMIN) continue;
            if (staffAudience && role != RoleName.WELLNESS_CENTRE_MANAGER) continue;
            if (!staffAudience && role == RoleName.WELLNESS_CENTRE_MANAGER) continue;

            Map<String, Object> m = new LinkedHashMap<>();
            String id = "user-" + user.getId();
            m.put("id", id);
            m.put("userId", user.getId());
            m.put("name", user.getFirstName() + " " + user.getLastName());
            m.put("role", displayRole(role));
            m.put("roleKey", role.name());
            m.put("audience", role == RoleName.WELLNESS_CENTRE_MANAGER ? "STAFF" : "CLIENT");
            m.put("services", servicesForRole(role));
            professionals.add(m);
            ensureDefaultHours(id, user.getId());
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("services", services);
        out.put("professionals", professionals);
        return out;
    }

    public Map<String, Object> dayAvailability(String professionalId, String dateIso, String durationLabel) {
        return dayAvailability(professionalId, dateIso, durationLabel, null);
    }

    public Map<String, Object> dayAvailability(
            String professionalId, String dateIso, String durationLabel, String excludeAppointmentId) {
        LocalDate date = LocalDate.parse(dateIso);
        int duration = parseDuration(durationLabel);
        // Java DayOfWeek Mon=1..Sun=7 → JS-style Sun=0
        int jsDow = date.getDayOfWeek().getValue() % 7;
        List<int[]> working = workingWindows(professionalId, jsDow);

        if (working.isEmpty()) {
            Map<String, Object> closed = new LinkedHashMap<>();
            closed.put("availableSlots", List.of());
            closed.put("unavailableWindows", List.of(Map.of("start", "12:00 AM", "end", "11:59 PM", "reason", "Closed")));
            closed.put("workingHours", null);
            closed.put("freeRanges", List.of());
            closed.put("message", "This person is not available on this day.");
            return closed;
        }

        List<int[]> occupied = new ArrayList<>();
        for (StaffAvailabilityEntity block :
                availabilityRepository.findByProfessionalIdAndSpecificDate(professionalId, date)) {
            if (!"BLOCKED".equalsIgnoreCase(block.getKind())) continue;
            Integer s = parseMinutes(block.getStartTime());
            Integer e = parseMinutes(block.getEndTime());
            if (s != null && e != null) occupied.add(new int[] {s, e, 1});
        }

        for (Appointment apt : appointmentRepository.findAll()) {
            if (excludeAppointmentId != null && excludeAppointmentId.equals(apt.getId())) continue;
            if (apt.getAppointmentDate() == null || !apt.getAppointmentDate().equals(date)) continue;
            if (isCancelledStatus(apt.getStatus())) continue;
            boolean matches =
                    professionalId.equals(apt.getProfessional())
                            || (apt.getProfessionalUserId() != null
                                    && professionalId.equals("user-" + apt.getProfessionalUserId()))
                            || professionalId.equalsIgnoreCase(String.valueOf(apt.getProfessional()));
            // Match by name stored on appointment when booking used display name
            User linked = resolveUser(professionalId);
            if (!matches && linked != null) {
                String full = linked.getFirstName() + " " + linked.getLastName();
                matches = full.equalsIgnoreCase(apt.getProfessional());
            }
            if (!matches) continue;
            Integer start = parseMinutes(apt.getAppointmentTime());
            if (start == null) continue;
            occupied.add(new int[] {start, start + parseDuration(apt.getDuration()), 2});
        }

        List<int[]> free = subtract(working, occupied);
        int nowMinutes = -1;
        if (date.equals(LocalDate.now(java.time.ZoneId.systemDefault()))) {
            java.time.LocalTime now = java.time.LocalTime.now(java.time.ZoneId.systemDefault());
            nowMinutes = now.getHour() * 60 + now.getMinute();
        }
        List<String> slots = new ArrayList<>();
        for (int[] seg : free) {
            for (int t = seg[0]; t + duration <= seg[1]; t += 30) {
                if (nowMinutes >= 0 && t <= nowMinutes) continue;
                slots.add(formatLabel(t));
            }
        }

        List<Map<String, Object>> unavailable = new ArrayList<>();
        for (int[] o : occupied) {
            unavailable.add(
                    Map.of(
                            "start", formatLabel(o[0]),
                            "end", formatLabel(o[1]),
                            "reason", o[2] == 2 ? "Booked" : "Unavailable"));
        }

        int workStart = working.stream().mapToInt(w -> w[0]).min().orElse(0);
        int workEnd = working.stream().mapToInt(w -> w[1]).max().orElse(0);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("availableSlots", slots);
        out.put("unavailableWindows", unavailable);
        out.put("workingHours", Map.of("start", formatLabel(workStart), "end", formatLabel(workEnd)));
        out.put(
                "freeRanges",
                free.stream().map(f -> Map.of("start", formatLabel(f[0]), "end", formatLabel(f[1]))).toList());
        out.put("message", slots.isEmpty() ? "No open slots on this day. Try another date." : null);
        return out;
    }

    public void assertSlotAvailable(String professionalId, LocalDate date, String time, String durationLabel) {
        assertSlotAvailable(professionalId, date, time, durationLabel, null);
    }

    public void assertSlotAvailable(
            String professionalId,
            LocalDate date,
            String time,
            String durationLabel,
            String excludeAppointmentId) {
        LocalDate today = LocalDate.now(java.time.ZoneId.systemDefault());
        if (date.isBefore(today)) {
            throw new ApiException(
                    "VALIDATION_ERROR",
                    "Appointment date cannot be in the past.",
                    HttpStatus.BAD_REQUEST);
        }
        if (date.equals(today)) {
            Integer start = parseMinutes(time);
            java.time.LocalTime now = java.time.LocalTime.now(java.time.ZoneId.systemDefault());
            int nowMinutes = now.getHour() * 60 + now.getMinute();
            if (start != null && start <= nowMinutes) {
                throw new ApiException(
                        "SLOT_UNAVAILABLE",
                        "That time has already passed today. Please choose a later slot.",
                        HttpStatus.CONFLICT);
            }
        }
        Map<String, Object> day =
                dayAvailability(professionalId, date.toString(), durationLabel, excludeAppointmentId);
        @SuppressWarnings("unchecked")
        List<String> slots = (List<String>) day.getOrDefault("availableSlots", List.of());
        String normalized = formatLabel(parseMinutes(time));
        boolean ok = slots.stream().anyMatch(s -> s.equalsIgnoreCase(time) || s.equalsIgnoreCase(normalized));
        if (!ok) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> blocked =
                    (List<Map<String, Object>>) day.getOrDefault("unavailableWindows", List.of());
            for (Map<String, Object> b : blocked) {
                Integer bs = parseMinutes(String.valueOf(b.get("start")));
                Integer be = parseMinutes(String.valueOf(b.get("end")));
                Integer start = parseMinutes(time);
                int end = start == null ? -1 : start + parseDuration(durationLabel);
                if (start != null && bs != null && be != null && start < be && bs < end) {
                    String reason = String.valueOf(b.get("reason"));
                    if ("Booked".equalsIgnoreCase(reason)) {
                        throw new ApiException(
                                "SLOT_UNAVAILABLE",
                                "This slot is already booked (" + b.get("start") + "–" + b.get("end")
                                        + "). Please try another time.",
                                HttpStatus.CONFLICT);
                    }
                    throw new ApiException(
                            "SLOT_UNAVAILABLE",
                            "Not available from " + b.get("start") + " to " + b.get("end")
                                    + ". Please choose another time.",
                            HttpStatus.CONFLICT);
                }
            }
            throw new ApiException(
                    "SLOT_UNAVAILABLE",
                    "That time is outside available hours. Please choose another slot.",
                    HttpStatus.CONFLICT);
        }
    }

    public Map<String, Object> availabilityProfile(String professionalId) {
        ensureDefaultHours(professionalId, null);
        Map<String, Object> weekly = new LinkedHashMap<>();
        for (int d = 0; d <= 6; d++) {
            weekly.put(String.valueOf(d), List.of());
        }
        List<Map<String, Object>> blocks = new ArrayList<>();
        for (StaffAvailabilityEntity row :
                availabilityRepository.findByProfessionalIdOrderByCreatedAtAsc(professionalId)) {
            if ("WORKING".equalsIgnoreCase(row.getKind()) && row.getDayOfWeek() != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> list =
                        (List<Map<String, Object>>) weekly.get(String.valueOf(row.getDayOfWeek()));
                list = new ArrayList<>(list);
                list.add(Map.of("start", row.getStartTime(), "end", row.getEndTime()));
                weekly.put(String.valueOf(row.getDayOfWeek()), list);
            } else if ("BLOCKED".equalsIgnoreCase(row.getKind())) {
                Map<String, Object> b = new LinkedHashMap<>();
                b.put("id", row.getId());
                b.put("professionalId", row.getProfessionalId());
                b.put("date", row.getSpecificDate() == null ? null : row.getSpecificDate().toString());
                b.put("start", row.getStartTime());
                b.put("end", row.getEndTime());
                b.put("reason", row.getReason());
                blocks.add(b);
            }
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("professionalId", professionalId);
        out.put("weeklyHours", weekly);
        out.put("blocks", blocks);
        return out;
    }

    @Transactional
    public Map<String, Object> saveWeeklyHours(String professionalId, Map<String, Object> weeklyHours) {
        List<StaffAvailabilityEntity> existing =
                availabilityRepository.findByProfessionalIdAndKindIgnoreCase(professionalId, "WORKING");
        availabilityRepository.deleteAll(existing);

        for (Map.Entry<String, Object> entry : weeklyHours.entrySet()) {
            int day = Integer.parseInt(entry.getKey());
            Object value = entry.getValue();
            if (!(value instanceof List<?> list)) continue;
            for (Object item : list) {
                if (!(item instanceof Map<?, ?> map)) continue;
                StaffAvailabilityEntity row = new StaffAvailabilityEntity();
                row.setId("av-" + UUID.randomUUID().toString().substring(0, 8));
                row.setProfessionalId(professionalId);
                row.setKind("WORKING");
                row.setDayOfWeek(day);
                row.setStartTime(String.valueOf(map.get("start")));
                row.setEndTime(String.valueOf(map.get("end")));
                availabilityRepository.save(row);
            }
        }
        return availabilityProfile(professionalId);
    }

    @Transactional
    public Map<String, Object> addBlock(Map<String, Object> payload) {
        StaffAvailabilityEntity row = new StaffAvailabilityEntity();
        row.setId("blk-" + UUID.randomUUID().toString().substring(0, 8));
        row.setProfessionalId(String.valueOf(payload.get("professionalId")));
        row.setKind("BLOCKED");
        row.setSpecificDate(LocalDate.parse(String.valueOf(payload.get("date"))));
        row.setStartTime(String.valueOf(payload.getOrDefault("start", payload.get("startTime"))));
        row.setEndTime(String.valueOf(payload.getOrDefault("end", payload.get("endTime"))));
        row.setReason(String.valueOf(payload.getOrDefault("reason", "Unavailable")));
        availabilityRepository.save(row);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", row.getId());
        out.put("professionalId", row.getProfessionalId());
        out.put("date", row.getSpecificDate().toString());
        out.put("start", row.getStartTime());
        out.put("end", row.getEndTime());
        out.put("reason", row.getReason());
        return out;
    }

    @Transactional
    public Map<String, Object> removeBlock(String id) {
        availabilityRepository.deleteById(id);
        return Map.of("id", id, "removed", true);
    }

    @Transactional
    public void notifyProfessional(Long professionalUserId, String title, String body, String link) {
        if (professionalUserId == null) return;
        NotificationEntity n = new NotificationEntity();
        n.setId("ntf-" + UUID.randomUUID().toString().substring(0, 8));
        n.setUserId(professionalUserId);
        User user = userRepository.findById(professionalUserId).orElse(null);
        n.setAudience(user == null ? "STAFF" : primaryRole(user) == null ? "STAFF" : primaryRole(user).name());
        n.setType("appointments");
        n.setTitle(title);
        n.setBody(body);
        n.setLink(link);
        n.setReadFlag(false);
        notificationRepository.save(n);
    }

    private void ensureDefaultHours(String professionalId, Long userId) {
        if (!availabilityRepository.findByProfessionalIdAndKindIgnoreCase(professionalId, "WORKING").isEmpty()) {
            return;
        }
        for (int d = 1; d <= 6; d++) {
            StaffAvailabilityEntity row = new StaffAvailabilityEntity();
            row.setId("av-" + UUID.randomUUID().toString().substring(0, 8));
            row.setProfessionalId(professionalId);
            row.setProfessionalUserId(userId);
            row.setKind("WORKING");
            row.setDayOfWeek(d);
            row.setStartTime("9:00 AM");
            row.setEndTime("5:00 PM");
            availabilityRepository.save(row);
        }
    }

    private List<int[]> workingWindows(String professionalId, int dayOfWeek) {
        List<int[]> windows = new ArrayList<>();
        for (StaffAvailabilityEntity row :
                availabilityRepository.findByProfessionalIdAndKindIgnoreCase(professionalId, "WORKING")) {
            if (row.getDayOfWeek() != null && row.getDayOfWeek() == dayOfWeek) {
                Integer s = parseMinutes(row.getStartTime());
                Integer e = parseMinutes(row.getEndTime());
                if (s != null && e != null && e > s) windows.add(new int[] {s, e});
            }
        }
        return windows;
    }

    private static List<int[]> subtract(List<int[]> working, List<int[]> occupied) {
        List<int[]> free = new ArrayList<>(working);
        for (int[] occ : occupied) {
            List<int[]> next = new ArrayList<>();
            for (int[] seg : free) {
                if (occ[0] >= seg[1] || occ[1] <= seg[0]) {
                    next.add(seg);
                    continue;
                }
                if (occ[0] > seg[0]) next.add(new int[] {seg[0], Math.min(occ[0], seg[1])});
                if (occ[1] < seg[1]) next.add(new int[] {Math.max(occ[1], seg[0]), seg[1]});
            }
            free = next;
        }
        free.sort(Comparator.comparingInt(a -> a[0]));
        return free;
    }

    private User resolveUser(String professionalId) {
        if (professionalId != null && professionalId.startsWith("user-")) {
            try {
                return userRepository.findById(Long.parseLong(professionalId.substring(5))).orElse(null);
            } catch (Exception ignored) {
                return null;
            }
        }
        return null;
    }

    private static RoleName primaryRole(User user) {
        return user.getRoles().stream().findFirst().map(r -> r.getName()).orElse(null);
    }

    private static boolean isCancelledStatus(String status) {
        if (status == null || status.isBlank()) return false;
        String normalized = status.trim().toLowerCase(java.util.Locale.ROOT);
        return normalized.equals("cancelled") || normalized.startsWith("cancelled ");
    }

    private static String displayRole(RoleName role) {
        return switch (role) {
            case WELLNESS_CENTRE_MANAGER -> "Wellness Centre Manager";
            case FITNESS_COACH -> "Fitness Coach";
            case NUTRITION_CONSULTANT -> "Nutrition Consultant";
            case MEDICAL_ADVISOR -> "Medical Advisor";
            case CUSTOMER_EXPERIENCE_OFFICER -> "Customer Experience Officer";
            case DIGITAL_OPERATIONS_EXECUTIVE -> "Digital Operations Executive";
            default -> role.name();
        };
    }

    private static List<String> servicesForRole(RoleName role) {
        return switch (role) {
            case FITNESS_COACH -> List.of("fitness", "wellness");
            case NUTRITION_CONSULTANT -> List.of("nutrition", "wellness");
            case MEDICAL_ADVISOR -> List.of("checkup", "medical");
            case CUSTOMER_EXPERIENCE_OFFICER -> List.of("support", "wellness");
            case DIGITAL_OPERATIONS_EXECUTIVE -> List.of("ops-support");
            case WELLNESS_CENTRE_MANAGER -> List.of("staff-meeting", "ops-review");
            default -> List.of();
        };
    }

    private static Map<String, Object> service(
            String id, String name, String description, String duration, String audience) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("name", name);
        m.put("description", description);
        m.put("duration", duration);
        m.put("forAudience", audience);
        return m;
    }

    static Integer parseMinutes(String label) {
        if (label == null) return null;
        String trimmed = label.trim();
        Matcher ampm = AMPM.matcher(trimmed);
        if (ampm.matches()) {
            int hours = Integer.parseInt(ampm.group(1));
            int minutes = Integer.parseInt(ampm.group(2));
            String period = ampm.group(3).toUpperCase(Locale.US);
            if ("AM".equals(period) && hours == 12) hours = 0;
            if ("PM".equals(period) && hours != 12) hours += 12;
            return hours * 60 + minutes;
        }
        Matcher h24 = H24.matcher(trimmed);
        if (h24.matches()) {
            return Integer.parseInt(h24.group(1)) * 60 + Integer.parseInt(h24.group(2));
        }
        return null;
    }

    static String formatLabel(Integer totalMinutes) {
        if (totalMinutes == null) return "";
        int mins = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
        return LocalTime.of(mins / 60, mins % 60).format(LABEL).toUpperCase(Locale.US).replace("  ", " ");
    }

    static int parseDuration(String duration) {
        if (duration == null) return 45;
        Matcher m = Pattern.compile("(\\d+)").matcher(duration);
        return m.find() ? Integer.parseInt(m.group(1)) : 45;
    }
}
