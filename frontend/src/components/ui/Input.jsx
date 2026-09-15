import { useId } from 'react'
import Label from './Label'

export default function Input({
  id,
  label,
  required = false,
  error,
  hint,
  labelHint,
  footNote,
  leftIcon: LeftIcon,
  rightSlot,
  className = '',
  type = 'text',
  ...props
}) {
  const generatedId = useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`
  const noteId = `${inputId}-note`
  const hasError = Boolean(error)

  return (
    <div className={className}>
      {(label || labelHint) && (
        <div className="mb-1.5 flex items-end justify-between gap-3">
          {label ? (
            <Label htmlFor={inputId} className="mb-0">
              {label}
              {required ? (
                <span className="ml-0.5 text-error" aria-hidden>
                  *
                </span>
              ) : null}
            </Label>
          ) : (
            <span />
          )}
          {labelHint ? (
            <span className="text-[11px] font-medium text-on-surface-variant">
              {labelHint}
            </span>
          ) : null}
        </div>
      )}
      {hint && !hasError ? (
        <p className="mb-1.5 text-[11px] text-on-surface-variant">{hint}</p>
      ) : null}
      <div className="relative">
        {LeftIcon ? (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-outline">
            <LeftIcon className="h-4 w-4" strokeWidth={2} />
          </span>
        ) : null}
        <input
          id={inputId}
          type={type}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={
            hasError ? errorId : footNote ? noteId : undefined
          }
          className={[
            'bf-input',
            LeftIcon ? 'pl-11' : 'pl-4',
            rightSlot ? 'pr-11' : 'pr-4',
            hasError ? 'bf-input-error' : '',
          ].join(' ')}
          {...props}
        />
        {rightSlot ? (
          <div className="absolute top-1/2 right-2.5 -translate-y-1/2">
            {rightSlot}
          </div>
        ) : null}
      </div>
      {hasError ? (
        <p id={errorId} className="bf-field-error" role="alert">
          {error}
        </p>
      ) : footNote ? (
        <p id={noteId} className="mt-1.5 text-[11px] leading-snug text-on-surface-variant">
          {footNote}
        </p>
      ) : null}
    </div>
  )
}
