import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ActionMenu from '../../../components/ui/ActionMenu'
import Avatar from '../../../components/ui/Avatar'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import SearchBar from '../../../components/ui/SearchBar'
import Select from '../../../components/ui/Select'
import StatCard from '../../../components/ui/StatCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import { fetchCoachClients, formatCoachDate } from './data/clientFitnessData'

export default function CoachClients() {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [programme, setProgramme] = useState('')
  const [planStatus, setPlanStatus] = useState('')
  const [assessmentStatus, setAssessmentStatus] = useState('')
  const [progressStatus, setProgressStatus] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setClients(await fetchCoachClients())
    } catch {
      setError('We couldn’t load your clients.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return clients.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q))
        return false
      if (programme && c.programme !== programme) return false
      if (planStatus && c.planStatus !== planStatus) return false
      if (assessmentStatus && c.assessmentStatus !== assessmentStatus) return false
      if (progressStatus && c.progressStatus !== progressStatus) return false
      return true
    })
  }, [clients, search, programme, planStatus, assessmentStatus, progressStatus])

  const summary = useMemo(
    () => ({
      total: clients.length,
      activePlans: clients.filter((c) => c.planStatus === 'Active').length,
      assessmentsDue: clients.filter((c) => c.assessmentStatus === 'Due').length,
      progressDue: clients.filter((c) => c.progressStatus === 'Update Due').length,
    }),
    [clients],
  )

  if (loading) return <LoadingSkeleton rows={5} />
  if (error) return <ErrorState title="We couldn’t load your clients." onRetry={load} />

  return (
    <div>
      <PageHeader
        title="My Clients"
        description="View and manage clients currently assigned to you."
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Clients" value={summary.total} />
        <StatCard label="Active Plans" value={summary.activePlans} />
        <StatCard label="Assessments Due" value={summary.assessmentsDue} />
        <StatCard label="Progress Updates Due" value={summary.progressDue} />
      </div>

      <div className="mb-4 grid gap-3 rounded-[1.25rem] border border-[#e8ecf1] bg-white p-4 lg:grid-cols-5">
        <SearchBar
          className="lg:col-span-2"
          value={search}
          onChange={setSearch}
          placeholder="Search clients by name or ID…"
        />
        <Select
          value={programme}
          onChange={(e) => setProgramme(e.target.value)}
          options={[...new Set(clients.map((c) => c.programme))].map((v) => ({
            value: v,
            label: v,
          }))}
          placeholder="Programme"
        />
        <Select
          value={planStatus}
          onChange={(e) => setPlanStatus(e.target.value)}
          options={[
            { value: 'Active', label: 'Active' },
            { value: 'Draft', label: 'Draft' },
            { value: 'Completed', label: 'Completed' },
          ]}
          placeholder="Workout plan status"
        />
        <Select
          value={assessmentStatus}
          onChange={(e) => setAssessmentStatus(e.target.value)}
          options={[
            { value: 'Up to date', label: 'Up to date' },
            { value: 'Due', label: 'Due' },
          ]}
          placeholder="Assessment status"
        />
        <Select
          className="lg:col-span-2"
          value={progressStatus}
          onChange={(e) => setProgressStatus(e.target.value)}
          options={[
            { value: 'On Track', label: 'On Track' },
            { value: 'Needs Review', label: 'Needs Review' },
            { value: 'Update Due', label: 'Update Due' },
          ]}
          placeholder="Progress status"
        />
        <Button
          variant="outline"
          className="!text-[#4b5563]"
          onClick={() => {
            setSearch('')
            setProgramme('')
            setPlanStatus('')
            setAssessmentStatus('')
            setProgressStatus('')
          }}
        >
          Clear Filters
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="You don’t have any assigned clients yet."
          description="Assigned clients will appear here once programmes are linked to you."
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[1.25rem] border border-[#e8ecf1] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-[1080px] w-full text-left text-sm">
                <thead className="bg-[#f8faf9] text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                  <tr>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Client ID</th>
                    <th className="px-4 py-3">Programme</th>
                    <th className="px-4 py-3">Current Workout Plan</th>
                    <th className="px-4 py-3">Plan Progress</th>
                    <th className="px-4 py-3">Last Assessment</th>
                    <th className="px-4 py-3">Next Session</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((client) => (
                    <tr key={client.id} className="border-t border-[#eef2f0]">
                      <td className="px-4 py-3.5 font-semibold text-[#111827]">
                        {client.name}
                      </td>
                      <td className="px-4 py-3.5 text-[#4b5563]">{client.id}</td>
                      <td className="px-4 py-3.5 text-[#4b5563]">{client.programme}</td>
                      <td className="px-4 py-3.5 text-[#4b5563]">{client.workoutPlan}</td>
                      <td className="px-4 py-3.5 text-[#4b5563]">{client.planProgress}%</td>
                      <td className="px-4 py-3.5 text-[#4b5563]">
                        {formatCoachDate(client.lastAssessment)}
                      </td>
                      <td className="px-4 py-3.5 text-[#4b5563]">
                        {formatCoachDate(client.nextSession)}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={client.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <ActionMenu
                          items={[
                            {
                              label: 'View Fitness Profile',
                              onClick: () => navigate(`/coach/clients/${client.id}`),
                            },
                            {
                              label: 'View Workout Plan',
                              disabled: !client.workoutPlanId,
                              onClick: () =>
                                navigate(`/coach/workout-plans/${client.workoutPlanId}`),
                            },
                            {
                              label: 'Record Progress',
                              onClick: () => navigate(`/coach/progress/${client.id}`),
                            },
                            {
                              label: 'Create Assessment',
                              onClick: () => navigate('/coach/assessments/create'),
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

          <div className="grid gap-3 lg:hidden">
            {filtered.map((client) => (
              <article
                key={client.id}
                className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={client.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-[#111827]">{client.name}</p>
                        <p className="text-[12px] text-[#8b93a1]">{client.id}</p>
                      </div>
                      <StatusBadge status={client.status} />
                    </div>
                    <p className="mt-2 text-sm text-[#4b5563]">{client.programme}</p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">
                      {client.workoutPlan} · {client.planProgress}%
                    </p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">
                      Next: {formatCoachDate(client.nextSession)}
                    </p>
                    <Button
                      to={`/coach/clients/${client.id}`}
                      size="sm"
                      className="mt-3 !bg-[#005a40] !text-white"
                    >
                      View Client
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
