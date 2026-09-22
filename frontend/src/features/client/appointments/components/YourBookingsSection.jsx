import { useEffect, useMemo, useState } from 'react'
import Button from '../../../../components/ui/Button'
import FilterTabs from '../../../../components/ui/FilterTabs'
import Modal from '../../../../components/ui/Modal'
import SectionCard from '../../../../components/ui/SectionCard'
import StatusBadge from '../../../../components/ui/StatusBadge'
import {
  PAST_DATE_MESSAGE,
  filterAvailableSlotsForDate,
  isDateBeforeToday,
  localTodayIso,
} from '../../../booking/bookingEngine'
import {
  cancelClientAppointment,
  fetchBookingCatalog,
  fetchClientAppointments,
  fetchProfessionalAvailability,
  formatAppointmentDate,
  formatAppointmentDateLong,
  formatAppointmentTimeRange,
  formatDurationLabel,
  getBookingDateOptions,
  isPastAppointment,
  isUpcomingAppointment,
  rescheduleClientAppointment,
} from '../data/appointmentData'

const tabs = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

function displayStatus(appointment) {
  const status = String(appointment?.status || '')
  if (status.toLowerCase() === 'upcoming') return 'Confirmed'
  return status || 'Confirmed'
}

function canModify(appointment) {
  return isUpcomingAppointment(appointment)
}

function sortByNearest(a, b) {
  const dateCmp = String(a.date || '').localeCompare(String(b.date || ''))
  if (dateCmp !== 0) return dateCmp
  return String(a.time || '').localeCompare(String(b.time || ''))
}

