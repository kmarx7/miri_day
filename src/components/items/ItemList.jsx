import { formatCurrency } from '../../utils/currency.js'
import { formatShortDate } from '../../utils/dates.js'

function ItemRow({ item }) {
  return (
    <article className={`flex min-h-16 items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0 ${item.completed ? 'opacity-50' : ''}`}>
      <span className="h-8 w-1 shrink-0 rounded-full bg-gray-300" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <h3 className={`truncate text-sm font-semibold ${item.completed ? 'line-through' : ''}`}>{item.title}</h3>
        <p className="mt-1 text-xs text-gray-400">
          {item.isLunar ? `음력 ${item.lunarMonth}.${item.lunarDay}` : formatShortDate(item.dueDate)}
        </p>
      </div>
      {item.amount !== null && <span className="shrink-0 text-sm font-semibold">{formatCurrency(item.amount)}</span>}
    </article>
  )
}

export default function ItemList({ items, emptyMessage }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {items.map((item) => <ItemRow key={item.id} item={item} />)}
    </div>
  )
}
