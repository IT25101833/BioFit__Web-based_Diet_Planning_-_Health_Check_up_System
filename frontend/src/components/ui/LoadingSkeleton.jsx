export default function LoadingSkeleton({ rows = 4, className = '' }) {
  return (
    <div className={['space-y-4', className].join(' ')} aria-busy="true" aria-live="polite">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-[#e8ecf1]" />
      <div className="h-4 w-72 max-w-full animate-pulse rounded bg-[#eef2f0]" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-[1.25rem] border border-[#e8ecf1] bg-white"
          >
            <div className="space-y-3 p-5">
              <div className="h-4 w-1/3 rounded bg-[#eef2f0]" />
              <div className="h-3 w-2/3 rounded bg-[#f4f6fb]" />
              <div className="h-3 w-1/2 rounded bg-[#f4f6fb]" />
              <div className="mt-6 h-2 w-full rounded-full bg-[#eef2f0]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
