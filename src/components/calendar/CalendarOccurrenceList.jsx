import { getCategoryColor, getCategoryLabel } from '../../constants/categories.js'
import { REPEAT_TYPES } from '../../models/item.js'
import { formatCurrency } from '../../utils/currency.js'
import { formatShortDate } from '../../utils/dates.js'
import { REPEAT_LABELS } from '../../utils/recurrence.js'
import StatePanel from '../feedback/StatePanel.jsx'

export default function CalendarOccurrenceList({ occurrences, onEdit }) {
  if (occurrences.length === 0) {
    return <StatePanel title="선택한 날짜에 등록된 일정이 없어요." />
  }

  const hasRecurring = occurrences.some(({ repeatType }) => repeatType !== REPEAT_TYPES.NONE)

  return (
    <div>
      {hasRecurring && (
        <p className="mb-3 rounded-xl bg-gray-100 px-3 py-2 text-xs leading-relaxed text-gray-500">
          반복 발생 일정을 수정하면 현재 MVP에서는 전체 반복 일정에 적용돼요.
        </p>
      )}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {occurrences.map((occurrence) => {
          const { item } = occurrence
          return (
            <button
              key={occurrence.occurrenceId}
              type="button"
              onClick={() => onEdit(item)}
              aria-label={`${item.title}${occurrence.repeatType !== REPEAT_TYPES.NONE ? ' 전체 반복 일정' : ''} 수정`}
              className={`flex min-h-16 w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left last:border-b-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-black ${item.completed ? 'opacity-50' : ''}`}
            >
              <span
                className="h-9 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: getCategoryColor(item.category) }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-sm font-semibold ${item.completed ? 'line-through' : ''}`}>{item.title}</span>
                <span className="mt-1 block text-xs text-gray-400">
                  {item.isLunar && item.lunarMonth && item.lunarDay
                    ? `음력 ${item.isLeapMonth ? '윤' : ''}${item.lunarMonth}월 ${item.lunarDay}일 · 양력 ${formatShortDate(occurrence.date)}`
                    : `${getCategoryLabel(item.category)} · ${formatShortDate(occurrence.date)}`}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                {item.amount !== null && <span className="text-sm font-semibold">{formatCurrency(item.amount)}</span>}
                {occurrence.repeatType !== REPEAT_TYPES.NONE && (
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-bold text-gray-500">
                    {REPEAT_LABELS[occurrence.repeatType]} · {occurrence.isGenerated ? '발생' : '원본'}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
