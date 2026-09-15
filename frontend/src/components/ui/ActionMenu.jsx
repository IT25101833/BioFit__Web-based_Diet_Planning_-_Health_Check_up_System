import { useEffect, useId, useRef, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'

export default function ActionMenu({ items = [], label = 'Actions' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return undefined
    function onPointer(event) {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    function onKey(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={label}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8ecf1] bg-white text-[#4b5563] transition-colors hover:bg-[#f4f6fb]"
      >
        <MoreHorizontal className="h-4 w-4" strokeWidth={2.1} />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-20 mt-1.5 min-w-[180px] rounded-2xl border border-[#e8ecf1] bg-white p-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false)
                item.onClick?.()
              }}
              className={[
                'flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors',
                item.tone === 'danger'
                  ? 'text-[#b45309] hover:bg-[#fff7ed]'
                  : 'text-[#374151] hover:bg-[#f4f6fb]',
                item.disabled ? 'pointer-events-none opacity-50' : '',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
