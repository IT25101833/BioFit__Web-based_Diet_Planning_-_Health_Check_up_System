import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHeader from '../../../components/ui/PageHeader'
import Select from '../../../components/ui/Select'
import { findClientOption, readClientUserIdParam } from '../shared/medicalNav'
import { fetchMedicalClients } from '../medical-history/data/medicalHistoryData'
import PlanAccessPanel from './PlanAccessPanel'

export default function PlanAccess() {
  const [searchParams] = useSearchParams()
  const preset = readClientUserIdParam(searchParams)
  const [clients, setClients] = useState([])
  const [clientUserId, setClientUserId] = useState(preset || '')

  useEffect(() => {
    fetchMedicalClients()
      .then((rows) => {
        const options = (Array.isArray(rows) ? rows : [])
          .map((client) => ({
            value: String(client.id ?? client.userId ?? ''),
            label: client.name || client.clientName || 'Client',
          }))
          .filter((client) => client.value)
        setClients(options)
        if (preset && findClientOption(options, preset)) setClientUserId(String(preset))
      })
      .catch(() => setClients([]))
  }, [preset])

  const selected = useMemo(
    () => clients.find((client) => client.value === String(clientUserId)),
    [clients, clientUserId],
  )

  return (
    <div>
      <p className="mb-3 text-[12px] text-[#8b93a1]">
        <Link to="/medical/dashboard" className="hover:text-[#005a40] hover:underline">
          Medical Advisor
        </Link>
        {' › Request Client'}
      </p>
      <PageHeader
        title="Request Client"
        description="Choose a client, then request permission to view their workout or nutrition plan."
      />
      <div className="mb-4 max-w-md">
        <Select
          label="Client"
          value={clientUserId}
          onChange={(event) => setClientUserId(event.target.value)}
          options={clients}
          placeholder="Select client"
        />
      </div>
      <PlanAccessPanel clientUserId={clientUserId} clientName={selected?.label} />
    </div>
  )
}
