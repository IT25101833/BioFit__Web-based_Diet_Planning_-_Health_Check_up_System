export default function Label({ htmlFor, children, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={`bf-label ${className}`}>
      {children}
    </label>
  )
}
