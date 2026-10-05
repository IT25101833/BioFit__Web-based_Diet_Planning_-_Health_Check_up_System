import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import {
  fetchWallet,
  fetchWalletServices,
  formatRs,
  formatSignedRs,
  payWithWallet,
} from './data/walletData'

export default function WalletOverview() {
  const [wallet, setWallet] = useState(null)
  const [services, setServices] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const [shortfall, setShortfall] = useState(null)

  async function load() {
    const [overview, offers] = await Promise.all([fetchWallet(), fetchWalletServices()])
    setWallet(overview)
    setServices(Array.isArray(offers) ? offers : [])
  }

  useEffect(() => {
    load().catch((err) => setError(err?.message || 'Unable to load your wallet.'))
  }, [])

  async function pay(service) {
    const balance = Number(wallet?.balance || 0)
    const required = Number(service.amount || 0)
    if (balance < required) {
      setConfirmation(null)
      setShortfall({
        name: service.name,
        current: balance,
        required,
        shortfall: required - balance,
      })
      return
    }
    setBusy(true)
    setError('')
    setShortfall(null)
    try {
      const result = await payWithWallet(service.code)
      setConfirmation(result)
      await load()
    } catch (err) {
      if (err?.code === 'INSUFFICIENT_BALANCE') {
        setShortfall({
          name: service.name,
          current: balance,
          required,
          shortfall: required - balance,
        })
      } else {
        setError(err?.message || 'Unable to pay with your wallet.')
      }
    } finally {
      setBusy(false)
    }
  }

  const recent = Array.isArray(wallet?.recentTransactions) ? wallet.recentTransactions : []

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Wallet"
        description="This is your BioFit centre wallet. Balance increases only after Admin verifies a cash top-up."
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <SectionCard title="Available Balance">
        <p className="font-display text-3xl font-bold text-[#111827]">
          {wallet ? formatRs(wallet.balance) : '—'}
        </p>
        <Button to="/client/wallet/top-up" className="mt-4">
          Request Cash Top-Up
        </Button>
      </SectionCard>

      {confirmation ? (
        <SectionCard title="Payment Successful">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Item label="Service" value={confirmation.service} />
            <Item label="Amount" value={formatRs(confirmation.amount)} />
            <Item label="Payment Method" value={confirmation.paymentMethod} />
            <Item label="Previous Balance" value={formatRs(confirmation.previousBalance)} />
            <Item label="Remaining Balance" value={formatRs(confirmation.remainingBalance)} />
            <Item label="Transaction ID" value={confirmation.transactionId} />
          </dl>
        </SectionCard>
      ) : null}

      {shortfall ? (
        <SectionCard title="Insufficient Wallet Balance">
          <dl className="grid gap-3 sm:grid-cols-3">
            <Item label="Current Balance" value={formatRs(shortfall.current)} />
            <Item label="Required" value={formatRs(shortfall.required)} />
            <Item label="Shortfall" value={formatRs(shortfall.shortfall)} />
          </dl>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Pay with Wallet"
        description="Use your available balance for BioFit services."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {services.map((service) => (
            <div key={service.code} className="rounded-2xl border border-[#eef2f0] p-4">
              <p className="text-sm font-semibold text-[#111827]">{service.name}</p>
              <p className="mt-1 text-sm text-[#4b5563]">{formatRs(service.amount)}</p>
              <Button className="mt-3" size="sm" disabled={busy} onClick={() => pay(service)}>
                Pay with Wallet
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Recent Transactions">
        {recent.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No wallet transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {recent.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#111827]">
                    {formatSignedRs(item.type, item.amount)}
                  </p>
                  <p className="text-[12px] text-[#6b7280]">{item.description}</p>
                </div>
                <p className="text-[12px] text-[#6b7280]">{item.dateLabel}</p>
              </div>
            ))}
          </div>
        )}
        <Link to="/client/wallet/transactions" className="mt-4 inline-block text-sm font-semibold text-[#005a40]">
          View All Transactions
        </Link>
      </SectionCard>
    </div>
  )
}

function Item({ label, value }) {
  return (
    <div>
      <dt className="text-[12px] font-medium text-[#8b93a1]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-[#111827]">{value || '—'}</dd>
    </div>
  )
}
