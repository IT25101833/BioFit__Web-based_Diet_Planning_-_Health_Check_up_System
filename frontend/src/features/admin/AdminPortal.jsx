import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, ClipboardList, DatabaseBackup, LockKeyhole, MonitorCog, ShieldCheck, Users, UserCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/ui/StatCard'
import SectionCard from '../../components/ui/SectionCard'
import StatusBadge from '../../components/ui/StatusBadge'
import Button from '../../components/ui/Button'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import PageHeader from '../../components/ui/PageHeader'
import ErrorState from '../../components/ui/ErrorState'
import {
  approveErasureRequest,
  auditLogs as fallbackAudit,
  backups,
  createErasureRequest,
  executeErasureRequest,
  fetchAdminAuditLogs,
  fetchAdminDashboard,
  fetchErasureRequests,
  notifications,
  rejectErasureRequest,
  services,
} from './data/adminData'
import Toast from '../../components/ui/Toast'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import TextArea from '../../components/ui/TextArea'

const icons = { Users, UserCheck, TriangleAlert: AlertTriangle, DatabaseBackup }
const tone = (value) => /operational|connected|available|active|successful|healthy|verified/i.test(value) ? 'text-[#15803d]' : /attention|locked|suspended|failed/i.test(value) ? 'text-[#b45309]' : 'text-[#6b7280]'
const TinyChart = ({ label, values = [35, 52, 42, 68, 58, 76, 66, 85] }) => <div><div className="mb-3 flex items-center justify-between text-sm"><span className="font-semibold text-[#374151]">{label}</span><span className="text-xs text-[#6b7280]">Last 24 hours</span></div><div className="flex h-28 items-end gap-2 border-b border-[#e8ecf1] pb-1">{values.map((v, i) => <span key={i} className="flex-1 rounded-t bg-[#bfe9dc]" style={{ height: `${v}%` }} />)}</div></div>

