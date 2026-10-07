# Marking Scheme Audit (Honest)

| Criterion | Weight | Requirement | Our implementation | Evidence | Status |
|-----------|--------|-------------|-------------------|----------|--------|
| EER → Relational | 10 | Correct mapping, keys, cardinalities, ISA if any | Mapping doc + junction + roles M:N ISA decision | REPORT_PartA_Mapping.md; script 02 | **Ready for evidence** (diagram still student-drawn) |
| SQL DDL | 20 | Tables, constraints, integrity | Additive DDL + FKs + CHECKs + indexes | scripts 02–04 | **Implemented — requires SSMS run** |
| Sample Data | 10 | ≥5 meaningful rows/table | script 05 + coverage query | script 05 | **Implemented — requires SSMS run** |
| SQL Queries & Outputs | 20 | SELECT, JOIN, agg, GROUP/HAVING, subquery + advanced | Q01–15 | script 10 | **Implemented — outputs require execution** |
| Stored Function/Procedure | 15 | Working routine with validation | Core: `fn_CalculateBMI`, `sp_CreateAppointment`. Domain pack: 7 functions + 6 procedures (appointment cancel, meal plan, risk alert, workout link, support ticket, programme enrol, payment) | scripts 07–08, 13–14, 11, 17 | **Implemented — requires execution** |
| Trigger | 15 | Meaningful, preferably set-based | Core: `trg_health_metrics_audit`. Domain: appointments, meal-plan version, risk alerts, fitness assessments, support (+ Urgent notify), programme capacity sync, payments | scripts 09, 15, 11, 17 | **Implemented — requires execution** |
| Viva & Demonstration | 10 | Explain design | Per-domain speaker cards + Viva Q&A | REPORT_Viva.md, REPORT_Domain_Speaker_Cards.md | **Draft ready** |

## Excellent descriptors — current claim level
Do **not** claim 100% until SSMS evidence is captured.

| Area | Claim now | Blocker |
|------|-----------|---------|
| Design quality | Strong on paper | Need EER screenshot |
| DDL/integrity | Strong if scripts succeed | Script 03 may need clean DB / orphan clean |
| Sample data | Strong if coverage ≥5 | Verify coverage query |
| Queries | Strong portfolio | Need real grids |
| Proc/Fn/Trigger | Strong design | Need success/fail demos |
| Optimization | Scripts ready | Need real plans — never fabricate |

## Student explainability cards

### fn_CalculateBMI
- WHAT: Computes BMI  
- WHY: Height/weight on profiles  
- HOW: Scalar deterministic function  
- VIVA: “Functions calculate; procedures change data / use transactions”

### sp_CreateAppointment
- WHAT: Creates booking after validation  
- WHY: Prevent double-booking  
- HOW: TRY/CATCH, XACT_ABORT, transaction  
- VIVA: Show T01 success and T02 conflict failure

### trg_health_metrics_audit
- WHAT: Logs metric changes to audit_logs  
- WHY: Clinical traceability  
- HOW: inserted/deleted set-based  
- VIVA: “Triggers fire once per statement — T08 inserts 3 audit rows”

### Domain pack (scripts 13–17) — assign one area per speaker
See **REPORT_Domain_Speaker_Cards.md** for the full map. Minimum claim for marking: core objects above. Domain pack strengthens coverage and viva depth across Appointment, Nutrition, Healthcare, Fitness, Support, Programmes, Billing.
