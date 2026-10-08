import { useEffect, useState } from 'react'
import { Plus, Search, ShieldCheck } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Drawer from '../../components/ui/Drawer'
import ErrorState from '../../components/ui/ErrorState'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'
import SectionCard from '../../components/ui/SectionCard'
import Select from '../../components/ui/Select'
import StatusBadge from '../../components/ui/StatusBadge'
import Toast from '../../components/ui/Toast'
import {
  createAdminUser,
  fetchAdminDashboard,
  fetchAdminUser,
  fetchAdminUsers,
  issueAdminPasswordReset,
  roles,
  setAdminUserStatus,
  updateAdminUser,
} from './data/adminData'

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'LOCKED', label: 'Locked' },
  { value: 'PENDING', label: 'Pending' },
]

const ROLE_OPTIONS = roles.map((role) => ({ value: role, label: role }))

function formatWhen(value) {
  if (!value) return 'Never'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}

function Table({ children, heads }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="border-b border-[#e8ecf1] text-[11px] font-semibold tracking-wide text-[#8b93a1] uppercase">
          <tr>
            {heads.map((head) => (
              <th key={head} className="px-3 py-3 first:pl-0 last:pr-0">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eef2f0]">{children}</tbody>
      </table>
    </div>
  )
}

export function UserManagement() {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('All Users')
  const [role, setRole] = useState('')
  const [sort, setSort] = useState('created')
  const [selected, setSelected] = useState(null)
  const [action, setAction] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const query = {
    q: search.trim() || undefined,
    role: role || undefined,
    sort,
  }
  if (tab === 'Clients') query.type = 'client'
  if (tab === 'Staff') query.type = 'staff'
  if (tab === 'Inactive') query.status = 'INACTIVE'
  if (tab === 'Locked') query.status = 'LOCKED'

  function load() {
    setLoading(true)
    setError('')
    fetchAdminUsers(query)
      .then((list) => setUsers(Array.isArray(list) ? list : []))
      .catch(() => setError('We couldn’t load user accounts.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, tab, role, sort])

  async function confirmDeactivate() {
    if (!selected?.userId) return
    setBusy(true)
    try {
      await setAdminUserStatus(selected.userId, 'deactivate')
      setToast('Account deactivated. The user can no longer sign in.')
      setAction(null)
      setSelected(null)
      load()
    } catch (err) {
      setToast(err?.message || 'Unable to deactivate this account.')
      setAction(null)
    } finally {
      setBusy(false)
    }
  }

  const inactiveCount = users.filter((user) => user.status === 'INACTIVE').length
  const lockedCount = users.filter((user) => user.status === 'LOCKED').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage BioFit client and staff accounts, roles and access status."
        actions={
          <Button onClick={() => navigate('/admin/users/create')}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create Staff Account
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          ['Matching Users', String(users.length)],
          ['Clients', String(users.filter((user) => user.type === 'Client').length)],
          ['Staff Accounts', String(users.filter((user) => user.type === 'Staff').length)],
          ['Inactive', String(inactiveCount)],
          ['Locked Accounts', String(lockedCount)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-[#e8ecf1] bg-white p-4">
            <p className="text-xs text-[#6b7280]">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto border-b border-[#e8ecf1]">
        {['All Users', 'Clients', 'Staff', 'Inactive', 'Locked'].map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={[
              'shrink-0 border-b-2 px-3 py-3 text-sm font-semibold',
              tab === item ? 'border-[#005a40] text-[#005a40]' : 'border-transparent text-[#6b7280]',
            ].join(' ')}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-[#e8ecf1] bg-white p-4">
        <div className="mb-4 flex flex-wrap gap-3">
          <label className="relative min-w-[260px] flex-1">
            <Search className="absolute top-3 left-3 h-4 w-4 text-[#8b93a1]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="bf-input !py-2.5 !pl-9"
              placeholder="Search name, user ID, email or role"
            />
          </label>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="rounded-xl border border-[#e8ecf1] px-3 text-sm"
          >
            <option value="">All roles</option>
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-xl border border-[#e8ecf1] px-3 text-sm"
          >
            <option value="created">Recently created</option>
            <option value="name">Name A–Z</option>
            <option value="lastLogin">Recently active</option>
          </select>
        </div>
        {loading ? <p className="text-sm text-[#6b7280]">Loading accounts…</p> : null}
        {error ? <ErrorState title={error} onRetry={load} /> : null}
        {!loading && !error && users.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No accounts match these filters.</p>
        ) : null}
        {!loading && !error && users.length > 0 ? (
          <Table
            heads={[
              'User',
              'User ID',
              'Role',
              'Email',
              'Account Status',
              'Created',
              'Last Login',
              'Actions',
            ]}
          >
            {users.map((user) => (
              <tr key={user.userId || user.id} className="hover:bg-[#f8faf9]">
                <td className="py-3 font-semibold">
                  <button className="text-left" onClick={() => setSelected(user)}>
                    {user.name}
                  </button>
                </td>
                <td>{user.id}</td>
                <td>{user.role}</td>
                <td>{user.email}</td>
                <td>
                  <StatusBadge status={user.status} />
                </td>
                <td>{formatWhen(user.created)}</td>
                <td>{formatWhen(user.lastLogin)}</td>
                <td>
                  <button
                    onClick={() => navigate(`/admin/users/${user.userId}`)}
                    className="font-semibold text-[#005a40]"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        ) : null}
      </div>
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title="User account preview"
        description="Administrative information only"
        footer={
          <Button onClick={() => navigate(`/admin/users/${selected?.userId}`)}>Open User Details</Button>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div>
              <p className="text-xl font-bold">{selected.name}</p>
              <p className="text-sm text-[#6b7280]">
                {selected.id} · {selected.role}
              </p>
            </div>
            {[
              ['Email', selected.email],
              ['Account Status', selected.status],
              ['Created', formatWhen(selected.created)],
              ['Last Login', formatWhen(selected.lastLogin)],
              ['Verification', selected.verification],
              ['Wellness Centre', selected.wellnessCentreName || '—'],
            ].map(([label, value]) => (
              <p key={label} className="flex justify-between border-b border-[#eef2f0] py-2 text-sm">
                <span className="text-[#6b7280]">{label}</span>
                <span className="font-medium">{value}</span>
              </p>
            ))}
            <Button variant="outline" onClick={() => setAction('Deactivate')}>
              Deactivate account
            </Button>
          </div>
        ) : null}
      </Drawer>
      <ConfirmDialog
        open={!!action}
        onClose={() => setAction(null)}
        onConfirm={confirmDeactivate}
        confirming={busy}
        title="Deactivate User Account?"
        description="The user will no longer be able to sign in, but historical BioFit records will remain preserved. Cancel leaves the account unchanged."
        confirmLabel="Deactivate Account"
        tone="danger"
      />
      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  contactNumber: '',
  specialization: '',
  role: 'FITNESS_COACH',
  password: '',
  status: 'ACTIVE',
  wellnessCentreName: '',
}

export function UserForm({ edit = false }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(emptyForm)
  const [created, setCreated] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(edit)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!edit || !id) return
    setLoading(true)
    fetchAdminUser(id)
      .then((user) => {
        setForm({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          contactNumber: user.contactNumber || '',
          specialization: user.specialization || '',
          role: user.role || 'FITNESS_COACH',
          password: '',
          status: user.status || 'ACTIVE',
          wellnessCentreName: user.wellnessCentreName || '',
        })
      })
      .catch(() => setError('We couldn’t load this account.'))
      .finally(() => setLoading(false))
  }, [edit, id])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      contactNumber: form.contactNumber,
      specialization: form.specialization,
      role: form.role,
      status: form.status,
    }
    if (form.wellnessCentreName.trim()) payload.wellnessCentreName = form.wellnessCentreName.trim()
    try {
      if (edit) {
        await updateAdminUser(id, payload)
        navigate(`/admin/users/${id}`)
        return
      }
      payload.email = form.email
      payload.password = form.password
      const user = await createAdminUser(payload)
      setCreated(user)
    } catch (err) {
      setError(err?.message || 'Unable to save this account.')
    } finally {
      setBusy(false)
    }
  }

  if (created) {
    return (
      <div className="space-y-6">
        <PageHeader title="Staff Account Created" description="The account is stored and can sign in with the password you set." />
        <SectionCard>
          <p className="text-sm">
            User ID <strong className="ml-2">{created.id}</strong>
          </p>
          <p className="mt-2 text-sm">
            Role <strong className="ml-2">{created.role}</strong>
          </p>
          <p className="mt-2 text-sm">
            Email <strong className="ml-2">{created.email}</strong>
          </p>
          <p className="mt-2 text-sm">
            Status <StatusBadge className="ml-2" status={created.status} />
          </p>
          <div className="mt-6 flex gap-3">
            <Button onClick={() => navigate('/admin/users')}>Back to User Management</Button>
            <Button variant="outline" onClick={() => navigate(`/admin/users/${created.userId}`)}>
              Open User Details
            </Button>
          </div>
        </SectionCard>
      </div>
    )
  }

  if (loading) return <p className="text-sm text-[#6b7280]">Loading account…</p>
  if (error && edit && !form.email) return <ErrorState title={error} onRetry={() => window.location.reload()} />

  return (
    <div className="space-y-6">
      <PageHeader
        title={edit ? 'Edit User Account' : 'Create Staff Account'}
        description={
          edit
            ? 'Update permitted account information and access.'
            : 'Create an authorized BioFit account. The password is stored securely and is not shown again.'
        }
      />
      <form onSubmit={submit} className="space-y-5">
        <SectionCard title="Basic Information">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="First name" required value={form.firstName} onChange={(event) => update('firstName', event.target.value)} />
            <Input label="Last name" required value={form.lastName} onChange={(event) => update('lastName', event.target.value)} />
            <Input
              label="Email"
              type="email"
              required
              disabled={edit}
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
            />
            <Input
              label="Contact number"
              value={form.contactNumber}
              onChange={(event) => update('contactNumber', event.target.value)}
            />
            <Select
              label="Role"
              required
              value={form.role}
              onChange={(event) => update('role', event.target.value)}
              options={ROLE_OPTIONS}
            />
            <Input
              label="Specialization"
              value={form.specialization}
              onChange={(event) => update('specialization', event.target.value)}
            />
            <Input
              label="Wellness centre name"
              value={form.wellnessCentreName}
              onChange={(event) => update('wellnessCentreName', event.target.value)}
              hint="Required for centre managers and centre staff. Leave blank for platform-only accounts."
            />
          </div>
          {edit ? <p className="mt-4 text-xs text-[#6b7280]">User ID: USR-{id} (read-only)</p> : null}
        </SectionCard>
        <SectionCard title="Account Details">
          {!edit ? (
            <Input
              label="Temporary password"
              type="password"
              required
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              hint="At least 8 characters. Share it through a secure channel."
            />
          ) : (
            <p className="text-sm text-[#6b7280]">Password changes use the password reset action on User Details.</p>
          )}
          <div className="mt-4">
            <Select
              label="Account status"
              value={form.status}
              onChange={(event) => update('status', event.target.value)}
              options={STATUS_OPTIONS}
            />
          </div>
        </SectionCard>
        {error ? <p className="text-sm text-[#b45309]">{error}</p> : null}
        <SectionCard title={edit ? 'Review & Save' : 'Review & Create'}>
          <p className="text-sm text-[#6b7280]">Role determines which BioFit modules this user can access. Inactive and locked accounts cannot sign in.</p>
          <div className="mt-5 flex gap-3">
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : edit ? 'Save Account Changes' : 'Create Staff Account'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/users')}>
              Cancel
            </Button>
          </div>
        </SectionCard>
      </form>
    </div>
  )
}

export function UserDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialog, setDialog] = useState('')
  const [nextRole, setNextRole] = useState('')
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState(false)

  function load() {
    setLoading(true)
    setError('')
    fetchAdminUser(id)
      .then((row) => {
        setUser(row)
        setNextRole(row.role)
      })
      .catch(() => setError('We couldn’t load this account.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function confirm() {
    if (!user) return
    setBusy(true)
    try {
      if (dialog === 'Role') {
        await updateAdminUser(user.userId, { role: nextRole })
        setToast('Role updated.')
      } else if (dialog === 'Reset') {
        const result = await issueAdminPasswordReset(user.userId)
        setToast(result?.message || 'Password reset issued. Account status was not changed.')
      } else if (dialog === 'Deactivate') {
        await setAdminUserStatus(user.userId, 'deactivate')
        setToast('Account deactivated.')
      } else if (dialog === 'Activate') {
        await setAdminUserStatus(user.userId, 'activate')
        setToast('Account reinstated.')
      } else if (dialog === 'Lock') {
        await setAdminUserStatus(user.userId, 'lock')
        setToast('Account locked.')
      } else if (dialog === 'Unlock') {
        await setAdminUserStatus(user.userId, 'unlock')
        setToast('Account unlocked.')
      }
      setDialog('')
      load()
    } catch (err) {
      setToast(err?.message || 'The action was not completed.')
      setDialog('')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p className="text-sm text-[#6b7280]">Loading account…</p>
  if (error || !user) return <ErrorState title={error || 'User not found.'} onRetry={load} />

  const inactive = user.status === 'INACTIVE'
  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name}
        description={`${user.id} · ${user.role} · ${user.verification}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/admin/users/${user.userId}/edit`)}>
              Edit Account
            </Button>
            <Button onClick={() => setDialog(inactive ? 'Activate' : 'Deactivate')}>
              {inactive ? 'Reinstate' : 'Deactivate'}
            </Button>
          </div>
        }
      />
      <SectionCard>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Account Status', user.status],
            ['Verification', user.verification],
            ['Created', formatWhen(user.created)],
            ['Last Login', formatWhen(user.lastLogin)],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-[#6b7280]">{label}</p>
              <p className="mt-1 font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </SectionCard>
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Personal Information">
          <div className="space-y-3 text-sm">
            <p>
              Email <strong className="float-right">{user.email}</strong>
            </p>
            <p>
              Contact <strong className="float-right">{user.contactNumber || '—'}</strong>
            </p>
            <p>
              Account Type <strong className="float-right">{user.type}</strong>
            </p>
            <p>
              Wellness Centre <strong className="float-right">{user.wellnessCentreName || '—'}</strong>
            </p>
            <p>
              Specialization <strong className="float-right">{user.specialization || '—'}</strong>
            </p>
          </div>
        </SectionCard>
        <SectionCard title="Account & Access">
          <div className="space-y-3 text-sm">
            <p>
              Login Identifier <strong className="float-right">{user.email}</strong>
            </p>
            <p>
              Role <strong className="float-right">{user.role}</strong>
            </p>
            <p>
              Lock Status <strong className="float-right">{user.status === 'LOCKED' ? 'Locked' : 'Not locked'}</strong>
            </p>
            <div className="flex flex-wrap gap-2 pt-3">
              <Button variant="outline" onClick={() => setDialog('Role')}>
                Change Role
              </Button>
              <Button variant="outline" onClick={() => setDialog('Reset')}>
                Issue Password Reset
              </Button>
              {user.status === 'LOCKED' ? (
                <Button variant="outline" onClick={() => setDialog('Unlock')}>
                  Unlock Account
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setDialog('Lock')}>
                  Lock Account
                </Button>
              )}
            </div>
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Administrative History">
        <p className="text-sm text-[#6b7280]">
          Account and access changes are written to the audit log when they succeed. Clinical and programme records are not shown in this portal.
        </p>
      </SectionCard>
      <ConfirmDialog
        open={!!dialog}
        onClose={() => setDialog('')}
        onConfirm={confirm}
        confirming={busy}
        title={
          dialog === 'Reset'
            ? 'Issue Password Reset?'
            : dialog === 'Role'
              ? 'Change User Role?'
              : `${dialog} User Account?`
        }
        description={
          dialog === 'Reset'
            ? 'This issues a reset token and does not change an inactive, pending, or locked status. Email is sent only when mail delivery is configured.'
            : dialog === 'Role'
              ? 'The new role is checked on the server. You cannot assign a role you are not allowed to grant, and the last active administrator cannot be removed.'
              : 'This authorized action preserves historical BioFit records and is recorded in the audit history. Cancel does not change the account.'
        }
        confirmLabel={dialog === 'Reset' ? 'Issue Reset' : 'Confirm'}
        tone={dialog === 'Deactivate' || dialog === 'Lock' ? 'danger' : 'default'}
      >
        {dialog === 'Role' ? (
          <Select label="New role" value={nextRole} onChange={(event) => setNextRole(event.target.value)} options={ROLE_OPTIONS} />
        ) : null}
      </ConfirmDialog>
      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}

export function RolesAccess() {
  const [counts, setCounts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAdminDashboard()
      .then((data) => setCounts(Array.isArray(data?.metrics?.usersByRole) ? data.metrics.usersByRole : []))
      .catch(() => setError('We couldn’t load role counts.'))
  }, [])

  const countFor = (role) => counts.find((row) => row.role === role)?.count ?? 0

  return (
    <div className="space-y-6">
      <PageHeader title="Roles & Access" description="Review BioFit roles and the number of accounts currently assigned to each role." />
      {error ? <ErrorState title={error} /> : null}
      <SectionCard className="!border-[#bfe9dc] !bg-[#f2fbf7]" title="Administrative Access Does Not Mean Unlimited Clinical Access" icon={ShieldCheck}>
        <p className="text-sm text-[#475569]">
          Digital Operations users manage accounts and system operations. They cannot create or modify administrator accounts. Sensitive clinical information remains protected by role-based access controls.
        </p>
      </SectionCard>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => (
          <SectionCard key={role} title={role}>
            <p className="text-sm text-[#6b7280]">{countFor(role)} accounts</p>
          </SectionCard>
        ))}
      </div>
    </div>
  )
}
