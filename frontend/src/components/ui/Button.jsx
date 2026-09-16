import { Link } from 'react-router-dom'

const variants = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-hover border border-transparent shadow-ambient',
  secondary:
    'bg-lavender text-on-lavender hover:bg-lavender-hover',
  mint:
    'bg-accent-soft text-on-surface hover:bg-secondary-container',
  outline:
    'bg-surface text-on-surface border border-outline-variant hover:border-primary hover:bg-primary-container',
  ghost:
    'bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-soft',
}

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-base rounded-2xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  to,
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  const classes = [
    'inline-flex items-center justify-center gap-2 font-semibold',
    'transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    disabled ? 'pointer-events-none opacity-60' : '',
    variants[variant],
    sizes[size],
    className,
  ].join(' ')

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  )
}
