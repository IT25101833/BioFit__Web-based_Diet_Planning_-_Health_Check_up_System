# BioFit IT2140 Assignment — SQL Server Script Pack

**Database:** `biofit` (existing BioFit schema)  
**Engine:** Microsoft SQL Server / T-SQL  
**Rule:** Additive only — does not rename or drop live application tables/columns.

## Status (applied on this machine)

Scripts **01–12** were executed successfully against `localhost,1433` / `biofit`.

Verified (core pack 01–12):
- All tables ≥5 rows
- 34 foreign keys, 19 CHECK constraints
- Objects: `workout_plan_exercises`, 4 views, `fn_CalculateBMI`, `sp_CreateAppointment`, `trg_health_metrics_audit`
- BMI test: `fn_CalculateBMI(170,68)` → **23.53**
- Procedure success + conflict/FK/CHECK rejection tests passed
- Trigger multi-row audit delta = 3
- Spring Boot (`sqlserver` profile) **Started** on port **8080**

**Domain pack (13–17)** — applied on this machine against `biofit`. See `REPORT_Domain_Speaker_Cards.md` for per-management speaking points.

## Run order (SSMS or sqlcmd)

1. Ensure base Flyway schema exists (V1–V9).
2. Run core: `01` → `02` → **`02b`** → `03` → `04` → … → `12`
3. Run domain pack: **`13` → `14` → `15` → `16` → `17`**
4. For **sqlcmd**, always pass **`-I`** (QUOTED_IDENTIFIER ON):

```bat
sqlcmd -S localhost,1433 -E -C -d biofit -I -i 03_Constraints_FKs_CHECKs.sql
sqlcmd -S localhost,1433 -E -C -d biofit -I -i 13_Domain_Functions.sql
```

| Script | Purpose |
|--------|---------|
| `01_Database_Notes.sql` | Notes / checklist |
| `02_Tables_Additive_DDL.sql` | Junction table + `subscriptions.amount` |
| `02b_Hibernate_Column_Alignment.sql` | LOB types for Hibernate validate |
| `03_Constraints_FKs_CHECKs.sql` | FKs / CHECKs / UNIQUE |
| `04_Indexes.sql` | Indexes |
| `05_Sample_Data.sql` | Sample data |
| `06_Views.sql` | Core views |
| `07_Functions.sql` | `fn_CalculateBMI` |
| `08_Stored_Procedures.sql` | `sp_CreateAppointment` |
| `09_Triggers.sql` | `trg_health_metrics_audit` |
| `10_Queries.sql` | QUERY 01–15 |
| `11_Test_Cases.sql` | Core tests |
| `12_Execution_Plan_Analysis.sql` | Plan helpers |
| **`13_Domain_Functions.sql`** | Functions for every management area |
| **`14_Domain_Stored_Procedures.sql`** | Procedures for every management area |
| **`15_Domain_Triggers.sql`** | Triggers for every management area |
| **`16_Domain_Views_Advanced.sql`** | Domain views + CTE/window/CROSS APPLY demos |
| **`17_Domain_Test_Cases.sql`** | Domain success/failure demos |

## App note

`application-sqlserver.properties` sets `spring.flyway.validate-on-migrate=false` because V7–V9 were applied via SSMS for this setup. Hibernate `ddl-auto=validate` still checks the schema.

## Evidence rule

Never invent query results, timings, or plans. Re-run 10–12 in SSMS and screenshot real grids/plans for the report.
