export default function Checkbox({
  id,
  label,
  children,
  checked,
  onChange,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="inline-flex cursor-pointer items-start gap-2.5 text-sm text-on-surface-variant"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="bf-checkbox mt-0.5"
          {...props}
        />
        <span className="leading-snug">{children || label}</span>
      </label>
      {error ? (
        <p className="bf-field-error ml-6" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
