export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className = '',
}) {
  const alignClass =
    align === 'left' ? 'text-left items-start' : 'text-center items-center mx-auto'

  return (
    <div className={`mb-12 flex max-w-2xl flex-col gap-3 ${alignClass} ${className}`}>
      {eyebrow ? (
        <p className="font-label-caps text-label-caps uppercase text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-h2 text-h2 text-on-surface">{title}</h2>
      {description ? (
        <p className="text-on-surface-variant leading-relaxed">{description}</p>
      ) : null}
    </div>
  )
}
