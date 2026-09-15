import AdminLayout from '../../components/layout/AdminLayout'
import { AdminDashboard, AdminNotifications, AdminProfile, AuditLogs, BackupManagement, RolesAccess, SystemMonitoring, UserDetails, UserForm, UserManagement } from '../../features/admin/AdminPortal'

const page = (title, Component) => function AdminPage() { return <AdminLayout title={title}><Component /></AdminLayout> }
export const AdminDashboardPage = page('Dashboard', AdminDashboard)
export const AdminUsersPage = page('User Management', UserManagement)
export const AdminCreateUserPage = page('Create Staff Account', UserForm)
export const AdminEditUserPage = page('Edit User Account', () => <UserForm edit />)
export const AdminUserDetailsPage = page('User Details', UserDetails)
export const AdminRolesPage = page('Roles & Access', RolesAccess)
export const AdminMonitoringPage = page('System Monitoring', SystemMonitoring)
export const AdminAuditPage = page('Audit Logs', AuditLogs)
export const AdminBackupsPage = page('Backup Management', BackupManagement)
export const AdminNotificationsPage = page('Notifications', AdminNotifications)
export const AdminProfilePage = page('My Profile', AdminProfile)
export const AdminSettingsPage = page('Settings', () => <AdminProfile settings />)
