import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute'
import ClientDashboardPage from './pages/ClientDashboardPage'
import ClientProfilePage from './pages/ClientProfilePage'
import ClientAppointmentDetailsPage from './pages/client/ClientAppointmentDetailsPage'
import ClientAppointmentsPage from './pages/client/ClientAppointmentsPage'
import ClientBookAppointmentPage from './pages/client/ClientBookAppointmentPage'
import ClientCreateSupportPage from './pages/client/ClientCreateSupportPage'
import ClientFitnessProgressPage from './pages/client/ClientFitnessProgressPage'
import ClientHealthAlertsPage from './pages/client/ClientHealthAlertsPage'
import ClientHealthPage from './pages/client/ClientHealthPage'
import ClientMealPlanPage from './pages/client/ClientMealPlanPage'
import ClientNotificationsPage from './pages/client/ClientNotificationsPage'
import ClientNutritionProgressPage from './pages/client/ClientNutritionProgressPage'
import ClientProgrammeDetailsPage from './pages/client/ClientProgrammeDetailsPage'
import ClientProgrammesPage from './pages/client/ClientProgrammesPage'
import ClientSupportDetailsPage from './pages/client/ClientSupportDetailsPage'
import ClientSupportPage from './pages/client/ClientSupportPage'
import ClientWorkoutPlanPage from './pages/client/ClientWorkoutPlanPage'
import CoachAssessmentDetailsPage from './pages/coach/CoachAssessmentDetailsPage'
import CoachAssessmentsPage from './pages/coach/CoachAssessmentsPage'
import CoachClientProfilePage from './pages/coach/CoachClientProfilePage'
import CoachClientProgressPage from './pages/coach/CoachClientProgressPage'
import CoachClientsPage from './pages/coach/CoachClientsPage'
import CoachCreateAssessmentPage from './pages/coach/CoachCreateAssessmentPage'
import CoachCreateExercisePage from './pages/coach/CoachCreateExercisePage'
import CoachCreateWorkoutPlanPage from './pages/coach/CoachCreateWorkoutPlanPage'
import CoachDashboardPage from './pages/coach/CoachDashboardPage'
import CoachEditExercisePage from './pages/coach/CoachEditExercisePage'
import CoachEditWorkoutPlanPage from './pages/coach/CoachEditWorkoutPlanPage'
import CoachExercisesPage from './pages/coach/CoachExercisesPage'
import CoachNotificationsPage from './pages/coach/CoachNotificationsPage'
import CoachProfilePage from './pages/coach/CoachProfilePage'
import CoachProgressPage from './pages/coach/CoachProgressPage'
import CoachWorkoutPlanDetailsPage from './pages/coach/CoachWorkoutPlanDetailsPage'
import CoachWorkoutPlansPage from './pages/coach/CoachWorkoutPlansPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ForbiddenPage from './pages/ForbiddenPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import LogoutPage from './pages/LogoutPage'
import AboutPage from './pages/marketing/AboutPage'
import ContactPage from './pages/marketing/ContactPage'
import FitnessPage from './pages/marketing/FitnessPage'
import HealthCheckupsPage from './pages/marketing/HealthCheckupsPage'
import NutritionPage from './pages/marketing/NutritionPage'
import ServicesPage from './pages/marketing/ServicesPage'
import MedicalAppointmentsPage from './pages/medical/MedicalAppointmentsPage'
import MedicalAssessmentDetailsPage from './pages/medical/MedicalAssessmentDetailsPage'
import MedicalAssessmentsPage from './pages/medical/MedicalAssessmentsPage'
import MedicalCreateAssessmentPage from './pages/medical/MedicalCreateAssessmentPage'
import MedicalCreateHealthAlertPage from './pages/medical/MedicalCreateHealthAlertPage'
import MedicalCreateHealthRecordPage from './pages/medical/MedicalCreateHealthRecordPage'
import MedicalDashboardPage from './pages/medical/MedicalDashboardPage'
import MedicalEditHealthRecordPage from './pages/medical/MedicalEditHealthRecordPage'
import MedicalHealthAlertDetailsPage from './pages/medical/MedicalHealthAlertDetailsPage'
import MedicalHealthAlertsPage from './pages/medical/MedicalHealthAlertsPage'
import MedicalHealthRecordDetailsPage from './pages/medical/MedicalHealthRecordDetailsPage'
import MedicalHealthRecordsPage from './pages/medical/MedicalHealthRecordsPage'
import MedicalNotificationsPage from './pages/medical/MedicalNotificationsPage'
import MedicalProfilePage from './pages/medical/MedicalProfilePage'
import NutritionAppointmentsPage from './pages/nutrition/NutritionAppointmentsPage'
import NutritionClientProfilePage from './pages/nutrition/NutritionClientProfilePage'
import NutritionClientProgressPage from './pages/nutrition/NutritionClientProgressPage'
import NutritionClientsPage from './pages/nutrition/NutritionClientsPage'
import NutritionCreateMealPlanPage from './pages/nutrition/NutritionCreateMealPlanPage'
import NutritionDashboardPage from './pages/nutrition/NutritionDashboardPage'
import NutritionDietaryRestrictionsPage from './pages/nutrition/NutritionDietaryRestrictionsPage'
import NutritionEditMealPlanPage from './pages/nutrition/NutritionEditMealPlanPage'
import NutritionMealPlanDetailsPage from './pages/nutrition/NutritionMealPlanDetailsPage'
import NutritionMealPlansPage from './pages/nutrition/NutritionMealPlansPage'
import NutritionNotificationsPage from './pages/nutrition/NutritionNotificationsPage'
import NutritionProfilePage from './pages/nutrition/NutritionProfilePage'
import NutritionProgressPage from './pages/nutrition/NutritionProgressPage'
import ManagerCreateProgrammePage from './pages/manager/ManagerCreateProgrammePage'
import ManagerDashboardPage from './pages/manager/ManagerDashboardPage'
import ManagerEditProgrammePage from './pages/manager/ManagerEditProgrammePage'
import ManagerEnrolmentsPage from './pages/manager/ManagerEnrolmentsPage'
import ManagerNotificationsPage from './pages/manager/ManagerNotificationsPage'
import ManagerProfilePage from './pages/manager/ManagerProfilePage'
import ManagerProgrammeDetailsPage from './pages/manager/ManagerProgrammeDetailsPage'
import ManagerProgrammesPage from './pages/manager/ManagerProgrammesPage'
import ManagerReportsPage from './pages/manager/ManagerReportsPage'
import ManagerStaffSchedulingPage from './pages/manager/ManagerStaffSchedulingPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import SupportDashboardPage from './pages/support/SupportDashboardPage'
import SupportTicketsPage from './pages/support/SupportTicketsPage'
import SupportTicketQueuePage from './pages/support/SupportTicketQueuePage'
import SupportTicketDetailsPage from './pages/support/SupportTicketDetailsPage'
import SupportResolveTicketPage from './pages/support/SupportResolveTicketPage'
import SupportInquiriesPage from './pages/support/SupportInquiriesPage'
import SupportFeedbackPage from './pages/support/SupportFeedbackPage'
import SupportNotificationsPage from './pages/support/SupportNotificationsPage'
import SupportProfilePage from './pages/support/SupportProfilePage'
import {
  AdminAuditPage,
  AdminBackupsPage,
  AdminCreateUserPage,
  AdminDashboardPage,
  AdminEditUserPage,
  AdminMonitoringPage,
  AdminNotificationsPage,
  AdminProfilePage,
  AdminRolesPage,
  AdminSettingsPage,
  AdminUserDetailsPage,
  AdminUsersPage,
} from './pages/admin/AdminPages'

