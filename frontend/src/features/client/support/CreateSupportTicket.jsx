import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import Select from '../../../components/ui/Select'
import TextArea from '../../../components/ui/TextArea'
import Toast from '../../../components/ui/Toast'
import {
  createClientSupportTicket,
  relatedServices,
  supportCategories,
} from './data/supportData'

export default function CreateSupportTicket() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    subject: '',
    category: '',
    description: '',
    relatedService: '',
    attachmentName: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate() {
    const next = {}
    if (!form.subject.trim()) next.subject = 'Please enter a subject.'
    if (!form.category) next.category = 'Please choose a category.'
    if (!form.description.trim()) next.description = 'Please describe your request.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setToast('')
    try {
      const created = await createClientSupportTicket({
        subject: form.subject.trim(),
        category: form.category,
        description: form.description.trim(),
        relatedService: form.relatedService || 'General',
        attachmentName: form.attachmentName || null,
      })
      setToast('Support ticket submitted.')
      window.setTimeout(() => navigate(`/client/support/${created.id}`), 700)
    } catch (err) {
      setToast(err?.message || 'Could not submit the ticket. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Create Support Ticket"
        description="Share a clear subject and description so our team can help quickly."
      />

      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Subject"
            required
            value={form.subject}
            onChange={(e) => update('subject', e.target.value)}
            error={errors.subject}
            placeholder="Brief summary of your request"
          />
          <Select
            label="Category"
            required
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            options={supportCategories}
            error={errors.category}
          />
          <TextArea
            label="Description"
            required
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            error={errors.description}
            placeholder="Tell us what you need help with"
          />
          <Select
            label="Related service (optional)"
            value={form.relatedService}
            onChange={(e) => update('relatedService', e.target.value)}
            options={relatedServices}
          />
          <div>
            <label className="bf-label" htmlFor="attachment">
              Attachment (optional)
            </label>
            <input
              id="attachment"
              type="file"
              className="mt-1 block w-full text-sm text-[#4b5563] file:mr-3 file:rounded-full file:border-0 file:bg-[#e6f5f0] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#005a40]"
              onChange={(e) =>
                update('attachmentName', e.target.files?.[0]?.name || '')
              }
            />
            {form.attachmentName ? (
              <p className="mt-1.5 text-[12px] text-[#6b7280]">
                Selected: {form.attachmentName}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              to="/client/support"
              className="!border-[#e8ecf1] !text-[#4b5563]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              {submitting ? 'Submitting…' : 'Submit Ticket'}
            </Button>
          </div>
        </form>
      </SectionCard>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
