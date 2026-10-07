import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, History, WalletCards } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import { fetchWallet, formatRs } from './data/walletData'

export default function WalletOverview() {
  const [wallet, setWallet] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWallet()
      .then(setWallet)
      .catch((err) => setError(err?.message || 'Unable to load your wallet.'))
  }, [])

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Wallet"
        description="This is your BioFit centre wallet. Balance increases only after Admin verifies a cash top-up."
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <SectionCard title="Available Balance">
        <p className="font-display text-4xl font-bold text-[#111827]">
          {wallet ? formatRs(wallet.balance) : '—'}
        </p>
        <p className="mt-2 text-sm text-[#6b7280]">
          Appointment fees are paid from this balance when you confirm a booking.
        </p>
      </SectionCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/client/wallet/requests"
          className="group rounded-2xl border border-[#eef2f0] bg-white p-5 transition-colors hover:border-[#005a40] hover:bg-[#f7fbf9]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
            <WalletCards className="h-5 w-5" strokeWidth={2.1} />
          </span>
          <p className="mt-4 text-base font-semibold text-[#111827]">Top-Up Requests</p>
          <p className="mt-1 text-sm text-[#6b7280]">
            Submit a cash top-up and track requests waiting for Admin verification.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#005a40]">
            Open
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          to="/client/wallet/transactions"
          className="group rounded-2xl border border-[#eef2f0] bg-white p-5 transition-colors hover:border-[#005a40] hover:bg-[#f7fbf9]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
            <History className="h-5 w-5" strokeWidth={2.1} />
          </span>
          <p className="mt-4 text-base font-semibold text-[#111827]">Transaction History</p>
          <p className="mt-1 text-sm text-[#6b7280]">
            See every credit and debit recorded on this wallet.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#005a40]">
            Open
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </div>
  )
}
