export default function Avatar({
  name = '',
  src,
  size = 'md',
  className = '',
  alt,
}) {
  const sizes = {
    sm: 'h-9 w-9 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-20 w-20 text-2xl',
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  if (src) {
    return (
      <img
        src={src}
        alt={alt || `${name} profile photo`}
        className={[
          'rounded-full object-cover',
          sizes[size] || sizes.md,
          className,
        ].join(' ')}
      />
    )
  }

  return (
    <span
      className={[
        'inline-flex items-center justify-center rounded-full bg-[#005a40] font-bold text-white',
        sizes[size] || sizes.md,
        className,
      ].join(' ')}
      aria-hidden={!alt}
      role={alt ? 'img' : undefined}
      aria-label={alt}
    >
      {initials || 'BF'}
    </span>
  )
}
