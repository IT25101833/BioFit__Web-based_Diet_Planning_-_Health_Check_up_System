import { RefreshCw } from 'lucide-react'
import Button from './Button'

export default function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  onRetry,
  className = '',
}) {
  return (
    <section
      className={['grid w-full place-items-center px-4 py-12', className].join(' ')}
    >
      <div
        className="rounded-[1.25rem] border border-[#e8ecf1] bg-white px-8 py-10 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
        style={{ width: 'min(100%, 36rem)', minWidth: '18rem' }}
      >
        <h2
          className="font-display text-xl font-bold text-[#111827]"
          style={{ whiteSpace: 'nowrap' }}
        >
          {title}
        </h2>
        <p
          className="mt-2 text-sm leading-relaxed text-[#6b7280]"
          style={{ whiteSpace: 'nowrap' }}
        >
          {description}
        </p>
        {onRetry ? (
          <div className="mt-6">
            <Button
              onClick={onRetry}
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={2.2} />
              Try Again
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
