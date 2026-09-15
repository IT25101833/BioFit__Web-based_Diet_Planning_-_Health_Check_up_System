from pathlib import Path

p = Path(__file__).resolve().parents[1] / "frontend" / "src" / "App.jsx"
# fallback absolute
if not p.exists():
    p = Path(r"c:\Users\ramh7\OneDrive - Sri Lanka Institute of Information Technology\Desktop\BipFit project\frontend\src\App.jsx")

text = p.read_text(encoding="utf-8")

if "ForbiddenPage" not in text:
    text = text.replace(
        "import ForgotPasswordPage from './pages/ForgotPasswordPage'",
        "import ForgotPasswordPage from './pages/ForgotPasswordPage'\nimport ForbiddenPage from './pages/ForbiddenPage'",
    )

if "from './auth/ProtectedRoute'" not in text:
    text = text.replace(
        "import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'",
        "import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'\nimport { ProtectedRoute } from './auth/ProtectedRoute'",
    )

if "function guard(" not in text:
    text = text.replace(
        "function App() {",
        "function guard(roles, element) {\n  return <ProtectedRoute roles={roles}>{element}</ProtectedRoute>\n}\n\nfunction App() {",
    )

if 'path="/forbidden"' not in text:
    text = text.replace(
        '<Route path="/reset-password" element={<ResetPasswordPage />} />',
        '<Route path="/reset-password" element={<ResetPasswordPage />} />\n        <Route path="/forbidden" element={<ForbiddenPage />} />',
    )

replacements = [
    ('element={<ClientDashboardPage />}', "element={guard(['CLIENT'], <ClientDashboardPage />)}"),
    ('element={<ClientProfilePage />}', "element={guard(['CLIENT'], <ClientProfilePage />)}"),
    ('element={<ClientProgrammesPage />}', "element={guard(['CLIENT'], <ClientProgrammesPage />)}"),
    ('element={<ClientProgrammeDetailsPage />}', "element={guard(['CLIENT'], <ClientProgrammeDetailsPage />)}"),
    ('element={<ClientAppointmentsPage />}', "element={guard(['CLIENT'], <ClientAppointmentsPage />)}"),
    ('element={<ClientBookAppointmentPage />}', "element={guard(['CLIENT'], <ClientBookAppointmentPage />)}"),
    ('element={<ClientAppointmentDetailsPage />}', "element={guard(['CLIENT'], <ClientAppointmentDetailsPage />)}"),
    ('element={<ClientWorkoutPlanPage />}', "element={guard(['CLIENT'], <ClientWorkoutPlanPage />)}"),
    ('element={<ClientFitnessProgressPage />}', "element={guard(['CLIENT'], <ClientFitnessProgressPage />)}"),
    ('element={<ClientMealPlanPage />}', "element={guard(['CLIENT'], <ClientMealPlanPage />)}"),
    ('element={<ClientNutritionProgressPage />}', "element={guard(['CLIENT'], <ClientNutritionProgressPage />)}"),
    ('element={<ClientHealthPage />}', "element={guard(['CLIENT'], <ClientHealthPage />)}"),
    ('element={<ClientHealthAlertsPage />}', "element={guard(['CLIENT'], <ClientHealthAlertsPage />)}"),
    ('element={<ClientSupportPage />}', "element={guard(['CLIENT'], <ClientSupportPage />)}"),
    ('element={<ClientCreateSupportPage />}', "element={guard(['CLIENT'], <ClientCreateSupportPage />)}"),
    ('element={<ClientSupportDetailsPage />}', "element={guard(['CLIENT'], <ClientSupportDetailsPage />)}"),
    ('element={<ClientNotificationsPage />}', "element={guard(['CLIENT'], <ClientNotificationsPage />)}"),
]

mgr = "['WELLNESS_CENTRE_MANAGER', 'ADMIN']"
coach = "['FITNESS_COACH', 'ADMIN']"
nutri = "['NUTRITION_CONSULTANT', 'ADMIN']"
med = "['MEDICAL_ADVISOR', 'ADMIN']"
sup = "['CUSTOMER_EXPERIENCE_OFFICER', 'ADMIN']"
adm = "['ADMIN', 'DIGITAL_OPERATIONS_EXECUTIVE']"

