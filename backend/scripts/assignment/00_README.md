# BioFit IT2140 Assignment — SQL Server Script Pack

**Database:** `biofit` (existing BioFit schema)  
**Engine:** Microsoft SQL Server / T-SQL  
**Rule:** Additive only — does not rename or drop live application tables/columns.

## Run order (SSMS)

1. Connect to SQL Server with a login that can alter `biofit`.
2. `USE biofit;`
3. Execute scripts **01 → 12** in order.
4. Scripts **10–12** produce query/test/plan output — capture screenshots for the report.
5. Do **not** fabricate outputs. Mark anything not yet run as *requires execution*.

| Script | Purpose | Assignment part |
|--------|---------|-----------------|
| `01_Database_Notes.sql` | Assumptions, ACID notes, run checklist | — |
| `02_Tables_Additive_DDL.sql` | `workout_plan_exercises` + optional `subscriptions.amount` | A, B |
| `03_Constraints_FKs_CHECKs.sql` | FKs, CHECKs, UNIQUE | B |
| `04_Indexes.sql` | Performance indexes | D optimization |
| `05_Sample_Data.sql` | ≥5 realistic rows per table | C |
| `06_Views.sql` | Reporting views | B / reporting |
| `07_Functions.sql` | `fn_CalculateBMI` | E |
| `08_Stored_Procedures.sql` | `sp_CreateAppointment` | E |
| `09_Triggers.sql` | `trg_health_metrics_audit` | F |
| `10_Queries.sql` | QUERY 01–15 | D |
| `11_Test_Cases.sql` | Integrity / proc / trigger tests | validation |
| `12_Execution_Plan_Analysis.sql` | Plan capture helpers | D optimization |

## Compatibility

- Existing Spring Boot / JPA / Flyway objects are preserved.
- JSON columns (`plan_json`, `messages_json`, …) remain for the app.
- `workout_plan_exercises` is the relational M:N demonstration for Part A.
- Prefer running this pack in SSMS for assignment evidence; optional later Flyway mirror is separate.

## Evidence rule

Never invent query results, timings, or plans. After running in SSMS, paste real grids / Actual Execution Plans into the report.
