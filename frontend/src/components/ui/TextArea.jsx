import { useId } from 'react'
import Label from './Label'

export default function TextArea({
  id,
  label,
  required = false,
  error,
  hint,
  rows = 4,
  className = '',
  ...props
}) {
  const generatedId = useId()
  const fieldId = id || generatedId
  const errorId = `${fieldId}-error`
  const hasError = Boolean(error)

  return (
    <div className={className}>
      {label ? (
        <Label htmlFor={fieldId}>
          {label}
          {required ? (
            <span className="ml-0.5 text-error" aria-hidden>
              *
            </span>
          ) : null}
        </Label>
      ) : null}
      <textarea
        id={fieldId}
        rows={rows}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        className={[
          'bf-input min-h-[110px] w-full resize-y',
          hasError ? 'bf-input-error' : '',
        ].join(' ')}
        {...props}
      />
      {hint && !error ? (
        <p className="mt-1.5 text-[12px] text-[#8b93a1]">{hint}</p>
      ) : null}
      {error ? (
        <p id={errorId} className="bf-field-error mt-1.5" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