more = [
    ("ManagerDashboardPage", mgr),
    ("ManagerProgrammesPage", mgr),
    ("ManagerCreateProgrammePage", mgr),
    ("ManagerEditProgrammePage", mgr),
    ("ManagerProgrammeDetailsPage", mgr),
    ("ManagerStaffSchedulingPage", mgr),
    ("ManagerEnrolmentsPage", mgr),
    ("ManagerReportsPage", mgr),
    ("ManagerNotificationsPage", mgr),
    ("ManagerProfilePage", mgr),
    ("CoachDashboardPage", coach),
    ("CoachClientsPage", coach),
    ("CoachClientProfilePage", coach),
    ("CoachExercisesPage", coach),
    ("CoachCreateExercisePage", coach),
    ("CoachEditExercisePage", coach),
    ("CoachWorkoutPlansPage", coach),
    ("CoachCreateWorkoutPlanPage", coach),
    ("CoachEditWorkoutPlanPage", coach),
    ("CoachWorkoutPlanDetailsPage", coach),
    ("CoachAssessmentsPage", coach),
    ("CoachCreateAssessmentPage", coach),
    ("CoachAssessmentDetailsPage", coach),
    ("CoachProgressPage", coach),
    ("CoachClientProgressPage", coach),
    ("CoachNotificationsPage", coach),
    ("CoachProfilePage", coach),
    ("NutritionDashboardPage", nutri),
    ("NutritionClientsPage", nutri),
    ("NutritionClientProfilePage", nutri),
    ("NutritionMealPlansPage", nutri),
    ("NutritionCreateMealPlanPage", nutri),
    ("NutritionEditMealPlanPage", nutri),
    ("NutritionMealPlanDetailsPage", nutri),
    ("NutritionDietaryRestrictionsPage", nutri),
    ("NutritionProgressPage", nutri),
    ("NutritionClientProgressPage", nutri),
    ("NutritionAppointmentsPage", nutri),
    ("NutritionNotificationsPage", nutri),
    ("NutritionProfilePage", nutri),
    ("MedicalDashboardPage", med),
    ("MedicalHealthRecordsPage", med),
    ("MedicalCreateHealthRecordPage", med),
    ("MedicalEditHealthRecordPage", med),
    ("MedicalHealthRecordDetailsPage", med),
    ("MedicalAssessmentsPage", med),
    ("MedicalCreateAssessmentPage", med),
    ("MedicalAssessmentDetailsPage", med),
    ("MedicalHealthAlertsPage", med),
    ("MedicalCreateHealthAlertPage", med),
    ("MedicalHealthAlertDetailsPage", med),
    ("MedicalAppointmentsPage", med),
    ("MedicalNotificationsPage", med),
    ("MedicalProfilePage", med),
    ("SupportDashboardPage", sup),
    ("SupportTicketsPage", sup),
    ("SupportTicketQueuePage", sup),
    ("SupportTicketDetailsPage", sup),
    ("SupportInquiriesPage", sup),
    ("SupportFeedbackPage", sup),
    ("SupportNotificationsPage", sup),
    ("SupportProfilePage", sup),
    ("AdminDashboardPage", adm),
    ("AdminUsersPage", adm),
    ("AdminCreateUserPage", adm),
    ("AdminUserDetailsPage", adm),
    ("AdminEditUserPage", adm),
    ("AdminRolesPage", adm),
    ("AdminMonitoringPage", adm),
    ("AdminAuditPage", adm),
    ("AdminBackupsPage", adm),
    ("AdminNotificationsPage", adm),
    ("AdminProfilePage", adm),
    ("AdminSettingsPage", adm),
]

for old, new in replacements:
    text = text.replace(old, new)

for page, roles in more:
    old = f"element={{<{page} />}}"
    new = f"element={{guard({roles}, <{page} />)}}"
    text = text.replace(old, new)

p.write_text(text, encoding="utf-8")
print("patched", p)
print("guard count", text.count("guard(["))
