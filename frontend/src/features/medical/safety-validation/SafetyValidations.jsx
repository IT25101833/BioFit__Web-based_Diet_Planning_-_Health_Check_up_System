import { useEffect, useMemo, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import Select from '../../../components/ui/Select'
import StatusBadge from '../../../components/ui/StatusBadge'
import TextArea from '../../../components/ui/TextArea'
import Toast from '../../../components/ui/Toast'
import PrivacyBanner from '../shared/PrivacyBanner'
import { formatMedicalDate } from '../health-records/data/healthRecordData'
import { fetchMedicalClients } from '../medical-history/data/medicalHistoryData'
import {
  fetchSafetyValidations,
  runSafetyValidation,
} from './data/safetyValidationData'

export default function SafetyValidations() {
  const [items, setItems] = useState([])
  const [clients, setClients] = useState([])
  const [clientId, setClientId] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [latest, setLatest] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [list, clientList] = await Promise.all([
        fetchSafetyValidations(),
        fetchMedicalClients(),
      ])
      setItems(list)
      setClients(clientList)
      if (!clientId && clientList[0]) setClientId(clientList[0].clientId)
    } catch {
      setError('We couldn’t load safety validation results.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const selected = useMemo(
    () => clients.find((c) => c.clientId === clientId),
    [clients, clientId],
  )

  async function handleRun() {
    if (!selected) {
      setToast('Please select a client first.')
      return
    }
    setRunning(true)
    try {
      const result = await runSafetyValidation({
        clientId: selected.clientId,
        clientName: selected.clientName,
        userId: selected.userId,
        advisorNotes: notes.trim(),
        referenceType: 'CLIENT',
      })
      setLatest(result)
      setToast(`Safety validation complete: ${result.resultStatus || result.status}`)
      await load()
    } catch (err) {
      setToast(err?.message || 'Safety validation failed.')
    } finally {
      setRunning(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={5} />
  if (error) return <ErrorState title={error} onRetry={load} />

  return (
    <div>
      <PageHeader
        title="Safety Validation"
        description="Run a safety review against the client’s medical history, allergies, alerts, and assessments."
      />

      <PrivacyBanner
        className="mb-5"
        description="This is a project safety/review check based on stored BioFit data — not a diagnostic system."
      />

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <SectionCard title="Run Safety Validation" className="lg:col-span-1">
          <div className="space-y-4">
            <Select
              label="Client"
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              options={clients.map((c) => ({
                value: c.clientId,
                label: `${c.clientName} (${c.clientId})`,
              }))}
              placeholder="Select client"
            />
            <TextArea
              label="Advisor notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Context for this validation run"
            />
            <Button
              type="button"
              disabled={running || !clientId}
              onClick={handleRun}
              className="w-full !bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              <ShieldCheck className="h-4 w-4" />
              {running ? 'Running…' : 'Run Safety Validation'}
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Latest Result" className="lg:col-span-2">
          {!latest ? (
            <p className="text-sm text-[#6b7280]">
              Run a validation to see warnings and clearance status here.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={latest.resultStatus || latest.status} />
                <span className="text-sm text-[#6b7280]">
                  {latest.clientName} · {formatMedicalDate(latest.validatedAt)}
                </span>
              </div>
              <ul className="space-y-2">
                {(latest.warnings || []).length === 0 ? (
                  <li className="rounded-xl bg-[#f2fbf7] px-3 py-2 text-sm text-[#005a40]">
                    No warnings identified from available BioFit data.
                  </li>
                ) : (
                  (latest.warnings || []).map((warning, index) => (
                    <li
                      key={`${index}-${warning}`}
                      className="rounded-xl border border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-sm text-[#92400e]"
                    >
                      {warning}
                    </li>
                  ))
                )}
              </ul>
              {latest.advisorNotes ? (
                <p className="text-sm text-[#4b5563]">
                  <span className="font-semibold text-[#111827]">Notes: </span>
                  {latest.advisorNotes}
                </p>
              ) : null}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Validation History">
        {items.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No validation results yet"
            description="Completed safety checks will appear in this history list."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                <tr>
                  <th className="px-2 py-2">Client</th>
                  <th className="px-2 py-2">Result</th>
                  <th className="px-2 py-2">Warnings</th>
                  <th className="px-2 py-2">Validated by</th>
                  <th className="px-2 py-2">When</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-[#eef2f0]">
                    <td className="px-2 py-3">
                      <p className="font-semibold text-[#111827]">{item.clientName}</p>
                      <p className="text-[12px] text-[#6b7280]">{item.clientId}</p>
                    </td>
                    <td className="px-2 py-3">
                      <StatusBadge status={item.resultStatus || item.status} />
                    </td>
                    <td className="px-2 py-3 text-[#4b5563]">
                      {(item.warnings || []).length} issue(s)
                    </td>
                    <td className="px-2 py-3 text-[#4b5563]">{item.validatedBy || '—'}</td>
                    <td className="px-2 py-3 text-[#4b5563]">
                      {formatMedicalDate(item.validatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
