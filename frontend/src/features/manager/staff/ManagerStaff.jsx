import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import ErrorState from '../../../components/ui/ErrorState'
import Input from '../../../components/ui/Input'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import Select from '../../../components/ui/Select'
import StatusBadge from '../../../components/ui/StatusBadge'
import Toast from '../../../components/ui/Toast'
import { createCentreStaff, fetchCentreStaff, updateCentreStaff } from './staffApi'

const STAFF_ROLES = [
  { value: 'MEDICAL_ADVISOR', label: 'Medical Advisor' },
  { value: 'NUTRITION_CONSULTANT', label: 'Nutrition Consultant' },
  { value: 'FITNESS_COACH', label: 'Fitness Coach' },
]

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  contactNumber: '',
  specialization: '',
  role: 'MEDICAL_ADVISOR',
  password: '',
  status: 'ACTIVE',
}

function formatWhen(value) {
  if (!value) return 'Never'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}

export default function ManagerStaff() {
  const [staff, setStaff] = useState([])
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [confirm, setConfirm] = useState(null)

  function load() {
    setLoading(true)
    setError('')
    fetchCentreStaff({
      q: search.trim() || undefined,
      role: role || undefined,
      status: status || undefined,
      sort: 'name',
    })
      .then((list) => setStaff(Array.isArray(list) ? list : []))
      .catch((err) => setError(err?.message || 'We couldn’t load centre staff.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role, status])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  function openEdit(member) {
    setEditing(member)
    setForm({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.email || '',
      contactNumber: member.contactNumber || '',
      specialization: member.specialization || '',
      role: member.role,
      password: '',
      status: member.status || 'ACTIVE',
    })
    setFormOpen(true)
  }

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    try {
      if (editing) {
        await updateCentreStaff(editing.userId, {
          firstName: form.firstName,
          lastName: form.lastName,
          contactNumber: form.contactNumber,
          specialization: form.specialization,
          role: form.role,
          status: form.status,
        })
        setToast('Staff account updated.')
      } else {
        const created = await createCentreStaff({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          contactNumber: form.contactNumber,
          specialization: form.specialization,
          role: form.role,
          password: form.password,
          status: form.status,
        })
        setToast(`${created.name} was added to your wellness centre.`)
      }
      setFormOpen(false)
      load()
    } catch (err) {
      setToast(err?.message || 'Unable to save this staff account.')
    } finally {
      setBusy(false)
    }
  }

  async function changeStatus() {
    if (!confirm) return
    setBusy(true)
    try {
      await updateCentreStaff(confirm.userId, {
        status: confirm.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      })
      setToast(confirm.status === 'ACTIVE' ? 'Staff member deactivated.' : 'Staff member reinstated.')
      setConfirm(null)
      load()
    } catch (err) {
      setToast(err?.message || 'Unable to change staff status.')
      setConfirm(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centre Staff"
        description="Add and manage Medical Advisors, Nutrition Consultants and Fitness Coaches for your wellness centre."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Staff
          </Button>
        }
      />
      <SectionCard>
        <div className="mb-4 flex flex-wrap gap-3">
          <label className="relative min-w-[240px] flex-1">
            <Search className="absolute top-3 left-3 h-4 w-4 text-[#8b93a1]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="bf-input !py-2.5 !pl-9"
              placeholder="Search name, email or role"
            />
          </label>
          <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-xl border border-[#e8ecf1] px-3 text-sm">
            <option value="">All roles</option>
            {STAFF_ROLES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-[#e8ecf1] px-3 text-sm">
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="LOCKED">Locked</option>
          </select>
        </div>
        {loading ? <p className="text-sm text-[#6b7280]">Loading staff…</p> : null}
        {error ? <ErrorState title={error} onRetry={load} /> : null}
        {!loading && !error && staff.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No staff match these filters.</p>
        ) : null}
        {!loading && !error && staff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[#e8ecf1] text-[11px] font-semibold tracking-wide text-[#8b93a1] uppercase">
                <tr>
                  {['Name', 'Role', 'Email', 'Status', 'Last Login', 'Centre', 'Actions'].map((head) => (
                    <th key={head} className="px-3 py-3">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f0]">
                {staff.map((member) => (
                  <tr key={member.userId}>
                    <td className="py-3 font-semibold">{member.name}</td>
                    <td>{member.role}</td>
                    <td>{member.email}</td>
                    <td>
                      <StatusBadge status={member.status} />
                    </td>
                    <td>{formatWhen(member.lastLogin)}</td>
                    <td>{member.wellnessCentreName || '—'}</td>
                    <td className="space-x-3">
                      <button className="font-semibold text-[#005a40]" onClick={() => openEdit(member)}>
                        Edit
                      </button>
                      <button className="font-semibold text-[#005a40]" onClick={() => setConfirm(member)}>
                        {member.status === 'ACTIVE' ? 'Deactivate' : 'Reinstate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </SectionCard>

      {formOpen ? (
        <SectionCard title={editing ? 'Edit staff member' : 'Add staff member'}>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <Input label="First name" required value={form.firstName} onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))} />
            <Input label="Last name" required value={form.lastName} onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))} />
            <Input label="Email" type="email" required disabled={Boolean(editing)} value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
            <Input label="Contact number" value={form.contactNumber} onChange={(event) => setForm((prev) => ({ ...prev, contactNumber: event.target.value }))} />
            <Select label="Role" required value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))} options={STAFF_ROLES} />
            <Input label="Specialization" value={form.specialization} onChange={(event) => setForm((prev) => ({ ...prev, specialization: event.target.value }))} />
            {!editing ? (
              <Input
                label="Temporary password"
                type="password"
                required
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                hint="At least 8 characters. The account is assigned to your centre automatically."
              />
            ) : null}
            <Select
              label="Status"
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
                { value: 'LOCKED', label: 'Locked' },
              ]}
            />
            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving…' : editing ? 'Save changes' : 'Create staff account'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </SectionCard>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={changeStatus}
        confirming={busy}
        title={confirm?.status === 'ACTIVE' ? 'Deactivate staff member?' : 'Reinstate staff member?'}
        description="Inactive staff cannot sign in. Cancel leaves the account unchanged. This only affects staff in your wellness centre."
        confirmLabel={confirm?.status === 'ACTIVE' ? 'Deactivate' : 'Reinstate'}
        tone={confirm?.status === 'ACTIVE' ? 'danger' : 'default'}
      />
      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