function guard(roles, element) {
  return <ProtectedRoute roles={roles}>{element}</ProtectedRoute>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/fitness" element={<FitnessPage />} />
        <Route path="/nutrition" element={<NutritionPage />} />
        <Route path="/health-checkups" element={<HealthCheckupsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/contact" element={<RegisterPage />} />
        <Route path="/register/review" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />

        {/* Existing client routes (preserved) */}
        <Route path="/dashboard" element={guard(['CLIENT'], <ClientDashboardPage />)} />
        <Route path="/profile" element={guard(['CLIENT'], <ClientProfilePage />)} />

        {/* Phase 1 — remaining client portal */}
        <Route path="/client/programmes" element={guard(['CLIENT'], <ClientProgrammesPage />)} />
        <Route path="/client/programmes/:id" element={guard(['CLIENT'], <ClientProgrammeDetailsPage />)} />
        <Route path="/client/appointments" element={guard(['CLIENT'], <ClientAppointmentsPage />)} />
        <Route path="/client/appointments/book" element={guard(['CLIENT'], <ClientBookAppointmentPage />)} />
        <Route path="/client/appointments/:id" element={guard(['CLIENT'], <ClientAppointmentDetailsPage />)} />
        <Route path="/client/workout-plan" element={guard(['CLIENT'], <ClientWorkoutPlanPage />)} />
        <Route path="/client/fitness-progress" element={guard(['CLIENT'], <ClientFitnessProgressPage />)} />
        <Route path="/client/meal-plan" element={guard(['CLIENT'], <ClientMealPlanPage />)} />
        <Route path="/client/nutrition-progress" element={guard(['CLIENT'], <ClientNutritionProgressPage />)} />
        <Route path="/client/health" element={guard(['CLIENT'], <ClientHealthPage />)} />
        <Route path="/client/health-alerts" element={guard(['CLIENT'], <ClientHealthAlertsPage />)} />
        <Route path="/client/support" element={guard(['CLIENT'], <ClientSupportPage />)} />
        <Route path="/client/support/create" element={guard(['CLIENT'], <ClientCreateSupportPage />)} />
        <Route path="/client/support/:id" element={guard(['CLIENT'], <ClientSupportDetailsPage />)} />
        <Route path="/client/notifications" element={guard(['CLIENT'], <ClientNotificationsPage />)} />

        {/* Phase 2 — Wellness Centre Manager portal */}
        <Route path="/manager/dashboard" element={guard(['WELLNESS_CENTRE_MANAGER', 'ADMIN'], <ManagerDashboardPage />)} />
        <Route path="/manager/programmes" element={guard(['WELLNESS_CENTRE_MANAGER', 'ADMIN'], <ManagerProgrammesPage />)} />
        <Route path="/manager/programmes/create" element={guard(['WELLNESS_CENTRE_MANAGER', 'ADMIN'], <ManagerCreateProgrammePage />)} />
        <Route path="/manager/programmes/:id/edit" element={guard(['WELLNESS_CENTRE_MANAGER', 'ADMIN'], <ManagerEditProgrammePage />)} />
        <Route path="/manager/programmes/:id" element={guard(['WELLNESS_CENTRE_MANAGER', 'ADMIN'], <ManagerProgrammeDetailsPage />)} />
        <Route path="/manager/staff-scheduling" element={guard(['WELLNESS_CENTRE_MANAGER', 'ADMIN'], <ManagerStaffSchedulingPage />)} />
        <Route path="/manager/enrolments" element={guard(['WELLNESS_CENTRE_MANAGER', 'ADMIN'], <ManagerEnrolmentsPage />)} />
        <Route path="/manager/reports" element={guard(['WELLNESS_CENTRE_MANAGER', 'ADMIN'], <ManagerReportsPage />)} />
        <Route path="/manager/notifications" element={guard(['WELLNESS_CENTRE_MANAGER', 'ADMIN'], <ManagerNotificationsPage />)} />
        <Route path="/manager/profile" element={guard(['WELLNESS_CENTRE_MANAGER', 'ADMIN'], <ManagerProfilePage />)} />

        {/* Phase 3 — Fitness Coach portal */}
        <Route path="/coach/dashboard" element={guard(['FITNESS_COACH', 'ADMIN'], <CoachDashboardPage />)} />
        <Route path="/coach/clients" element={guard(['FITNESS_COACH', 'ADMIN'], <CoachClientsPage />)} />
        <Route path="/coach/clients/:id" element={guard(['FITNESS_COACH', 'ADMIN'], <CoachClientProfilePage />)} />
        <Route path="/coach/exercises" element={guard(['FITNESS_COACH', 'ADMIN'], <CoachExercisesPage />)} />
        <Route path="/coach/exercises/create" element={guard(['FITNESS_COACH', 'ADMIN'], <CoachCreateExercisePage />)} />
        <Route path="/coach/exercises/:id/edit" element={guard(['FITNESS_COACH', 'ADMIN'], <CoachEditExercisePage />)} />
        <Route path="/coach/workout-plans" element={guard(['FITNESS_COACH', 'ADMIN'], <CoachWorkoutPlansPage />)} />
        <Route path="/coach/workout-plans/create" element={guard(['FITNESS_COACH', 'ADMIN'], <CoachCreateWorkoutPlanPage />)} />
        <Route path="/coach/workout-plans/:id/edit" element={guard(['FITNESS_COACH', 'ADMIN'], <CoachEditWorkoutPlanPage />)} />
        <Route path="/coach/workout-plans/:id" element={guard(['FITNESS_COACH', 'ADMIN'], <CoachWorkoutPlanDetailsPage />)} />
        <Route path="/coach/assessments" element={guard(['FITNESS_COACH', 'ADMIN'], <CoachAssessmentsPage />)} />
        <Route path="/coach/assessments/create" element={guard(['FITNESS_COACH', 'ADMIN'], <CoachCreateAssessmentPage />)} />
        <Route path="/coach/assessments/:id" element={guard(['FITNESS_COACH', 'ADMIN'], <CoachAssessmentDetailsPage />)} />
        <Route path="/coach/progress" element={guard(['FITNESS_COACH', 'ADMIN'], <CoachProgressPage />)} />
        <Route path="/coach/progress/:clientId" element={guard(['FITNESS_COACH', 'ADMIN'], <CoachClientProgressPage />)} />
        <Route path="/coach/notifications" element={guard(['FITNESS_COACH', 'ADMIN'], <CoachNotificationsPage />)} />
        <Route path="/coach/profile" element={guard(['FITNESS_COACH', 'ADMIN'], <CoachProfilePage />)} />

        {/* Phase 4 — Nutrition Consultant portal */}
        <Route path="/nutrition/dashboard" element={guard(['NUTRITION_CONSULTANT', 'ADMIN'], <NutritionDashboardPage />)} />
        <Route path="/nutrition/clients" element={guard(['NUTRITION_CONSULTANT', 'ADMIN'], <NutritionClientsPage />)} />
        <Route path="/nutrition/clients/:id" element={guard(['NUTRITION_CONSULTANT', 'ADMIN'], <NutritionClientProfilePage />)} />
        <Route path="/nutrition/meal-plans" element={guard(['NUTRITION_CONSULTANT', 'ADMIN'], <NutritionMealPlansPage />)} />
        <Route path="/nutrition/meal-plans/create" element={guard(['NUTRITION_CONSULTANT', 'ADMIN'], <NutritionCreateMealPlanPage />)} />
        <Route path="/nutrition/meal-plans/:id/edit" element={guard(['NUTRITION_CONSULTANT', 'ADMIN'], <NutritionEditMealPlanPage />)} />
        <Route path="/nutrition/meal-plans/:id" element={guard(['NUTRITION_CONSULTANT', 'ADMIN'], <NutritionMealPlanDetailsPage />)} />
        <Route path="/nutrition/dietary-restrictions" element={guard(['NUTRITION_CONSULTANT', 'ADMIN'], <NutritionDietaryRestrictionsPage />)} />
        <Route path="/nutrition/progress" element={guard(['NUTRITION_CONSULTANT', 'ADMIN'], <NutritionProgressPage />)} />
        <Route path="/nutrition/progress/:clientId" element={guard(['NUTRITION_CONSULTANT', 'ADMIN'], <NutritionClientProgressPage />)} />
        <Route path="/nutrition/appointments" element={guard(['NUTRITION_CONSULTANT', 'ADMIN'], <NutritionAppointmentsPage />)} />
        <Route path="/nutrition/notifications" element={guard(['NUTRITION_CONSULTANT', 'ADMIN'], <NutritionNotificationsPage />)} />
        <Route path="/nutrition/profile" element={guard(['NUTRITION_CONSULTANT', 'ADMIN'], <NutritionProfilePage />)} />

        {/* Phase 5 — Medical Advisor portal */}
        <Route path="/medical/dashboard" element={guard(['MEDICAL_ADVISOR', 'ADMIN'], <MedicalDashboardPage />)} />
        <Route path="/medical/health-records" element={guard(['MEDICAL_ADVISOR', 'ADMIN'], <MedicalHealthRecordsPage />)} />
        <Route path="/medical/health-records/create" element={guard(['MEDICAL_ADVISOR', 'ADMIN'], <MedicalCreateHealthRecordPage />)} />
        <Route path="/medical/health-records/:id/edit" element={guard(['MEDICAL_ADVISOR', 'ADMIN'], <MedicalEditHealthRecordPage />)} />
        <Route path="/medical/health-records/:id" element={guard(['MEDICAL_ADVISOR', 'ADMIN'], <MedicalHealthRecordDetailsPage />)} />
        <Route path="/medical/assessments" element={guard(['MEDICAL_ADVISOR', 'ADMIN'], <MedicalAssessmentsPage />)} />
        <Route path="/medical/assessments/create" element={guard(['MEDICAL_ADVISOR', 'ADMIN'], <MedicalCreateAssessmentPage />)} />
        <Route path="/medical/assessments/:id" element={guard(['MEDICAL_ADVISOR', 'ADMIN'], <MedicalAssessmentDetailsPage />)} />
        <Route path="/medical/health-alerts" element={guard(['MEDICAL_ADVISOR', 'ADMIN'], <MedicalHealthAlertsPage />)} />
        <Route path="/medical/health-alerts/create" element={guard(['MEDICAL_ADVISOR', 'ADMIN'], <MedicalCreateHealthAlertPage />)} />
        <Route path="/medical/health-alerts/:id" element={guard(['MEDICAL_ADVISOR', 'ADMIN'], <MedicalHealthAlertDetailsPage />)} />
        <Route path="/medical/appointments" element={guard(['MEDICAL_ADVISOR', 'ADMIN'], <MedicalAppointmentsPage />)} />
        <Route path="/medical/notifications" element={guard(['MEDICAL_ADVISOR', 'ADMIN'], <MedicalNotificationsPage />)} />
        <Route path="/medical/profile" element={guard(['MEDICAL_ADVISOR', 'ADMIN'], <MedicalProfilePage />)} />

        {/* Phase 6 — Customer Experience / Support Portal */}
        <Route path="/support/dashboard" element={guard(['CUSTOMER_EXPERIENCE_OFFICER', 'ADMIN'], <SupportDashboardPage />)} />
        <Route path="/support/tickets" element={guard(['CUSTOMER_EXPERIENCE_OFFICER', 'ADMIN'], <SupportTicketsPage />)} />
        <Route path="/support/ticket-queue" element={guard(['CUSTOMER_EXPERIENCE_OFFICER', 'ADMIN'], <SupportTicketQueuePage />)} />
        <Route path="/support/tickets/:id" element={guard(['CUSTOMER_EXPERIENCE_OFFICER', 'ADMIN'], <SupportTicketDetailsPage />)} />
        <Route path="/support/tickets/:id/resolve" element={guard(['CUSTOMER_EXPERIENCE_OFFICER', 'ADMIN'], <SupportResolveTicketPage />)} />
        <Route path="/support/inquiries" element={guard(['CUSTOMER_EXPERIENCE_OFFICER', 'ADMIN'], <SupportInquiriesPage />)} />
        <Route path="/support/feedback" element={guard(['CUSTOMER_EXPERIENCE_OFFICER', 'ADMIN'], <SupportFeedbackPage />)} />
        <Route path="/support/notifications" element={guard(['CUSTOMER_EXPERIENCE_OFFICER', 'ADMIN'], <SupportNotificationsPage />)} />
        <Route path="/support/profile" element={guard(['CUSTOMER_EXPERIENCE_OFFICER', 'ADMIN'], <SupportProfilePage />)} />

        {/* Phase 7 — Admin / Digital Operations Portal */}
        <Route path="/admin/dashboard" element={guard(['ADMIN', 'DIGITAL_OPERATIONS_EXECUTIVE'], <AdminDashboardPage />)} />
        <Route path="/admin/users" element={guard(['ADMIN', 'DIGITAL_OPERATIONS_EXECUTIVE'], <AdminUsersPage />)} />
        <Route path="/admin/users/create" element={guard(['ADMIN', 'DIGITAL_OPERATIONS_EXECUTIVE'], <AdminCreateUserPage />)} />
        <Route path="/admin/users/:id" element={guard(['ADMIN', 'DIGITAL_OPERATIONS_EXECUTIVE'], <AdminUserDetailsPage />)} />
        <Route path="/admin/users/:id/edit" element={guard(['ADMIN', 'DIGITAL_OPERATIONS_EXECUTIVE'], <AdminEditUserPage />)} />
        <Route path="/admin/roles-access" element={guard(['ADMIN', 'DIGITAL_OPERATIONS_EXECUTIVE'], <AdminRolesPage />)} />
        <Route path="/admin/system-monitoring" element={guard(['ADMIN', 'DIGITAL_OPERATIONS_EXECUTIVE'], <AdminMonitoringPage />)} />
        <Route path="/admin/audit-logs" element={guard(['ADMIN', 'DIGITAL_OPERATIONS_EXECUTIVE'], <AdminAuditPage />)} />
        <Route path="/admin/backups" element={guard(['ADMIN', 'DIGITAL_OPERATIONS_EXECUTIVE'], <AdminBackupsPage />)} />
        <Route path="/admin/notifications" element={guard(['ADMIN', 'DIGITAL_OPERATIONS_EXECUTIVE'], <AdminNotificationsPage />)} />
        <Route path="/admin/profile" element={guard(['ADMIN', 'DIGITAL_OPERATIONS_EXECUTIVE'], <AdminProfilePage />)} />
        <Route path="/admin/settings" element={guard(['ADMIN', 'DIGITAL_OPERATIONS_EXECUTIVE'], <AdminSettingsPage />)} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
