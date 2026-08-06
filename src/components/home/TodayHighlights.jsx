import { getCategoryLabel } from '../../constants/categories.js'
import { formatCurrency } from '../../utils/currency.js'
import StatePanel from '../feedback/StatePanel.jsx'

export default function TodayHighlights({ items, expanded, onToggle, onEdit }) {
  const visibleItems = expanded ? items : items.slice(0, 2)

  return (
    <section aria-labelledby="highlight-heading">
      <div className="mb-3 px-1">
        <h2 id="highlight-heading" className="text-base font-bold">오늘 놓치지 않게 {items.length}</h2>
      </div>

      {visibleItems.length === 0 ? (
        <StatePanel title="오늘 예정된 일정이 없어요." compact />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="divide-y divide-gray-100">
            {visibleItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onEdit(item)}
                aria-label={`${item.title} 수정`}
                className="flex min-h-16 w-full items-center justify-between gap-4 px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-black"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs text-gray-400">{getCategoryLabel(item.category)}</p>
                </div>
                {item.amount !== null && (
                  <span className="shrink-0 text-sm font-semibold">{formatCurrency(item.amount)}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {items.length > 2 && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="mt-2 min-h-11 w-full rounded-xl text-sm font-semibold text-gray-500 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
        >
          {expanded ? '접기 ▲' : `외 ${items.length - 2}건 더보기 ▼`}
        </button>
      )}
    </section>
  )
}
