import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import Label from './Label'

export default function Select({
  id,
  label,
  required = false,
  error,
  footNote,
  options = [],
  placeholder = 'Select an option',
  className = '',
  ...props
}) {
  const generatedId = useId()
  const selectId = id || generatedId
  const errorId = `${selectId}-error`
  const hasError = Boolean(error)

  return (
    <div className={className}>
      {label ? (
        <Label htmlFor={selectId}>
          {label}
          {required ? (
            <span className="ml-0.5 text-error" aria-hidden>
              *
            </span>
          ) : null}
        </Label>
      ) : null}
      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          className={[
            'bf-input appearance-none pr-11 pl-4',
            hasError ? 'bf-input-error' : '',
            !props.value ? 'text-outline' : '',
          ].join(' ')}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-outline">
          <ChevronDown className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
      {hasError ? (
        <p id={errorId} className="bf-field-error" role="alert">
          {error}
        </p>
      ) : footNote ? (
        <p className="mt-1.5 text-[11px] leading-snug text-on-surface-variant">
          {footNote}
        </p>
      ) : null}
    </div>
  )
}
