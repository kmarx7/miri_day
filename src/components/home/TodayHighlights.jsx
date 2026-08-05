import { getCategoryLabel } from '../../constants/categories.js'
import { formatCurrency } from '../../utils/currency.js'
import StatePanel from '../feedback/StatePanel.jsx'

export default function TodayHighlights({ items, expanded, onToggle, onEdit }) {
  const visibleItems = expanded ? items : items.slice(0, 2)
  const amountTotal = items.reduce((sum, item) => sum + (item.amount ?? 0), 0)

  return (
    <section aria-labelledby="highlight-heading">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2 px-1">
        <div>
          <p className="text-xs font-medium text-gray-400">오늘 놓치지 않게</p>
          <h2 id="highlight-heading" className="mt-0.5 text-base font-bold">오늘의 하이라이트 {items.length}건</h2>
        </div>
        {amountTotal > 0 && <span className="text-sm font-semibold">{formatCurrency(amountTotal)}</span>}
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