function Table({ children, heads }) { return <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-[#e8ecf1] text-[11px] font-semibold tracking-wide text-[#8b93a1] uppercase"><tr>{heads.map((h) => <th key={h} className="px-3 py-3 first:pl-0 last:pr-0">{h}</th>)}</tr></thead><tbody className="divide-y divide-[#eef2f0]">{children}</tbody></table></div> }

const ROLE_LABELS = {
  CLIENT: 'Clients',
  WELLNESS_CENTRE_MANAGER: 'Wellness Centre Managers',
  FITNESS_COACH: 'Fitness Coaches',
  NUTRITION_CONSULTANT: 'Nutrition Consultants',
  MEDICAL_ADVISOR: 'Medical Advisors',
  CUSTOMER_EXPERIENCE_OFFICER: 'Support Officers',
  DIGITAL_OPERATIONS_EXECUTIVE: 'Digital Operations',
  ADMIN: 'Administrators',
}

export function AdminDashboard() {
  const [adminStats, setAdminStats] = useState([])
  const [users, setUsers] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [servicesLive, setServicesLive] = useState(services)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  function load() {
    setError('')
    setLoading(true)
    fetchAdminDashboard()
      .then((data) => {
        if (!data) return
        if (Array.isArray(data.stats)) setAdminStats(data.stats)
        if (Array.isArray(data.users)) setUsers(data.users)
        if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs)
        if (data.metrics) setMetrics(data.metrics)
        if (Array.isArray(data.services)) setServicesLive(data.services)
      })
      .catch(() => setError('We couldn’t load the admin dashboard.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const statsList = Array.isArray(adminStats) ? adminStats : []
  const userList = Array.isArray(users) ? users : []
  const activityList = (Array.isArray(auditLogs) ? auditLogs : []).slice(0, 5)
  const roleRows = Array.isArray(metrics?.usersByRole) ? metrics.usersByRole : []
  const roleMax = Math.max(1, ...roleRows.map((row) => Number(row.count) || 0))

  if (loading) {
    return <p className="text-sm text-[#6b7280]">Loading dashboard…</p>
  }

  if (error) {
    return (
      <div className="w-full">
        <ErrorState title={error} onRetry={load} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[12px] font-semibold tracking-wide text-[#005a40] uppercase">
          Operations overview
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-[#111827]">Good morning</h1>
        <p className="mt-1.5 text-sm text-[#6b7280]">
          Here’s an overview of BioFit users, access activity and system operations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsList.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            hint={item.hint}
            icon={icons[item.icon] || Users}
          />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['New Users This Month', String(metrics?.newUsersThisMonth ?? 0)],
          ['Inactive Accounts', String(metrics?.inactiveAccounts ?? 0)],
          ['Locked Accounts', String(metrics?.lockedAccounts ?? 0)],
          ['Failed Login Attempts', String(metrics?.failedLoginAttempts ?? 0)],
          ['Open Tickets', String(metrics?.openTickets ?? 0)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-[#e8ecf1] bg-white p-4">
            <p className="text-xs text-[#6b7280]">{label}</p>
            <p className="mt-1 font-display text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <SectionCard title="Users by Role" icon={Users} description="Current active users across BioFit">
          <div className="space-y-3">
            {roleRows.length === 0 ? (
              <p className="text-sm text-[#6b7280]">No accounts yet.</p>
            ) : (
              roleRows.map((row) => (
                <div key={row.role}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{ROLE_LABELS[row.role] || row.role}</span>
                    <span className="font-semibold">{row.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#eef2f0]">
                    <div
                      className="h-2 rounded-full bg-[#0d9488]"
                      style={{ width: `${Math.round((Number(row.count) / roleMax) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
        <SectionCard title="System Health" icon={MonitorCog}>
          <div className="space-y-2">
            {servicesLive.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between rounded-xl bg-[#f8faf9] px-3 py-3"
              >
                <span className="text-sm font-medium">{s.name}</span>
                <span className={'text-xs font-semibold ' + tone(s.status)}>{s.status}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Recent User Accounts"
          actions={
            <Link className="text-sm font-semibold text-[#005a40]" to="/admin/users">
              View all users
            </Link>
          }
        >
          <Table heads={['User', 'Role', 'Status', 'Action']}>
            {userList.slice(0, 4).map((u) => (
              <tr key={u.id}>
                <td className="py-3 font-semibold">
                  {u.name}
                  <span className="block text-xs font-normal text-[#6b7280]">{u.email}</span>
                </td>
                <td>{u.role}</td>
                <td>
                  <StatusBadge status={u.status} />
                </td>
                <td>
                  <Link className="text-[#005a40]" to={`/admin/users/${u.userId || u.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </Table>
        </SectionCard>
        <SectionCard title="Recent Administrative Activity" icon={ClipboardList}>
          <div className="space-y-4">
            {activityList.map((a) => (
              <div key={a.id || a.action} className="border-l-2 border-[#bfe9dc] pl-3">
                <p className="text-sm font-semibold">{a.action}</p>
                <p className="text-xs text-[#6b7280]">
                  {a.description} · {a.time}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Security & Access" icon={ShieldCheck}>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p>
              Failed attempts <strong className="block text-xl">{metrics?.failedLoginAttempts ?? 0}</strong>
            </p>
            <p>
              Locked accounts <strong className="block text-xl">{metrics?.lockedAccounts ?? 0}</strong>
            </p>
            <Link className="font-semibold text-[#005a40]" to="/admin/users">
              Review accounts
            </Link>
            <Link className="font-semibold text-[#005a40]" to="/admin/audit-logs">
              View audit logs
            </Link>
          </div>
        </SectionCard>
        <SectionCard
          title="Backup & Recovery"
          icon={DatabaseBackup}
          actions={
            <Link to="/admin/backups" className="text-sm font-semibold text-[#005a40]">
              Manage backups
            </Link>
          }
        >
          <p className="text-sm">
            Backup history is not recorded by the user-management service.
          </p>
          <p className="mt-2 text-sm text-[#6b7280]">Open Backup Management to review the operational screen.</p>
        </SectionCard>
      </div>
    </div>
  )
}

export { UserManagement, UserForm, UserDetails, RolesAccess } from './UserManagementPanels'

export function SystemMonitoring() { const [detail, setDetail] = useState(null); return <div className="space-y-6"><PageHeader title="System Monitoring" description="Monitor BioFit service availability and operational health." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{services.map((s) => <button key={s.name} onClick={() => setDetail(s)} className="rounded-2xl border border-[#e8ecf1] bg-white p-4 text-left hover:bg-[#f8faf9]"><p className="text-xs text-[#6b7280]">{s.name}</p><p className={'mt-2 font-semibold ' + tone(s.status)}>{s.status}</p><p className="mt-2 text-xs text-[#8b93a1]">Checked {s.checked}</p></button>)}</div><div className="grid gap-6 lg:grid-cols-2"><SectionCard title="Average Response Time"><TinyChart label="246 ms average" /></SectionCard><SectionCard title="Successful Requests"><TinyChart label="99.8% successful" values={[42,55,49,62,70,74,80,88]} /></SectionCard></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[['Application Status','Operational'],['Database Status','Connected'],['Active Sessions','124'],['System Availability','99.98%']].map(([a,b]) => <StatCard key={a} label={a} value={b} hint="High-level operational metric" icon={Activity} />)}</div><SectionCard title="Operational Alerts"><Table heads={['Severity','Service','Summary','Time','Action']}><tr><td><StatusBadge status="Attention Required" /></td><td>Notification Service</td><td>Delayed email delivery is being monitored.</td><td>4 min ago</td><td><button className="text-[#005a40]">View details</button></td></tr><tr><td><StatusBadge status="Monitoring" /></td><td>Authentication Service</td><td>Elevated failed sign-in attempts.</td><td>42 min ago</td><td><button className="text-[#005a40]">View details</button></td></tr></Table></SectionCard><Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.name} description="Service details">{detail && <div className="space-y-4 text-sm"><p>Status <strong className="float-right">{detail.status}</strong></p><p>Last checked <strong className="float-right">{detail.checked}</strong></p><p>Recent issues <strong className="float-right">{detail.issue}</strong></p><p className="rounded-xl bg-[#f8faf9] p-3 text-xs text-[#6b7280]">This summary intentionally excludes infrastructure secrets, credentials and raw stack traces.</p></div>}</Drawer></div> }

export function AuditLogs() {
  const [selected, setSelected] = useState(null);
  const [auditLogs, setAuditLogs] = useState(fallbackAudit);
  useEffect(() => { fetchAdminAuditLogs().then(setAuditLogs).catch(() => {}) }, []); return <div className="space-y-6"><PageHeader title="Audit Logs" description="Review read-only administrative, security and system activity." /><SectionCard className="!border-[#bfe9dc] !bg-[#f2fbf7]" title="Audit records are read-only and append-only." icon={LockKeyhole}><p className="text-sm text-[#475569]">Historical events cannot be edited, deleted, or rewritten.</p></SectionCard><div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{[['Events Today','38'],['Administrative Actions','17'],['Account Changes','9'],['Security Events','4'],['System Events','8']].map(([a,b]) => <StatCard key={a} label={a} value={b} />)}</div><SectionCard><div className="mb-4 flex flex-wrap gap-3"><input className="bf-input max-w-sm !px-3 !py-2.5" placeholder="Search event, user, action or module" /><select className="rounded-xl border border-[#e8ecf1] px-3 text-sm"><option>All categories</option><option>Administrative</option><option>Security</option></select><select className="rounded-xl border border-[#e8ecf1] px-3 text-sm"><option>Newest</option><option>Oldest</option></select></div><Table heads={['Timestamp','Event ID','Actor','Action','Module','Description','Outcome','Details']}>{auditLogs.map((a) => <tr key={a.id}><td className="py-3">{a.time}</td><td>{a.id}</td><td>{a.actor}<span className="block text-xs text-[#6b7280]">{a.role}</span></td><td>{a.action}</td><td>{a.module}</td><td>{a.description}</td><td><StatusBadge status={a.outcome} /></td><td><button onClick={() => setSelected(a)} className="font-semibold text-[#005a40]">View</button></td></tr>)}</Table></SectionCard><Drawer open={!!selected} onClose={() => setSelected(null)} title="Audit Event Details" description="Read-only event record">{selected && <div className="space-y-3 text-sm">{Object.entries(selected).map(([k,v]) => <p key={k} className="flex justify-between border-b border-[#eef2f0] py-2"><span className="capitalize text-[#6b7280]">{k}</span><span className="text-right font-medium">{v}</span></p>)}<p className="rounded-xl bg-[#f8faf9] p-3 text-xs">Sensitive values are securely masked. Passwords, tokens, credentials and secrets are never shown.</p></div>}</Drawer></div> }

export function BackupManagement() { const [running, setRunning] = useState(false); const [confirm, setConfirm] = useState(false); const [selected, setSelected] = useState(null); return <div className="space-y-6"><PageHeader title="Backup Management" description="Review scheduled backups, backup history and recovery readiness." actions={<Button onClick={() => setConfirm(true)}>{running ? 'Backup in Progress' : 'Run Backup'}</Button>} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[['Last Backup','Today, 02:00'],['Next Scheduled','Tomorrow, 02:00'],['Successful This Month','10'],['Failed Backups','0'],['Backup Service','Operational']].map(([a,b]) => <StatCard key={a} label={a} value={b} hint={a === 'Backup Service' ? 'Available and monitored' : undefined} icon={DatabaseBackup} />)}</div><SectionCard title="Backup History"><Table heads={['Backup ID','Date & Time','Type','Status','Duration','Triggered By','Action']}>{backups.map((b) => <tr key={b.id}><td className="py-3 font-medium">{b.id}</td><td>{b.date}</td><td>{b.type}</td><td><StatusBadge status={b.status} /></td><td>{b.duration}</td><td>{b.by}</td><td><button onClick={() => setSelected(b)} className="font-semibold text-[#005a40]">View</button></td></tr>)}</Table></SectionCard><Drawer open={!!selected} onClose={() => setSelected(null)} title="Backup Details" description="Historical operational evidence">{selected && <div className="space-y-3 text-sm">{Object.entries(selected).map(([k,v]) => <p key={k} className="flex justify-between border-b border-[#eef2f0] py-2"><span className="capitalize text-[#6b7280]">{k}</span><span className="font-medium">{v}</span></p>)}<p className="rounded-xl bg-[#f8faf9] p-3 text-xs">Backup credentials, encryption keys and storage access details are not displayed.</p></div>}</Drawer><ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={() => { setConfirm(false); setRunning(true); setTimeout(() => setRunning(false), 1500) }} title="Run Manual Backup?" description="This starts an authorized system backup. Existing backup history remains unchanged." confirmLabel="Start Backup" /></div> }

export function AdminNotifications() { const [items, setItems] = useState(notifications); return <div className="space-y-6"><PageHeader title="Notifications" description="Account, security, backup and system updates." actions={<Button variant="outline" onClick={() => setItems((x) => x.map((i) => ({ ...i, read: true })))}>Mark All as Read</Button>} /><div className="flex gap-2 overflow-x-auto border-b border-[#e8ecf1]">{['All','Unread','Security','Accounts','System','Backups'].map((x) => <button key={x} className="border-b-2 border-transparent px-3 py-3 text-sm font-semibold text-[#6b7280] hover:border-[#005a40] hover:text-[#005a40]">{x}</button>)}</div><SectionCard>{items.map((n, i) => <div key={n.title} className="flex items-start justify-between gap-4 border-b border-[#eef2f0] py-4 last:border-0"><span className={['mt-1.5 h-2.5 w-2.5 rounded-full', n.read ? 'bg-transparent' : 'bg-[#0d9488]'].join(' ')} /><div className="min-w-0 flex-1"><p className="font-semibold">{n.title}</p><p className="mt-1 text-sm text-[#6b7280]">{n.category} · {n.time}</p></div>{!n.read && <button onClick={() => setItems((x) => x.map((item, index) => index === i ? { ...item, read: true } : item))} className="text-sm font-semibold text-[#005a40]">Mark as read</button>}</div>)}</SectionCard></div> }

export function AdminProfile({ settings = false }) { return <div className="space-y-6"><PageHeader title={settings ? 'Settings' : 'My Profile'} description={settings ? 'Manage your display and notification preferences.' : 'Manage your Digital Operations profile.'} /><SectionCard title={settings ? 'Notification Preferences' : 'Profile Information'}>{settings ? <div className="space-y-4 text-sm">{['System alerts','Security events','Backup completion updates','Account activity'].map((x, i) => <label key={x} className="flex items-center justify-between rounded-xl bg-[#f8faf9] p-4"><span>{x}</span><input type="checkbox" defaultChecked={i < 3} className="bf-checkbox" /></label>)}</div> : <form className="grid gap-4 sm:grid-cols-2">{[['Full name','Jordan Lee'],['Email','nadeesha.perera@biofit.lk'],['Contact number','+94 77 555 0200'],['Department','Digital Operations']].map(([a,b]) => <label key={a} className="text-sm font-semibold">{a}<input defaultValue={b} className="bf-input mt-1 !px-3" /></label>)}<div className="sm:col-span-2"><Button type="button">Save Profile</Button></div></form>}</SectionCard>{settings && <SectionCard title="Display Preferences"><label className="flex items-center justify-between text-sm">Compact dashboard cards<input type="checkbox" className="bf-checkbox" /></label></SectionCard>}</div> }

export function ErasureRequests() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({
    recordType: 'MEDICAL_HISTORY',
    recordId: '',
    clientUserId: '',
    legalBasis: 'GDPR Article 17 request',
    reason: '',
  })
  const [reviewNotes, setReviewNotes] = useState('')
  const [executeTarget, setExecuteTarget] = useState(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      setItems(await fetchErasureRequests())
    } catch {
      setError('We couldn’t load erasure requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await createErasureRequest({
        recordType: form.recordType,
        recordId: form.recordId,
        clientUserId: form.clientUserId || undefined,
        legalBasis: form.legalBasis,
        reason: form.reason,
      })
      setForm((prev) => ({ ...prev, recordId: '', reason: '' }))
      setToast('Erasure request created (PENDING).')
      await load()
    } catch (err) {
      setToast(err?.message || 'Unable to create erasure request.')
    } finally {
      setBusy(false)
    }
  }

  async function handleApprove(id) {
    setBusy(true)
    try {
      await approveErasureRequest(id, { reviewNotes })
      setToast('Erasure request approved.')
      await load()
    } catch (err) {
      setToast(err?.message || 'Unable to approve request.')
    } finally {
      setBusy(false)
    }
  }

  async function handleReject(id) {
    setBusy(true)
    try {
      await rejectErasureRequest(id, { reviewNotes })
      setToast('Erasure request rejected.')
      await load()
    } catch (err) {
      setToast(err?.message || 'Unable to reject request.')
    } finally {
      setBusy(false)
    }
  }

  async function handleExecute() {
    if (!executeTarget) return
    setBusy(true)
    try {
      await executeErasureRequest(executeTarget.id)
      setExecuteTarget(null)
      setToast('Hard delete executed. Record permanently removed.')
      await load()
    } catch (err) {
      setToast(err?.message || 'Unable to execute erasure.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Erasure Requests"
        description="Formal admin right-to-erasure workflow. Soft-deleted medical records only. Hard delete is permanent."
      />

      <SectionCard
        className="!border-[#fecaca] !bg-[#fef2f2]"
        title="Legal safeguard"
        icon={LockKeyhole}
      >
        <p className="text-sm text-[#7f1d1d]">
          Medical advisors can only soft-delete (mark inactive). Permanent erasure requires an approved
          admin request and cannot be undone.
        </p>
      </SectionCard>

      <SectionCard title="Create erasure request">
        <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Record type"
            required
            value={form.recordType}
            onChange={(e) => setForm((p) => ({ ...p, recordType: e.target.value }))}
            options={[
              { value: 'MEDICAL_HISTORY', label: 'Medical History' },
              { value: 'HEALTH_RECORD', label: 'Health Record' },
              { value: 'HEALTH_ALERT', label: 'Health Alert' },
            ]}
          />
          <Input
            label="Record ID"
            required
            value={form.recordId}
            onChange={(e) => setForm((p) => ({ ...p, recordId: e.target.value }))}
            placeholder="Numeric DB id (e.g. 12)"
          />
          <Input
            label="Client user ID (optional)"
            value={form.clientUserId}
            onChange={(e) => setForm((p) => ({ ...p, clientUserId: e.target.value }))}
            placeholder="Resolved from the inactive record"
          />
          <Input
            label="Legal basis"
            required
            value={form.legalBasis}
            onChange={(e) => setForm((p) => ({ ...p, legalBasis: e.target.value }))}
          />
          <TextArea
            className="sm:col-span-2"
            label="Reason"
            required
            value={form.reason}
            onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
            placeholder="Document the formal erasure justification"
          />
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy} className="!bg-[#005a40] !text-white">
              {busy ? 'Submitting…' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Review notes (approve / reject)">
        <TextArea
          label="Review notes"
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.target.value)}
          placeholder="Optional notes for approve/reject actions"
        />
      </SectionCard>

      <SectionCard title="Requests">
        {loading ? (
          <p className="text-sm text-[#6b7280]">Loading…</p>
        ) : error ? (
          <ErrorState title={error} onRetry={load} />
        ) : items.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No erasure requests yet.</p>
        ) : (
          <Table
            heads={[
              'ID',
              'Type',
              'Record',
              'Client',
              'Status',
              'Requested',
              'Actions',
            ]}
          >
            {items.map((item) => (
              <tr key={item.id}>
                <td className="py-3 font-medium">{item.id}</td>
                <td>{item.recordType}</td>
                <td>{item.recordId}</td>
                <td>{item.clientUserId}</td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td className="text-xs text-[#6b7280]">
                  {item.requestedAt ? String(item.requestedAt).slice(0, 19).replace('T', ' ') : '—'}
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    {item.status === 'PENDING' ? (
                      <>
                        <Button
                          size="sm"
                          disabled={busy}
                          onClick={() => handleApprove(item.id)}
                          className="!bg-[#005a40] !text-white"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() => handleReject(item.id)}
                        >
                          Reject
                        </Button>
                      </>
                    ) : null}
                    {item.status === 'APPROVED' ? (
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() => setExecuteTarget(item)}
                        className="!bg-[#b45309] !text-white hover:!bg-[#92400e]"
                      >
                        Execute
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </SectionCard>

      <ConfirmDialog
        open={Boolean(executeTarget)}
        onClose={() => !busy && setExecuteTarget(null)}
        onConfirm={handleExecute}
        title="Permanently erase this record?"
        description="This hard delete is permanent and cannot be undone. The inactive medical record will be removed from the database."
        confirmLabel="Execute Permanent Erasure"
        tone="danger"
      />

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
