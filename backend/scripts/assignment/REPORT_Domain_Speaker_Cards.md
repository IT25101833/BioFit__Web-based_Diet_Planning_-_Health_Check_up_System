# Domain Speaker Cards — Who explains what

Use this so each teammate owns a management area in the SQL viva.
All objects live under `backend/scripts/assignment/` (scripts **07–09** core + **13–17** domain pack).

---

## Appointment Management
**Owner talking point:** transactional booking + cancel + audit trail

| Object | Type | Script |
|--------|------|--------|
| `sp_CreateAppointment` | Procedure | 08 |
| `sp_CancelAppointment` | Procedure | 14 |
| `fn_CountClientUpcomingAppointments` | Function | 13 |
| `trg_appointments_status_audit` | Trigger | 15 |
| `vw_AppointmentDetails` / `vw_AppointmentWorkload` | Views | 06 / 16 |

**Viva line:** “Booking is validated inside a transaction; status changes are audited set-based from `inserted`/`deleted`.”

**Demo:** Script 11 T01/T02 + Script 17 D10

---

## Nutrition Management
**Owner talking point:** plan assignment + automatic versioning

| Object | Type | Script |
|--------|------|--------|
| `sp_AssignMealPlan` | Procedure | 14 |
| `fn_ClientActiveMealPlanCount` | Function | 13 |
| `trg_meal_plans_version_bump` | Trigger | 15 |
| `vw_NutritionClientOverview` | View | 16 |

**Viva line:** “When meal plan content changes, the trigger bumps `version_no` once per statement and writes an audit row — no app-side version logic required.”

**Demo:** Script 17 D01 + D02

---

## Healthcare Management
**Owner talking point:** BMI calculation + clinical audit + risk alerts

| Object | Type | Script |
|--------|------|--------|
| `fn_CalculateBMI` | Function | 07 |
| `fn_ClassifyBMICategory` | Function | 13 |
| `sp_RaiseHealthRiskAlert` | Procedure | 14 |
| `trg_health_metrics_audit` | Trigger | 09 |
| `trg_health_risk_alert_audit` | Trigger | 15 |
| `vw_UserHealthSummary` / `vw_HealthcareRiskBoard` | Views | 06 / 16 |

**Viva line:** “Functions compute (BMI/category); metrics trigger is set-based so a 3-row INSERT writes 3 audit rows.”

**Demo:** Script 11 T07/T08 + Script 17 D03/D04 + ADV-02 LAG weights

---

## Fitness Management
**Owner talking point:** M:N workout↔exercise junction + assessment audit

| Object | Type | Script |
|--------|------|--------|
| `workout_plan_exercises` | Table (M:N) | 02 |
| `sp_AddExerciseToWorkoutPlan` | Procedure | 14 |
| `fn_WorkoutPlanExerciseCount` | Function | 13 |
| `trg_fitness_assessments_audit` | Trigger | 15 |
| `vw_FitnessPlanBoard` | View | 16 |

**Viva line:** “Plans and exercises are many-to-many; the procedure validates both FKs then inserts the junction row in a transaction.”

**Demo:** Script 17 D05

---

## Customer Support Management
**Owner talking point:** ticket open + urgent auto-notification

| Object | Type | Script |
|--------|------|--------|
| `sp_OpenSupportTicket` | Procedure | 14 |
| `fn_OpenSupportTicketCount` | Function | 13 |
| `trg_support_tickets_status_audit` | Trigger | 15 |
| `vw_SupportQueueBoard` | View | 16 |

**Viva line:** “Opening an Urgent ticket fires a set-based trigger that writes `audit_logs` and inserts a `notifications` row for the CX audience.”

**Demo:** Script 17 D06 + ADV-04 backlog CTE

---

## Programme / Manager Management
**Owner talking point:** capacity-aware enrolment

| Object | Type | Script |
|--------|------|--------|
| `sp_EnrolClientInProgramme` | Procedure | 14 |
| `fn_ProgrammeRemainingCapacity` | Function | 13 |
| `trg_programme_enrolment_sync` | Trigger | 15 |
| `vw_ProgrammeFillRate` | View | 16 |

**Viva line:** “Enrolment procedure checks remaining capacity; the trigger recalculates `enrolled` from Active rows and rejects over-capacity with THROW.”

**Demo:** Script 17 D07 + ADV-05 fill vs average

---

## Billing / Ops Management
**Owner talking point:** validated payments + spend analytics

| Object | Type | Script |
|--------|------|--------|
| `sp_RecordPayment` | Procedure | 14 |
| `fn_ClientTotalPaid` | Function | 13 |
| `trg_payments_audit` | Trigger | 15 |
| `vw_PaymentSummary` / `vw_ActiveSubscriptions` | Views | 06 |

**Viva line:** “Negative amounts fail in the procedure before insert; CHECK constraints still protect direct INSERTs.”

**Demo:** Script 17 D08/D09 + ADV-01 RANK/running total

---

## Advanced SQL (shared / whoever covers Part D)
Show from script **16** bottom section:
1. **CTE + RANK + running total** (billing)
2. **LAG** weight trend (healthcare)
3. **CROSS APPLY** latest appointment
4. **HAVING** support backlog
5. **Window average** programme fill

Also keep original QUERY 01–15 from script **10**.

---

## Suggested speaking order (viva)
1. Design / EER owner  
2. Appointment (proc + trigger)  
3. Healthcare (fn + metrics trigger)  
4. Nutrition (version trigger)  
5. Fitness (junction + proc)  
6. Support (urgent notify trigger)  
7. Programmes (capacity sync)  
8. Billing (payment proc + advanced CTE)  
9. Queries / indexes / plans  
