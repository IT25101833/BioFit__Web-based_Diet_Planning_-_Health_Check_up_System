# BioFit Assignment — Architecture & Change Log (Phases 1–5)

## What existed before
- 29 Flyway-managed tables (auth, health, domain, medical, erasure)
- Partial FKs (mainly health + auth + programme_id)
- Indexes on some FK/status/date columns
- App-level `audit_logs` writes
- Java demo seeders (not SQL INSERT pack)
- **No** CHECKs, views, procedures, functions, triggers, or query portfolio

## What changed (additive assignment pack)
Location: `backend/scripts/assignment/`

| Change | Why | Assignment part |
|--------|-----|-----------------|
| `workout_plan_exercises` | Proper M:N plans↔exercises | A |
| `subscriptions.amount` | Numeric aggregation | B, D |
| Missing user FKs + ON DELETE policies | Referential integrity | B |
| CHECK constraints | Domain rules at DB level | B |
| Filtered UNIQUE on `booking_reference` | Candidate business key | B |
| Indexes on payments/subs/appts/metrics/junction | Query + procedure performance | D |
| SQL sample data (≥5/table target) | Part C evidence | C |
| 4 views | Reporting | B/D |
| `fn_CalculateBMI` | Reusable scalar function | E |
| `sp_CreateAppointment` | Validated transactional booking | E |
| `trg_health_metrics_audit` | Set-based audit trigger | F |
| Queries 01–15 + tests + plan helpers | Part D + validation | D |
| Scripts 13–17 domain pack | Per-management fn/proc/trigger/views + tests | E/F/D/viva |
| `REPORT_Domain_Speaker_Cards.md` | Team speaking map | viva |

## What was intentionally NOT changed
- Table/column names used by JPA
- JSON payload columns (`plan_json`, `messages_json`, …)
- No Client/Staff ISA subtype tables (roles M:N retained)
- No Flyway migration mirror yet (SSMS assignment pack first — safer for app)

## Normalization stance
- Core auth/health: 3NF / BCNF
- `client_name` snapshots: kept for app + historical display; reports JOIN `users`
- JSON: documented semi-structured payloads; relational M:N demonstrated via `workout_plan_exercises`
