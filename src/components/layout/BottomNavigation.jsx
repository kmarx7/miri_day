function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  )
}

function ProIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
    </svg>
  )
}

const NAV_ITEMS = [
  { id: 'home', label: '홈', icon: HomeIcon },
  { id: 'calendar', label: '캘린더', icon: CalendarIcon },
  { id: 'pro', label: 'PRO', icon: ProIcon },
]

export default function BottomNavigation({ activeTab, onChange }) {
  return (
    <nav className="bottom-navigation" aria-label="주요 화면">
      <div className="grid grid-cols-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
                active ? 'text-black' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Icon />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