export default function YourBookingsSection({
  audience = 'CLIENT',
  refreshKey = 0,
  onToast,
}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('upcoming')
  const [viewTarget, setViewTarget] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelError, setCancelError] = useState('')
  const [updateTarget, setUpdateTarget] = useState(null)
  const [confirmUpdate, setConfirmUpdate] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsMessage, setSlotsMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [updateDateError, setUpdateDateError] = useState('')
  const dateOptions = useMemo(() => getBookingDateOptions(), [])
  const minDate = localTodayIso()

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchClientAppointments(audience)
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setItems([])
      setError('Unable to load your bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [audience, refreshKey])

  const filtered = useMemo(() => {
    let list = items
    if (tab === 'upcoming') list = items.filter((item) => isUpcomingAppointment(item))
    else if (tab === 'completed') list = items.filter((item) => isPastAppointment(item))
    else if (tab === 'cancelled') {
      list = items.filter((item) => String(item.status).toLowerCase() === 'cancelled')
    }
    return [...list].sort(sortByNearest)
  }, [items, tab])

  useEffect(() => {
    if (!updateTarget || !newDate) {
      setSlots([])
      setSlotsMessage('')
      return undefined
    }
    let cancelled = false
    async function loadSlots() {
      setSlotsLoading(true)
      setNewTime('')
      setSlotsMessage('')
      try {
        let professionalId =
          updateTarget.professionalId ||
          (updateTarget.professionalUserId ? `user-${updateTarget.professionalUserId}` : '')
        if (!professionalId && updateTarget.professional) {
          const catalog = await fetchBookingCatalog(audience)
          const match = (catalog.professionals || []).find(
            (p) =>
              String(p.name).toLowerCase() === String(updateTarget.professional).toLowerCase(),
          )
          professionalId = match?.id || (match?.userId ? `user-${match.userId}` : '')
        }
        if (!professionalId) {
          if (!cancelled) {
            setSlots([])
            setSlotsMessage('Could not resolve the professional for this booking.')
          }
          return
        }
        const data = await fetchProfessionalAvailability({
          professionalId,
          date: newDate,
          duration: updateTarget.duration || '45 min',
          audience,
          excludeAppointmentId: updateTarget.id,
        })
        if (!cancelled) {
          setSlots(filterAvailableSlotsForDate(data.availableSlots || [], newDate))
          setSlotsMessage(data.message || '')
        }
      } catch (err) {
        if (!cancelled) {
          setSlots([])
          setSlotsMessage(err?.message || 'Could not load available times.')
        }
      } finally {
        if (!cancelled) setSlotsLoading(false)
      }
    }
    loadSlots()
    return () => {
      cancelled = true
    }
  }, [updateTarget, newDate, audience])

  async function handleCancel() {
    if (!cancelTarget?.id) return
    const appointmentId = cancelTarget.id
    setBusy(true)
    setCancelError('')
    try {
      await cancelClientAppointment(appointmentId, audience)
      const data = await fetchClientAppointments(audience)
      setItems(Array.isArray(data) ? data : [])
      setCancelTarget(null)
      setTab('cancelled')
      onToast?.('Booking cancelled successfully.')
    } catch (err) {
      setCancelError(err?.message || 'Unable to cancel this booking. Please try again.')
      onToast?.(err?.message || 'Unable to cancel this booking.')
    } finally {
      setBusy(false)
    }
  }

  async function handleConfirmUpdate() {
    if (!updateTarget || !newDate || !newTime) return
    if (isDateBeforeToday(newDate)) {
      setUpdateDateError(PAST_DATE_MESSAGE)
      setConfirmUpdate(false)
      return
    }
    setBusy(true)
    try {
      let professionalId =
        updateTarget.professionalId ||
        (updateTarget.professionalUserId ? `user-${updateTarget.professionalUserId}` : '')
      if (!professionalId && updateTarget.professional) {
        const catalog = await fetchBookingCatalog(audience)
        const match = (catalog.professionals || []).find(
          (p) =>
            String(p.name).toLowerCase() === String(updateTarget.professional).toLowerCase(),
        )
        professionalId = match?.id || (match?.userId ? `user-${match.userId}` : '')
      }
      const updated = await rescheduleClientAppointment(
        updateTarget.id,
        {
          date: newDate,
          time: newTime,
          duration: updateTarget.duration,
          professionalId,
          professionalUserId: updateTarget.professionalUserId,
        },
        audience,
      )
      setItems((prev) =>
        prev.map((item) =>
          item.id === updateTarget.id
            ? {
                ...item,
                ...updated,
                date: updated.date || newDate,
                time: updated.time || newTime,
                status: 'Upcoming',
              }
            : item,
        ),
      )
      setConfirmUpdate(false)
      setUpdateTarget(null)
      setNewDate('')
      setNewTime('')
      onToast?.('Booking updated successfully.')
    } catch (err) {
      onToast?.(err?.message || 'Unable to update this booking.')
      setConfirmUpdate(false)
    } finally {
      setBusy(false)
    }
  }

  function openUpdate(appointment) {
    const nextDate =
      appointment.date && !isDateBeforeToday(appointment.date) ? appointment.date : minDate
    setUpdateTarget(appointment)
    setNewDate(nextDate)
    setNewTime('')
    setUpdateDateError('')
    setConfirmUpdate(false)
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--bf-ink)]">Your Bookings</h2>
          <p className="mt-1 text-sm text-[var(--bf-muted)]">
            Appointments you have booked appear here with date, time and duration.
          </p>
        </div>
        <FilterTabs ariaLabel="Booking filters" value={tab} onChange={setTab} options={tabs} />
      </div>

      {loading ? (
        <SectionCard>
          <p className="text-sm text-[var(--bf-muted)]">Loading your bookings…</p>
        </SectionCard>
      ) : error ? (
        <SectionCard>
          <p className="text-sm text-red-700">{error}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-3 !border-[var(--bf-border)] !text-[var(--bf-ink)]"
            onClick={load}
          >
            Try again
          </Button>
        </SectionCard>
      ) : filtered.length === 0 ? (
        <SectionCard>
          <p className="text-sm text-[var(--bf-muted)]">
            {tab === 'upcoming'
              ? "You don't have any bookings yet. Book a service above to get started."
              : `No ${tab} bookings.`}
          </p>
        </SectionCard>
      ) : (
        <div className="space-y-4">
          {filtered.map((appointment) => {
            const modifiable = canModify(appointment)
            return (
              <article
                key={appointment.id}
                className="rounded-[1.25rem] border border-[var(--bf-border)] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-[var(--bf-ink)]">
                      {appointment.service}
                    </h3>
                    <p className="mt-2 text-sm font-semibold text-[var(--bf-ink)]">
                      {formatAppointmentDate(appointment.date)} •{' '}
                      {formatAppointmentTimeRange(appointment)} •{' '}
                      {formatDurationLabel(appointment.duration)}
                    </p>
                    <p className="mt-2 text-sm text-[var(--bf-muted)]">
                      {appointment.professional}
                    </p>
                  </div>
                  <StatusBadge status={displayStatus(appointment)} />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="!border-[#005a40]/25 !text-[#005a40] hover:!bg-[#e6f5f0]"
                    onClick={() => setViewTarget(appointment)}
                  >
                    View Booking
                  </Button>
                  {modifiable ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="!border-[#005a40]/25 !text-[#005a40] hover:!bg-[#e6f5f0]"
                        onClick={() => openUpdate(appointment)}
                      >
                        Update Booking
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="!bg-[#fff7ed] !text-[#b45309] hover:!bg-[#ffedd5]"
                        onClick={() => setCancelTarget(appointment)}
                      >
                        Cancel Booking
                      </Button>
                    </>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Modal
        open={Boolean(viewTarget)}
        onClose={() => setViewTarget(null)}
        title="Booking Details"
        footer={
          <Button variant="outline" onClick={() => setViewTarget(null)}>
            Close
          </Button>
        }
      >
        {viewTarget ? (
          <div className="space-y-3 text-sm">
            <DetailRow label="Service" value={viewTarget.service} />
            <DetailRow label="Professional" value={viewTarget.professional} />
            <DetailRow label="Date" value={formatAppointmentDateLong(viewTarget.date)} />
            <DetailRow label="Time" value={formatAppointmentTimeRange(viewTarget)} />
            <DetailRow label="Duration" value={formatDurationLabel(viewTarget.duration)} />
            <DetailRow label="Status" value={displayStatus(viewTarget)} />
            {viewTarget.bookingReference ? (
              <DetailRow label="Booking ID" value={viewTarget.bookingReference} />
            ) : null}
            {viewTarget.location ? <DetailRow label="Location" value={viewTarget.location} /> : null}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(cancelTarget)}
        onClose={() => {
          if (busy) return
          setCancelTarget(null)
          setCancelError('')
        }}
        title="Cancel Booking?"
        description="Are you sure you want to cancel this appointment?"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setCancelTarget(null)
                setCancelError('')
              }}
            >
              Keep Booking
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={() => {
                void handleCancel()
              }}
              className="!bg-[#b45309] !text-white hover:!bg-[#92400e]"
            >
              {busy ? 'Cancelling…' : 'Cancel Booking'}
            </Button>
          </>
        }
      >
        {cancelTarget ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--bf-muted)]">
              Are you sure you want to cancel:
              <br />
              <strong className="text-[var(--bf-ink)]">{cancelTarget.service}</strong>
              <br />
              {formatAppointmentDateLong(cancelTarget.date)}
              <br />
              {formatAppointmentTimeRange(cancelTarget)}
            </p>
            {cancelError ? (
              <p className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]" role="alert">
                {cancelError}
              </p>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(updateTarget) && !confirmUpdate}
        onClose={() => !busy && setUpdateTarget(null)}
        title="Update Booking"
        description="Choose a new available date and time."
        footer={
          <>
            <Button variant="outline" disabled={busy} onClick={() => setUpdateTarget(null)}>
              Cancel
            </Button>
            <Button
              disabled={!newDate || !newTime || busy || Boolean(updateDateError)}
              onClick={() => {
                if (isDateBeforeToday(newDate)) {
                  setUpdateDateError(PAST_DATE_MESSAGE)
                  return
                }
                setUpdateDateError('')
                setConfirmUpdate(true)
              }}
              className="!bg-[var(--bf-primary)] !text-white hover:opacity-90"
            >
              Update Booking
            </Button>
          </>
        }
      >
        {updateTarget ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--bf-border)] bg-[var(--bf-surface)] px-4 py-3 text-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bf-muted)]">
                Current appointment
              </p>
              <p className="mt-1 font-semibold text-[var(--bf-ink)]">
                {formatAppointmentDate(updateTarget.date)} •{' '}
                {formatAppointmentTimeRange(updateTarget)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--bf-ink)]">New Date</p>
              <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                {dateOptions.map((iso) => {
                  const label = new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => {
                        setNewDate(iso)
                        setUpdateDateError(
                          isDateBeforeToday(iso) ? PAST_DATE_MESSAGE : '',
                        )
                        setNewTime('')
                      }}
                      className={[
                        'rounded-2xl border px-3 py-2.5 text-left text-sm transition',
                        newDate === iso
                          ? 'border-[var(--bf-primary)] bg-[var(--bf-primary-soft)] font-semibold'
                          : 'border-[var(--bf-border)] hover:bg-[var(--bf-surface)]',
                      ].join(' ')}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              {updateDateError ? (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {updateDateError}
                </p>
              ) : null}
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--bf-ink)]">New Time</p>
              {!newDate ? (
                <p className="text-sm text-[var(--bf-muted)]">Select a date first.</p>
              ) : slotsLoading ? (
                <p className="text-sm text-[var(--bf-muted)]">Loading available times…</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-[var(--bf-muted)]">
                  {slotsMessage || 'No open slots on this day.'}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setNewTime(slot)}
                      className={[
                        'rounded-2xl border px-3 py-2.5 text-sm transition',
                        newTime === slot
                          ? 'border-[var(--bf-primary)] bg-[var(--bf-primary)] font-semibold text-white'
                          : 'border-[var(--bf-border)] hover:bg-[var(--bf-surface)]',
                      ].join(' ')}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(updateTarget) && confirmUpdate}
        onClose={() => !busy && setConfirmUpdate(false)}
        title="Update Booking?"
        footer={
          <>
            <Button variant="outline" disabled={busy} onClick={() => setConfirmUpdate(false)}>
              Go Back
            </Button>
            <Button
              disabled={busy}
              onClick={handleConfirmUpdate}
              className="!bg-[var(--bf-primary)] !text-white hover:opacity-90"
            >
              {busy ? 'Updating…' : 'Confirm Update'}
            </Button>
          </>
        }
      >
        {updateTarget ? (
          <div className="space-y-3 text-sm">
            <div className="rounded-2xl border border-[var(--bf-border)] bg-[var(--bf-surface)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bf-muted)]">
                Current
              </p>
              <p className="mt-1 font-semibold text-[var(--bf-ink)]">
                {formatAppointmentDate(updateTarget.date)}
              </p>
              <p>{updateTarget.time}</p>
            </div>
            <div className="rounded-2xl border border-[#005a40]/20 bg-[#e6f5f0] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#005a40]">
                New
              </p>
              <p className="mt-1 font-semibold text-[var(--bf-ink)]">
                {formatAppointmentDate(newDate)}
              </p>
              <p>{newTime}</p>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--bf-border)] py-2.5 last:border-0">
      <span className="text-[var(--bf-muted)]">{label}</span>
      <span className="text-right font-semibold text-[var(--bf-ink)]">{value || '—'}</span>
    </div>
  )
}
