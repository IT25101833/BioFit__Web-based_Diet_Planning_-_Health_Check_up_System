import { useState, useId } from 'react'
import { Lock, MessageSquare, Send, Save, AlertCircle } from 'lucide-react'
import Button from '../../../../components/ui/Button'

export default function ReplyComposer({
  onSendReply,
  onAddInternalNote,
  onDraftSaved,
  ticketId,
}) {
  const [mode, setMode] = useState('reply') // 'reply' | 'note'
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [draftNotice, setDraftNotice] = useState('')
  const inputId = useId()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) {
      setError(mode === 'reply' ? 'Please type a response message for the client.' : 'Please enter an internal note.')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      if (mode === 'reply') {
        await onSendReply(text.trim())
      } else {
        await onAddInternalNote(text.trim())
      }
      setText('')
      setDraftNotice('')
    } catch (err) {
      setError(err?.message || 'Something went wrong. Your draft was preserved.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleSaveDraft() {
    if (!text.trim()) return
    localStorage.setItem(`biofit_draft_${ticketId}`, text)
    setDraftNotice('Draft saved locally.')
    setTimeout(() => setDraftNotice(''), 3000)
    onDraftSaved?.()
  }

  return (
    <div id="reply-composer" className="rounded-3xl border border-[#e8ecf1] bg-white p-5 shadow-xs sm:p-6">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between border-b border-[#eef2f0] pb-4 mb-4">
        <div className="flex items-center gap-1 rounded-xl bg-[#f4f6fb] p-1">
          <button
            type="button"
            onClick={() => {
              setMode('reply')
              setError('')
            }}
            className={[
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
              mode === 'reply'
                ? 'bg-white text-[#005a40] shadow-xs'
                : 'text-[#6b7280] hover:text-[#111827]',
            ].join(' ')}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Client Reply</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('note')
              setError('')
            }}
            className={[
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
              mode === 'note'
                ? 'bg-amber-100 text-amber-900 shadow-xs'
                : 'text-[#6b7280] hover:text-[#111827]',
            ].join(' ')}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Internal Note</span>
          </button>
        </div>

        {draftNotice ? (
          <span className="text-xs font-medium text-[#005a40] animate-pulse">
            {draftNotice}
          </span>
        ) : null}
      </div>

      {/* Internal Note Banner */}
      {mode === 'note' ? (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
          <Lock className="h-4 w-4 shrink-0 mt-0.5 text-amber-800" />
          <p className="leading-relaxed">
            <strong>Internal Note:</strong> Visible only to authorized BioFit staff. This message is never sent to or visible by the client.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={inputId} className="sr-only">
            {mode === 'reply' ? 'Reply to Client' : 'Internal Note'}
          </label>
          <textarea
            id={inputId}
            rows={4}
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              if (error) setError('')
            }}
            disabled={submitting}
            placeholder={
              mode === 'reply'
                ? 'Write a clear, empathetic response to the client…'
                : 'Log internal observations, specialist advice or operational steps taken…'
            }
            className={[
              'w-full rounded-2xl border p-4 text-sm leading-relaxed transition-all focus:outline-none focus:ring-2',
              mode === 'note'
                ? 'border-amber-200 bg-amber-50/30 text-amber-950 focus:border-amber-400 focus:ring-amber-200'
                : 'border-[#e8ecf1] bg-white text-[#111827] focus:border-[#005a40] focus:ring-[#e6f5f0]',
            ].join(' ')}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={submitting || !text.trim()}
              className="!border-[#e8ecf1] !text-[#6b7280]"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save Draft
            </Button>
            {text.trim() ? (
              <span className="text-[11px] text-[#6b7280]">
                {text.trim().split(/\s+/).length} words
              </span>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={submitting || !text.trim()}
            className={
              mode === 'note'
                ? '!bg-amber-600 !text-white hover:!bg-amber-700'
                : '!bg-[#005a40] !text-white hover:!bg-[#004833]'
            }
          >
            {submitting ? (
              'Sending…'
            ) : mode === 'reply' ? (
              <>
                <span>Send Reply</span>
                <Send className="h-3.5 w-3.5 ml-1.5" />
              </>
            ) : (
              <>
                <span>Save Internal Note</span>
                <Lock className="h-3.5 w-3.5 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
