import { formatDDay, formatShortDate } from '../../utils/dates.js'

export default function MemoryBanner({ items, expanded, onToggle, onOpen }) {
  const upcoming = [...items]
    .filter((item) => item.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5)
  const visibleItems = expanded ? upcoming : upcoming.slice(0, 1)

  return (
    <section className="rounded-2xl border border-[#F3E5A6] bg-[#FFFEF5] p-4" aria-labelledby="memory-heading">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#8A6517]">다가오는 기억할 것</p>
          <h2 id="memory-heading" className="mt-1 text-base font-bold">
            {upcoming.length > 0 ? `${upcoming.length}개의 소중한 일정` : '아직 등록된 일정이 없어요'}
          </h2>
        </div>
        {upcoming.length > 1 && (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={expanded ? '기억할 것 접기' : '기억할 것 펼치기'}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#F3E5A6] bg-white text-xl text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
          >
            <span className={`transition-transform ${expanded ? 'rotate-90' : ''}`} aria-hidden="true">›</span>
          </button>
        )}
      </div>

      {visibleItems.length > 0 && (
        <div className="mt-3 divide-y divide-[#F3E5A6] border-t border-[#F3E5A6]">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpen(item)}
              className="flex w-full items-center justify-between gap-3 rounded-xl px-1 py-3 text-left hover:bg-[#FFF9D9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{item.title}</span>
                <span className="mt-0.5 block text-xs text-[#8A6517]">
                  {item.isLunar ? `음력 ${item.lunarMonth}.${item.lunarDay}` : formatShortDate(item.dueDate)}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-black px-2.5 py-1 text-xs font-bold text-white">
                {formatDDay(item.dueDate)}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
