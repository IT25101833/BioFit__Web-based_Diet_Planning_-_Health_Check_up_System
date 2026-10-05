import AdminLayout from '../../components/layout/AdminLayout'
import AdminAppointments from '../../features/admin/AdminAppointments'
import ClientWalletDetail from '../../features/admin/wallet/ClientWalletDetail'
import ClientWallets from '../../features/admin/wallet/ClientWallets'
import TopUpRequestDetail from '../../features/admin/wallet/TopUpRequestDetail'
import WalletManagement from '../../features/admin/wallet/WalletManagement'
import WalletTransactions from '../../features/admin/wallet/WalletTransactions'
import { AdminDashboard, AdminNotifications, AdminProfile, AuditLogs, BackupManagement, ErasureRequests, RolesAccess, SystemMonitoring, UserDetails, UserForm, UserManagement } from '../../features/admin/AdminPortal'

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
export const AdminErasurePage = page('Erasure Requests', ErasureRequests)
export const AdminAppointmentsPage = page('Appointments', AdminAppointments)
export const AdminWalletPage = page('Wallet Management', WalletManagement)
export const AdminClientWalletsPage = page('Client Wallets', ClientWallets)
export const AdminClientWalletPage = page('Client Wallet', ClientWalletDetail)
export const AdminWalletTransactionsPage = page('Wallet Transactions', WalletTransactions)
export const AdminTopUpRequestPage = page('Cash Top-Up Request', TopUpRequestDetail)
export const AdminNotificationsPage = page('Notifications', AdminNotifications)
export const AdminProfilePage = page('My Profile', AdminProfile)
export const AdminSettingsPage = page('Settings', () => <AdminProfile settings />)
