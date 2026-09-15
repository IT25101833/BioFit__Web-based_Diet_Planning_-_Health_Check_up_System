function Block({ className = '' }) {
  return (
    <div
      className={[
        'animate-pulse rounded-xl bg-[#eef2f0]',
        className,
      ].join(' ')}
    />
  )
}

export default function ProfileSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Block className="h-8 w-40" />
          <Block className="h-4 w-72" />
        </div>
        <Block className="hidden h-10 w-32 sm:block" />
      </div>

      <div className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-6">
        <div className="flex items-center gap-5">
          <Block className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Block className="h-6 w-48" />
            <Block className="h-4 w-32" />
            <Block className="h-4 w-56" />
          </div>
        </div>
      </div>

      <Block className="h-24 w-full rounded-[1.25rem]" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Block className="h-64 rounded-[1.25rem]" />
        <Block className="h-64 rounded-[1.25rem]" />
        <Block className="h-64 rounded-[1.25rem]" />
        <Block className="h-64 rounded-[1.25rem]" />
      </div>
    </div>
  )
}
