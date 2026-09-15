import { History, Mail, Phone, ShieldCheck, User } from 'lucide-react'
import Avatar from '../../../../components/ui/Avatar'
import Button from '../../../../components/ui/Button'

export default function ClientSupportContext({ client, onOpenHistory }) {
  if (!client) return null

  return (
    <div className="rounded-3xl border border-[#e8ecf1] bg-white p-5 shadow-xs sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-[#eef2f0] pb-3">
        <h3 className="font-display text-sm font-bold text-[#111827]">
          Client Support Context
        </h3>
        <span className="rounded-full bg-[#f4f6fb] px-2 py-0.5 text-[11px] font-medium text-[#4b5563]">
          ID: {client.id}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Avatar name={client.name} size="md" />
        <div className="min-w-0">
          <p className="font-semibold text-sm text-[#111827] truncate">{client.name}</p>
          <p className="text-xs text-[#005a40] font-medium truncate">{client.programme}</p>
        </div>
      </div>

      <div className="space-y-2 text-xs border-t border-[#eef2f0] pt-3 text-[#4b5563]">
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 text-[#8b93a1] shrink-0" />
          <span className="truncate">{client.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-[#8b93a1] shrink-0" />
          <span>{client.phone}</span>
        </div>
      </div>

      <div className="rounded-2xl bg-[#f8faf9] border border-[#e8ecf1] p-3 text-xs flex items-center justify-between">
        <span className="text-[#6b7280]">Previous Support Tickets:</span>
        <span className="font-bold text-[#111827]">{client.previousTicketCount || 0}</span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onOpenHistory}
        className="w-full !border-[#e8ecf1] !text-[#005a40]"
      >
        <History className="h-3.5 w-3.5 mr-1.5" />
        View Support History
      </Button>

      <div className="flex items-center gap-1.5 text-[11px] text-[#8b93a1] pt-1">
        <ShieldCheck className="h-3.5 w-3.5 text-[#005a40] shrink-0" />
        <span>Client contact details verified under privacy guidelines.</span>
      </div>
    </div>
  )
}
