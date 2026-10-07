# Screenshot / Evidence Checklist

**Rule:** Only attach screenshots after real SSMS execution. Mark unchecked items as *requires execution*.

## A — Design
- [ ] A1 EER diagram (draw from REPORT_PartA_Mapping.md)
- [ ] A2 Relational schema shorthand / SSMS diagram

## B — DDL
- [ ] B1 `workout_plan_exercises` CREATE success
- [ ] B2 FK list (`SELECT name FROM sys.foreign_keys`)
- [ ] B3 CHECK list (`sys.check_constraints`)
- [ ] B4 Index list (script 12 catalogue query)

## C — Sample data (≥5 each)
Run coverage query at end of `05_Sample_Data.sql`, then sample:
- [ ] C1 users / roles / user_roles
- [ ] C2 health_profiles / health_metrics / health_goals
- [ ] C3 appointments / payments / subscriptions
- [ ] C4 workout_plans / exercises / workout_plan_exercises
- [ ] C5 support_tickets / notifications / programmes / enrolments
- [ ] C6 remaining tables from coverage result (all ≥5)

## D — Queries
- [ ] D1 Q01 output
- [ ] D2 Q02 JOIN output
- [ ] D3 Q05 aggregation output
- [ ] D4 Q06–Q07 GROUP BY / HAVING
- [ ] D5 Q08–Q10 subquery / EXISTS
- [ ] D6 Q11–Q15 advanced
- [ ] D7 Actual plans for script 12 (A/B/C)

## E — Procedure / Function
- [ ] E1 `fn_CalculateBMI` code + `SELECT dbo.fn_CalculateBMI(170,68)`
- [ ] E2 `sp_CreateAppointment` code
- [ ] E3 T01 success
- [ ] E4 T02/T03 failure messages

## F — Trigger
- [ ] F1 trigger code
- [ ] F2 audit_logs before
- [ ] F3 T07 single insert
- [ ] F4 T08 multi-row (delta = 3)

## Validation
- [ ] T04 negative payment rejected
- [ ] T05 bad status rejected
- [ ] T06 bad FK rejected
- [ ] T10 views return rows
- [ ] T11 orphan check empty
