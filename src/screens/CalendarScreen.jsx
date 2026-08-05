import { useMemo, useState } from 'react'
import ScreenHeader from '../components/layout/ScreenHeader.jsx'
import ItemList from '../components/items/ItemList.jsx'
import { formatMonthTitle, formatYmd, getMonthDays } from '../utils/dates.js'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function CalendarScreen({ items, isSample, onEditItem }) {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date())
  const today = formatYmd(new Date())
  const monthDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth])
  const itemDates = useMemo(() => new Set(items.map((item) => item.dueDate).filter(Boolean)), [items])
  const todayItems = items.filter((item) => item.dueDate === today)

  const changeMonth = (amount) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1))
  }

  return (
    <div className="pt-5">
      <ScreenHeader
        eyebrow={isSample ? '샘플 미리보기' : '일정 모아보기'}
        title="캘린더"
        description="날짜별로 등록한 일정을 확인해요."
      />

      <section className="rounded-2xl border border-gray-200 bg-white p-4" aria-label={formatMonthTitle(visibleMonth)}>
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => changeMonth(-1)} aria-label="이전 달" className="grid h-11 w-11 place-items-center rounded-full bg-gray-100 text-xl">‹</button>
          <h2 className="text-base font-bold">{formatMonthTitle(visibleMonth)}</h2>
          <button type="button" onClick={() => changeMonth(1)} aria-label="다음 달" className="grid h-11 w-11 place-items-center rounded-full bg-gray-100 text-xl">›</button>
        </div>

        <div className="mt-5 grid grid-cols-7 text-center text-xs font-semibold text-gray-400">
          {WEEKDAYS.map((day) => <span key={day} className="py-2">{day}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {monthDays.map((date, index) => {
            if (!date) return <span key={`blank-${index}`} className="min-h-11" aria-hidden="true" />
            const dateKey = formatYmd(date)
            const isToday = dateKey === today
            const hasItems = itemDates.has(dateKey)
            return (
              <div key={dateKey} className="flex min-h-11 flex-col items-center justify-center gap-1">
                <span className={`grid h-8 w-8 place-items-center rounded-full text-sm ${isToday ? 'bg-black font-bold text-white' : 'text-gray-700'}`}>
                  {date.getDate()}
                </span>
                <span className={`h-1 w-1 rounded-full ${hasItems ? 'bg-[#F0A65B]' : 'bg-transparent'}`} aria-hidden="true" />
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-7" aria-labelledby="today-calendar-heading">
        <h2 id="today-calendar-heading" className="mb-3 px-1 text-base font-bold">오늘 일정 {todayItems.length}건</h2>
        <ItemList items={todayItems} emptyMessage="오늘 등록된 일정이 없어요." onEdit={onEditItem} />
      </section>
    </div>
  )
}
