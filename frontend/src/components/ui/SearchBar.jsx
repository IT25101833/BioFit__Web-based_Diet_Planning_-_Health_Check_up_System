import { Search } from 'lucide-react'

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
  id = 'search',
  label = 'Search',
}) {
  return (
    <div className={['relative', className].join(' ')}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#8b93a1]"
        strokeWidth={2.1}
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="bf-input w-full pl-10"
      />
    </div>
  )
}
