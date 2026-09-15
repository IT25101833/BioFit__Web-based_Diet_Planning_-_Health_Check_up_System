import { Search, X, SlidersHorizontal } from 'lucide-react'
import { supportCategories, supportOfficers, supportPriorities, supportStatuses } from '../data/supportTicketsData'

export default function TicketFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  assignedTo,
  onAssignedToChange,
  sortBy,
  onSortByChange,
  onReset,
  hasActiveFilters,
}) {
  return (
    <div className="rounded-2xl border border-[#e8ecf1] bg-white p-4 shadow-xs space-y-3.5 mb-5">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by ticket ID, client, subject or keyword…"
          className="w-full rounded-xl border border-[#e8ecf1] bg-[#f8faf9] pl-10 pr-4 py-2.5 text-sm text-[#111827] placeholder-[#9ca3af] focus:bg-white focus:border-[#005a40] focus:outline-none focus:ring-1 focus:ring-[#005a40]"
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151]"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        <div>
          <label className="sr-only">Category</label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-xl border border-[#e8ecf1] bg-white px-3 py-2 text-xs text-[#374151] focus:border-[#005a40] focus:outline-none"
          >
            <option value="">All Categories</option>
            {supportCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="sr-only">Status</label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full rounded-xl border border-[#e8ecf1] bg-white px-3 py-2 text-xs text-[#374151] focus:border-[#005a40] focus:outline-none"
          >
            <option value="">All Statuses</option>
            {supportStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="sr-only">Priority</label>
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full rounded-xl border border-[#e8ecf1] bg-white px-3 py-2 text-xs text-[#374151] focus:border-[#005a40] focus:outline-none"
          >
            <option value="">All Priorities</option>
            {supportPriorities.map((p) => (
              <option key={p} value={p}>
                {p} Priority
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="sr-only">Assigned Officer</label>
          <select
            value={assignedTo}
            onChange={(e) => onAssignedToChange(e.target.value)}
            className="w-full rounded-xl border border-[#e8ecf1] bg-white px-3 py-2 text-xs text-[#374151] focus:border-[#005a40] focus:outline-none"
          >
            <option value="">All Assignees</option>
            <option value="unassigned">Unassigned Only</option>
            {supportOfficers.map((o) => (
              <option key={o.id} value={o.name}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="sr-only">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="w-full rounded-xl border border-[#e8ecf1] bg-white px-3 py-2 text-xs text-[#374151] focus:border-[#005a40] focus:outline-none"
          >
            <option value="newest">Newest Created</option>
            <option value="oldest">Oldest Created</option>
            <option value="updated">Recently Updated</option>
            <option value="waiting">Waiting Longest</option>
            <option value="priority">High Priority First</option>
          </select>
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="flex items-center justify-between pt-1 border-t border-[#f4f6fb]">
          <span className="text-xs text-[#6b7280]">Filters are applied</span>
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-[#005a40] hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : null}
    </div>
  )
}
