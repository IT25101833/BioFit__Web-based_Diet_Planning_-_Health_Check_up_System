package com.biofit.backend.support;

import com.biofit.backend.user.RoleName;

/** Maps an escalation label to the specialist role, notification audience, and queue page. */
public record SpecialistTarget(String label, RoleName role, String audience, String link) {

    public static SpecialistTarget fromLabel(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String value = raw.trim().toLowerCase();
        if (value.contains("medical")) {
            return new SpecialistTarget(
                    "Medical Advisor", RoleName.MEDICAL_ADVISOR, "MEDICAL", "/medical/escalations");
        }
        if (value.contains("nutrition")) {
            return new SpecialistTarget(
                    "Nutrition Consultant",
                    RoleName.NUTRITION_CONSULTANT,
                    "NUTRITION",
                    "/nutrition/escalations");
        }
        if (value.contains("coach") || value.contains("fitness")) {
            return new SpecialistTarget(
                    "Fitness Coach", RoleName.FITNESS_COACH, "COACH", "/coach/escalations");
        }
        if (value.contains("manager") || value.contains("management")) {
            return new SpecialistTarget(
                    "Wellness Centre Manager",
                    RoleName.WELLNESS_CENTRE_MANAGER,
                    "MANAGER",
                    "/manager/escalations");
        }
        if (value.contains("admin") || value.contains("digital") || value.contains("operations")) {
            return new SpecialistTarget(
                    "Digital Operations / Admin",
                    RoleName.DIGITAL_OPERATIONS_EXECUTIVE,
                    "STAFF",
                    "/admin/notifications");
        }
        return null;
    }

    public boolean matches(String escalatedTo) {
        return escalatedTo != null && escalatedTo.trim().equalsIgnoreCase(label);
    }
}
