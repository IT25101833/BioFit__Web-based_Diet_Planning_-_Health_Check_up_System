/*
================================================================================
BioFit — IT2140 Assignment Part 02
Script 01: Database notes & run checklist
================================================================================
Requires execution: open in SSMS against database [biofit].
================================================================================
*/

USE biofit;
GO

PRINT '=== BioFit assignment script pack ===';
PRINT 'Database: biofit';
PRINT 'Run scripts 02 through 12 in numeric order.';
PRINT '';
PRINT 'Design decisions (summary):';
PRINT '  - Preserve all existing BioFit tables/columns (JPA compatibility).';
PRINT '  - Add workout_plan_exercises for proper M:N (plans <-> exercises).';
PRINT '  - Specialize users via roles (user_roles), not ISA subtype tables.';
PRINT '  - Keep client_name snapshots; canonical name is users.first_name/last_name.';
PRINT '  - One procedure: sp_CreateAppointment (transactions + validation).';
PRINT '  - One function:  fn_CalculateBMI (deterministic scalar).';
PRINT '  - One trigger:   trg_health_metrics_audit (set-based -> audit_logs).';
PRINT '';
PRINT 'ACID (demonstrated in sp_CreateAppointment):';
PRINT '  Atomicity  - all-or-nothing booking insert';
PRINT '  Consistency- FKs/CHECKs + conflict rules';
PRINT '  Isolation  - default READ COMMITTED; discuss booking races in viva';
PRINT '  Durability - committed rows survive restart';
GO

-- Sanity: confirm core tables exist
SELECT t.name AS table_name
FROM sys.tables t
WHERE t.name IN (
    'users','roles','user_roles','health_metrics','appointments',
    'payments','subscriptions','workout_plans','exercises','audit_logs'
)
ORDER BY t.name;
GO
