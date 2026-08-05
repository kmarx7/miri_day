import { formatDDay } from '../../utils/dates.js'
import { getMemoryOccurrence } from '../../utils/lunar.js'

function LunarDate({ item, parenthesized = false }) {
  if (!item.isLunar || !item.lunarMonth || !item.lunarDay) return null

  const label = `음력 ${item.lunarMonth}.${item.lunarDay}`
  return (
    <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-gray-400">
      {parenthesized ? `(${label})` : label}
    </span>
  )
}

export default function MemoryBanner({ items, expanded, onToggle, onOpen, isPro = false }) {
  const upcoming = [...items]
    .map((item) => ({ item, occurrence: getMemoryOccurrence(item, { isPro }) }))
    .filter(({ occurrence }) => occurrence.date)
    .sort((a, b) => a.occurrence.date.localeCompare(b.occurrence.date))
    .slice(0, 5)
  const featured = upcoming[0] ?? null
  const additionalItems = expanded ? upcoming.slice(1) : []

  return (
    <section className="rounded-2xl border border-[#F3E5A6] bg-[#FFFEF5] p-4" aria-labelledby="memory-heading">
      <h2 id="memory-heading" className="flex items-center gap-2 text-sm font-bold text-[#965D08]">
        <span className="h-2 w-2 shrink-0 rounded-full bg-[#F2C100]" aria-hidden="true" />
        <span>다가오는 기억할 것 {upcoming.length}건</span>
      </h2>

      {featured ? (
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onOpen(featured.item)}
            className="flex min-w-0 flex-1 items-baseline gap-2 rounded-xl py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
          >
            <span className="shrink-0 text-lg" aria-hidden="true">⭐</span>
            <span className="shrink-0 text-base font-extrabold">{formatDDay(featured.occurrence.date)}</span>
            <span className="min-w-0 truncate text-base font-bold">{featured.item.title}</span>
            <LunarDate item={featured.item} parenthesized />
          </button>

          {upcoming.length > 1 && (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={expanded}
              aria-label={expanded ? '기억할 것 접기' : '기억할 것 펼치기'}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#1265CC] bg-white text-xl text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              <span className={`transition-transform ${expanded ? 'rotate-90' : ''}`} aria-hidden="true">›</span>
            </button>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-500">아직 등록된 일정이 없어요.</p>
      )}

      {additionalItems.length > 0 && (
        <div className="mt-3 space-y-1 border-t border-[#F3E5A6] pt-3">
          {additionalItems.map(({ item, occurrence }) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpen(item)}
              className="flex min-h-14 w-full items-center gap-3 rounded-xl px-1 py-2 text-left hover:bg-[#FFF9D9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
            >
              <span className="shrink-0 rounded-full bg-black px-2.5 py-1 text-xs font-bold text-white">
                {formatDDay(occurrence.date)}
              </span>
              <span className="flex min-w-0 flex-1 items-baseline gap-2">
                <span className="min-w-0 truncate text-sm font-semibold">{item.title}</span>
                <LunarDate item={item} />
              </span>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gray-200 bg-white text-lg text-gray-600" aria-hidden="true">
                ›
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
