# BioFit IT2140 Assignment — SQL Server Script Pack

**Database:** `biofit` (existing BioFit schema)  
**Engine:** Microsoft SQL Server / T-SQL  
**Rule:** Additive only — does not rename or drop live application tables/columns.

## Status (applied on this machine)

Scripts **01–12** were executed successfully against `localhost,1433` / `biofit`.

Verified:
- All tables ≥5 rows
- 34 foreign keys, 19 CHECK constraints
- Objects: `workout_plan_exercises`, 4 views, `fn_CalculateBMI`, `sp_CreateAppointment`, `trg_health_metrics_audit`
- BMI test: `fn_CalculateBMI(170,68)` → **23.53**
- Procedure success + conflict/FK/CHECK rejection tests passed
- Trigger multi-row audit delta = 3
- Spring Boot (`sqlserver` profile) **Started** on port **8080**

## Run order (SSMS or sqlcmd)

1. Ensure base Flyway schema exists (V1–V9).
2. Run: `01` → `02` → **`02b`** → `03` → `04` → … → `12`
3. For **sqlcmd**, always pass **`-I`** (QUOTED_IDENTIFIER ON):

```bat
sqlcmd -S localhost,1433 -E -C -d biofit -I -i 03_Constraints_FKs_CHECKs.sql
```

| Script | Purpose |
|--------|---------|
| `01_Database_Notes.sql` | Notes / checklist |
| `02_Tables_Additive_DDL.sql` | Junction table + `subscriptions.amount` |
| `02b_Hibernate_Column_Alignment.sql` | LOB types for Hibernate validate |
| `03_Constraints_FKs_CHECKs.sql` | FKs / CHECKs / UNIQUE |
| `04_Indexes.sql` | Indexes |
| `05_Sample_Data.sql` | Sample data |
| `06_Views.sql` | Views |
| `07_Functions.sql` | `fn_CalculateBMI` |
| `08_Stored_Procedures.sql` | `sp_CreateAppointment` |
| `09_Triggers.sql` | Audit trigger |
| `10_Queries.sql` | QUERY 01–15 |
| `11_Test_Cases.sql` | Tests |
| `12_Execution_Plan_Analysis.sql` | Plan helpers |

## App note

`application-sqlserver.properties` sets `spring.flyway.validate-on-migrate=false` because V7–V9 were applied via SSMS for this setup. Hibernate `ddl-auto=validate` still checks the schema.

## Evidence rule

Never invent query results, timings, or plans. Re-run 10–12 in SSMS and screenshot real grids/plans for the report.
