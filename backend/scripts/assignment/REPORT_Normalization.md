# Normalization Analysis (BioFit) — Report Section

## 1. Initial problems (before assignment pack)
- Missing FKs on many `*_user_id` columns → orphan risk
- No CHECK on amounts/statuses/progress
- `client_name` / staff name copies → update anomaly
- Meal/workout detail in JSON → repeating groups (1NF pressure for those attributes)
- `wellness_programmes.enrolled` can drift from enrolment rows

## 2. Example functional dependencies
**users:** `id → email, first_name, last_name, status, …` ; `email → id` (candidate key)  
**payments:** `id → user_id, amount, status, …`  
**programme_enrolments:** `id → programme_id, client_user_id, progress, …`  
**workout_plan_exercises:** `(workout_plan_id, exercise_id, sequence_no) → day_label, sets_label, …`

## 3. 1NF
Atomic columns on relational tables. JSON retained only as documented semi-structured payloads for UI compatibility.

## 4. 2NF
No partial dependency on composite keys in junction tables; non-key attributes depend on full composite PK.

## 5. 3NF
Canonical person attributes live in `users`. Display name copies on tickets/appointments are **intentional historical snapshots** (documented exception), not the source of truth for current name.

## 6. BCNF
Auth and health core satisfy BCNF (each determinant is a candidate key). Snapshot columns are the deliberate exception.

## 7. Anomalies eliminated / reduced
| Anomaly | Mitigation |
|---------|------------|
| Insert orphan payment | FK `fk_payments_user` |
| Negative amount | CHECK `amount > 0` |
| Invalid status | CHECK lists aligned to app |
| Workout–exercise link only in JSON | `workout_plan_exercises` |
| Unaudited metric changes | trigger → `audit_logs` |

## 8. Trade-offs
- Keeping `client_name` avoids breaking JPA/UI and preserves “name at time of event”.
- Keeping JSON avoids a risky big-bang rewrite of meal/ticket UIs.
- `enrolled` counter still denormalized; can be recomputed from enrolments in queries/views if needed later.
