# Viva Preparation — Based on FINAL BioFit Implementation

Only features that exist in `backend/scripts/assignment/` and the live schema.

## Design
**Q: Why one `users` table instead of Client/Staff ISA tables?**  
A: Roles are overlapping (M:N via `user_roles`). Subtypes would break multi-role accounts and our Spring Security model.

**Q: What is `workout_plan_exercises`?**  
A: Associative entity for M:N between `workout_plans` and `exercises`, with `sequence_no` and day/sets labels.

**Q: Why keep `client_name` if we have `client_user_id`?**  
A: Snapshot at event time for tickets/appointments; current name comes from JOIN to `users` in views.

**Q: Why keep `plan_json`?**  
A: Application still stores meal/workout UI payloads as JSON; the junction demonstrates normalized M:N without breaking the app.

## Keys & integrity
**Q: Candidate key example?**  
A: `users.email` (UNIQUE) in addition to surrogate `id`.

**Q: Filtered unique index?**  
A: `ux_appointments_booking_reference` unique where reference IS NOT NULL.

**Q: ON DELETE choices?**  
A: `notifications.user_id` CASCADE; clinical/payment history NO ACTION; professional on appointment SET NULL-compatible (nullable FK).

## Normalization
**Q: Insert anomaly we prevented?**  
A: Payment with non-existent `user_id` blocked by FK.

**Q: Update anomaly example still possible?**  
A: Renaming a user does not auto-update historical `client_name` snapshots — by design.

**Q: 1NF and JSON?**  
A: JSON is a documented semi-structured attribute; relational repeating groups for exercises are in the junction table.

## SQL
**Q: HAVING vs WHERE?**  
A: Q07 filters groups after aggregation (`SUM(amount) > 10000`).

**Q: Correlated subquery?**  
A: Q09 latest weight per user compares `recorded_at` to `MAX` for the same user.

**Q: Window function use?**  
A: Q13 `RANK` spenders; `LAG` previous weight.

## Procedure / Function / Trigger
**Q: Difference procedure vs function?**  
A: `sp_CreateAppointment` modifies data + transaction; `fn_CalculateBMI` returns a value, no side effects.

**Q: How does the procedure prevent double booking?**  
A: Checks existing non-cancelled rows for same professional/client date+time before INSERT.

**Q: Why is the trigger set-based?**  
A: SQL Server fires once per statement; T08 multi-row INSERT must write multiple `audit_logs` from `inserted`.

**Q: What tables does the trigger use?**  
A: `inserted` / `deleted` virtual tables; writes to existing `audit_logs`.

## Domain pack extras (assign speakers — see REPORT_Domain_Speaker_Cards.md)
**Q: Nutrition — what does the meal-plan trigger do?**  
A: `trg_meal_plans_version_bump` increments `version_no` when name/goal/description/plan_json change, and audits the bump.

**Q: Support — how do Urgent tickets notify CX?**  
A: `trg_support_tickets_status_audit` inserts into `notifications` (audience SUPPORT) when priority becomes Urgent.

**Q: Programmes — how is capacity enforced?**  
A: `sp_EnrolClientInProgramme` checks `fn_ProgrammeRemainingCapacity`; `trg_programme_enrolment_sync` recalculates `enrolled` and THROWs if over capacity.

**Q: Fitness — why a junction procedure?**  
A: `sp_AddExerciseToWorkoutPlan` validates both FKs then inserts `workout_plan_exercises` (M:N) transactionally.

**Q: Billing — procedure vs CHECK?**  
A: `sp_RecordPayment` rejects amount ≤ 0 with a clear error; `ck_payments_amount_positive` still blocks raw INSERT bypasses.

**Q: Advanced SQL examples?**  
A: Script 16: CTE+RANK running totals, LAG weight trend, CROSS APPLY latest appointment, HAVING backlog, window avg fill rate.

## Transactions / concurrency
**Q: ACID in BioFit booking?**  
A: Demonstrated in `sp_CreateAppointment` (atomic insert, rollback on error).

**Q: Isolation concern?**  
A: Two sessions booking the same slot — under READ COMMITTED a race is possible; discuss unique conflict index / SERIALIZABLE as future hardening (not over-engineered in pack).

## Security
**Q: SQL injection?**  
A: Procedure uses parameters; Spring Data JPA also parameterizes — never concatenate user input into SQL.

## Indexes
**Q: Why `IX_payments_user_paid`?**  
A: Speeds Q06/Q13 spend grouping and includes amount/status to reduce lookups.
