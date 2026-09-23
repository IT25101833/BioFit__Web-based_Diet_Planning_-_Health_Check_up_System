# Part A — EER → Relational Mapping (BioFit)

## Specialization
**User** with overlapping roles via `user_roles` (not separate Client/Staff subtype tables).  
Reason: multi-role staff (e.g. ADMIN + MEDICAL) and existing Spring Security model.

## Strong entities → tables
| EER entity | Table | PK |
|------------|-------|-----|
| User | users | id |
| Role | roles | id |
| HealthProfile | health_profiles | id (UK user_id → 1:1) |
| HealthMetric | health_metrics | id |
| WellnessProgramme | wellness_programmes | id |
| Appointment | appointments | id |
| Exercise | exercises | id |
| WorkoutPlan | workout_plans | id |
| MealPlan | meal_plans | id |
| Payment | payments | id |
| Subscription | subscriptions | id |
| SupportTicket | support_tickets | id |
| … | (remaining domain/health tables as audited) | |

## Relationships
| Relationship | Cardinality | Mapping |
|--------------|-------------|---------|
| User–Role | M:N | `user_roles` |
| User–Programme | M:N | `programme_enrolments` |
| WorkoutPlan–Exercise | M:N | `workout_plan_exercises` **(new)** |
| User–Appointment (client) | 1:M | `appointments.client_user_id` FK |
| User–Appointment (professional) | 1:M | `appointments.professional_user_id` FK |
| User–HealthMetric | 1:M | FK |
| User–HealthProfile | 1:1 | UNIQUE(user_id) |

## Schema shorthand (selected)

```
users(id PK, email UK NOT NULL, password_hash NOT NULL, first_name, last_name, status DEFAULT 'ACTIVE', deleted_at, ...)
roles(id PK, name UK NOT NULL, ...)
user_roles(user_id FK→users, role_id FK→roles, PK(user_id,role_id))
health_profiles(id PK, user_id UK FK→users, height_cm CHECK, weight_kg CHECK, ...)
health_metrics(id PK, user_id FK→users, metric_type, value_num, recorded_at, ...)
wellness_programmes(id PK, name, status, start_date, end_date CHECK end>=start, capacity CHECK >=0, ...)
programme_enrolments(id PK, programme_id FK→programmes, client_user_id FK→users, progress CHECK 0..100, ...)
appointments(id PK, client_user_id FK→users, professional_user_id FK→users, status CHECK(...), booking_reference UK filtered, ...)
exercises(id PK, name, category, difficulty, ...)
workout_plans(id PK, client_user_id FK→users, plan_json, progress CHECK, ...)
workout_plan_exercises(workout_plan_id FK, exercise_id FK, sequence_no, PK(plan,exercise,seq), ...)
meal_plans(id PK, client_user_id FK→users, plan_json, ...)
payments(id PK, user_id FK→users, amount CHECK >0, status CHECK(...), ...)
subscriptions(id PK, user_id FK→users, status CHECK(...), amount CHECK >=0 NULL, ...)
audit_logs(id PK, user_id FK→users NULL, action, entity_type, entity_id, ...)
```

## Mapping decisions for viva
1. **Why junction for exercises?** Exercises are shared catalogue items; plans reuse them — classic M:N.
2. **Why keep plan_json?** Application UI still reads JSON; junction is the normalized academic/relational view.
3. **Why no ISA tables?** Overlapping roles; subtype tables would duplicate identity and break RBAC.
