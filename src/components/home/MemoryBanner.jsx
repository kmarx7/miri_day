import { formatDDay } from '../../utils/dates.js'
import { getMemoryOccurrence } from '../../utils/lunar.js'

function LunarDate({ item }) {
  if (!item.isLunar || !item.lunarMonth || !item.lunarDay) return null
  return <span className="shrink-0 text-xs font-semibold text-gray-400">음력 {item.lunarMonth}.{item.lunarDay}</span>
}

export default function MemoryBanner({ items, expanded, onToggle, onOpen, isPro = false }) {
  const upcoming = [...items]
    .map((item) => ({ item, occurrence: getMemoryOccurrence(item, { isPro }) }))
    .filter(({ occurrence }) => occurrence.date)
    .sort((a, b) => a.occurrence.date.localeCompare(b.occurrence.date))
    .slice(0, 5)

  return (
    <section className="overflow-hidden rounded-[1.25rem] border border-[#F1D66F] bg-[#FFFDF4] px-4" aria-labelledby="memory-heading">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls="memory-items"
        className="memory-summary-button flex w-full items-center gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        <span id="memory-heading" className="flex min-w-0 flex-1 items-center gap-2 text-sm font-extrabold text-[#965D08]">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#F2C100]" aria-hidden="true" />
          <span>기억할 것 {upcoming.length}</span>
        </span>
        {upcoming.length > 0 && <span className="shrink-0 text-xs font-extrabold text-[#2F6FDB]">{expanded ? '접기' : '더보기'}</span>}
      </button>

      {expanded && upcoming.length > 0 && (
        <div id="memory-items" className="border-t border-[#F3DFA0] py-2">
          {upcoming.map(({ item, occurrence }) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpen(item)}
              className="flex min-h-14 w-full items-center gap-3 rounded-xl px-1 py-2 text-left hover:bg-[#FFF9D9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
            >
              <span className="shrink-0 rounded-full bg-black px-2.5 py-1 text-xs font-bold text-white">{formatDDay(occurrence.date)}</span>
              <span className="flex min-w-0 flex-1 items-baseline gap-2">
                <span className="min-w-0 truncate text-sm font-semibold">{item.title}</span>
                <LunarDate item={item} />
              </span>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gray-200 bg-white text-lg text-gray-600" aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
