export default function Container({ children, className = '' }) {
  return <div className={`bf-container ${className}`}>{children}</div>
}
