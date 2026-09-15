import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import ActionMenu from '../../../components/ui/ActionMenu'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import Input from '../../../components/ui/Input'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import Modal from '../../../components/ui/Modal'
import PageHeader from '../../../components/ui/PageHeader'
import SearchBar from '../../../components/ui/SearchBar'
import Select from '../../../components/ui/Select'
import StatCard from '../../../components/ui/StatCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import TextArea from '../../../components/ui/TextArea'
import Toast from '../../../components/ui/Toast'
import { formatNutritionDate, getNutritionClientOptions } from '../clients/data/nutritionClientData'
import {
  createDietaryRestriction,
  deactivateDietaryRestriction,
  fetchDietaryRestrictions,
  updateDietaryRestriction,
} from './data/dietaryRestrictionData'

const emptyForm = {
  clientId: '',
  name: '',
  type: '',
  status: 'Active',
  dateRecorded: '2026-09-09',
  notes: '',
  mealPlanImpact: '',
  mealPlan: '',
}

export default function DietaryRestrictions() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deactivateId, setDeactivateId] = useState('')
  const [toast, setToast] = useState('')
  const clients = useMemo(() => getNutritionClientOptions(), [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      setItems(await fetchDietaryRestrictions())
    } catch {
      setError('We couldn’t load dietary restrictions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((item) => {
      if (
        q &&
        !item.clientName.toLowerCase().includes(q) &&
        !item.name.toLowerCase().includes(q)
      )
        return false
      if (type && item.type !== type) return false
      if (status && item.status !== status) return false
      return true
    })
  }, [items, search, type, status])

  const summary = useMemo(
    () => ({
      active: items.filter((i) => i.status === 'Active').length,
      allergies: items.filter((i) => i.type === 'Medical Allergy').length,
      preferences: items.filter((i) => i.type === 'Preference').length,
      reviews: items.filter((i) => i.status === 'Under Review').length,
    }),
    [items],
  )

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  function openEdit(item) {
    setEditing(item)
    setForm({
      clientId: item.clientId,
      name: item.name,
      type: item.type,
      status: item.status,
      dateRecorded: item.dateRecorded,
      notes: item.notes,
      mealPlanImpact: item.mealPlanImpact,
      mealPlan: item.mealPlan,
    })
    setFormOpen(true)
  }

  async function handleSave() {
    const client = clients.find((c) => c.value === form.clientId)?.client
    const payload = {
      ...form,
      clientName: client?.name || editing?.clientName,
      lastReviewed: form.dateRecorded,
    }
    if (editing) await updateDietaryRestriction(editing.id, payload)
    else await createDietaryRestriction(payload)
    setFormOpen(false)
    setToast(editing ? 'Restriction updated.' : 'Restriction saved.')
    await load()
  }

  if (loading) return <LoadingSkeleton rows={4} />
  if (error) {
    return <ErrorState title="We couldn’t load dietary restrictions." onRetry={load} />
  }

  return (
    <div>
      <PageHeader
        title="Dietary Restrictions"
        description="Review and manage dietary restrictions, allergies and preferences relevant to client meal planning."
        actions={
          <Button onClick={openCreate} className="!bg-[#005a40] !text-white hover:!bg-[#004833]">
            <Plus className="h-4 w-4" />
            Add Restriction
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Restrictions" value={summary.active} />
        <StatCard label="Medical Allergies" value={summary.allergies} />
        <StatCard label="Preferences" value={summary.preferences} />
        <StatCard label="Reviews Due" value={summary.reviews} />
      </div>

      <div className="mb-4 grid gap-3 rounded-[1.25rem] border border-[#e8ecf1] bg-white p-4 sm:grid-cols-3">
        <SearchBar className="sm:col-span-1" value={search} onChange={setSearch} placeholder="Search client or restriction…" />
        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { value: 'Medical Allergy', label: 'Medical Allergy' },
            { value: 'Dietary Restriction', label: 'Dietary Restriction' },
            { value: 'Food Intolerance', label: 'Food Intolerance' },
            { value: 'Preference', label: 'Preference' },
          ]}
          placeholder="Type"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'Active', label: 'Active' },
            { value: 'Under Review', label: 'Under Review' },
            { value: 'Inactive', label: 'Inactive' },
          ]}
          placeholder="Status"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No dietary restrictions found." />
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] border border-[#e8ecf1] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-[#f8faf9] text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Restriction</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date Recorded</th>
                  <th className="px-4 py-3">Last Reviewed</th>
                  <th className="px-4 py-3">Current Meal Plan</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t border-[#eef2f0]">
                    <td className="px-4 py-3.5 font-semibold text-[#111827]">{item.clientName}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">
                      {item.name}
                      {item.protected ? (
                        <span className="mt-1 block text-[11px] font-semibold text-[#b45309]">
                          Medical Record Source
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={item.type} /></td>
                    <td className="px-4 py-3.5"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{formatNutritionDate(item.dateRecorded)}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{formatNutritionDate(item.lastReviewed)}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{item.mealPlan}</td>
                    <td className="px-4 py-3.5">
                      <ActionMenu
                        items={[
                          { label: 'Edit / Review', onClick: () => openEdit(item) },
                          {
                            label: 'Deactivate',
                            tone: 'danger',
                            disabled: item.status === 'Inactive',
                            onClick: () => setDeactivateId(item.id),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Review dietary restriction' : 'Add dietary restriction'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="!bg-[#005a40] !text-white hover:!bg-[#004833]">
              Save
            </Button>
          </>
        }
      >
        {editing?.protected ? (
          <p className="mb-3 rounded-2xl bg-[#fff7ed] px-4 py-3 text-sm text-[#b45309]">
            Medical Record Source — allergy name/type are protected. You may update meal-planning notes only.
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Client"
            required
            value={form.clientId}
            onChange={(e) => setForm((prev) => ({ ...prev, clientId: e.target.value }))}
            options={clients.map(({ value, label }) => ({ value, label }))}
            disabled={Boolean(editing?.protected)}
          />
          <Select
            label="Type"
            required
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
            options={[
              { value: 'Medical Allergy', label: 'Medical Allergy' },
              { value: 'Dietary Restriction', label: 'Dietary Restriction' },
              { value: 'Food Intolerance', label: 'Food Intolerance' },
              { value: 'Preference', label: 'Preference' },
            ]}
            disabled={Boolean(editing?.protected)}
          />
          <Input
            className="sm:col-span-2"
            label="Restriction / allergy name"
            required
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            disabled={Boolean(editing?.protected)}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Under Review', label: 'Under Review' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />
          <Input
            type="date"
            label="Date recorded"
            value={form.dateRecorded}
            onChange={(e) => setForm((prev) => ({ ...prev, dateRecorded: e.target.value }))}
            disabled={Boolean(editing?.protected)}
          />
          <TextArea
            className="sm:col-span-2"
            label="Relevant notes"
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
          <TextArea
            className="sm:col-span-2"
            label="Meal plan impact"
            value={form.mealPlanImpact}
            onChange={(e) => setForm((prev) => ({ ...prev, mealPlanImpact: e.target.value }))}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deactivateId)}
        onClose={() => setDeactivateId('')}
        onConfirm={async () => {
          await deactivateDietaryRestriction(deactivateId)
          setDeactivateId('')
          setToast('Restriction deactivated.')
          await load()
        }}
        title="Deactivate this restriction?"
        description="Historical information remains available. This does not hard-delete the record."
        confirmLabel="Deactivate"
        tone="danger"
      />
      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
