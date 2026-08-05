import { useMemo, useState } from 'react'
import CalendarOccurrenceList from '../components/calendar/CalendarOccurrenceList.jsx'
import ScreenHeader from '../components/layout/ScreenHeader.jsx'
import { formatMonthTitle, formatShortDate, formatYmd, getMonthDays, parseYmdParts } from '../utils/dates.js'
import { getCalendarMonthRange, getOccurrencesForRange } from '../utils/recurrence.js'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function CalendarScreen({ items, isSample, isPro, onEditItem }) {
  const today = formatYmd(new Date())
  const todayParts = parseYmdParts(today)
  const [displayMonth, setDisplayMonth] = useState(() => new Date(todayParts.year, todayParts.month - 1, 1))
  const [selectedDate, setSelectedDate] = useState(today)
  const monthDays = useMemo(() => getMonthDays(displayMonth), [displayMonth])
  const monthRange = useMemo(() => getCalendarMonthRange(displayMonth), [displayMonth])
  const occurrences = useMemo(() => getOccurrencesForRange(items, monthRange.start, monthRange.end, {
    includeRecurring: isPro && !isSample,
  }), [isPro, isSample, items, monthRange.end, monthRange.start])
  const occurrencesByDate = useMemo(() => {
    const grouped = new Map()
    occurrences.forEach((occurrence) => {
      const entries = grouped.get(occurrence.date) ?? []
      entries.push(occurrence)
      grouped.set(occurrence.date, entries)
    })
    return grouped
  }, [occurrences])
  const selectedOccurrences = occurrencesByDate.get(selectedDate) ?? []

  const changeMonth = (amount) => {
    const nextMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + amount, 1)
    setDisplayMonth(nextMonth)
    setSelectedDate(getCalendarMonthRange(nextMonth).start)
  }

  return (
    <div className="pt-5">
      <ScreenHeader
        eyebrow={isSample ? '샘플 미리보기' : '일정 모아보기'}
        title="캘린더"
        description="날짜를 선택해 양력과 음력 일정을 함께 확인해요."
      />

      <section className="rounded-2xl border border-gray-200 bg-white p-4" aria-label={formatMonthTitle(displayMonth)}>
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => changeMonth(-1)} aria-label="이전 달" className="grid h-11 w-11 place-items-center rounded-full bg-gray-100 text-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-black">‹</button>
          <h2 className="text-base font-bold" aria-live="polite">{formatMonthTitle(displayMonth)}</h2>
          <button type="button" onClick={() => changeMonth(1)} aria-label="다음 달" className="grid h-11 w-11 place-items-center rounded-full bg-gray-100 text-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-black">›</button>
        </div>

        <div className="mt-5 grid grid-cols-7 text-center text-xs font-semibold text-gray-400" aria-hidden="true">
          {WEEKDAYS.map((day) => <span key={day} className="py-2">{day}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {monthDays.map((date, index) => {
            if (!date) return <span key={`blank-${index}`} className="min-h-12" aria-hidden="true" />
            const dateKey = formatYmd(date)
            const isToday = dateKey === today
            const isSelected = dateKey === selectedDate
            const itemCount = occurrencesByDate.get(dateKey)?.length ?? 0
            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => setSelectedDate(dateKey)}
                aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일${isToday ? ', 오늘' : ''}${itemCount ? `, 일정 ${itemCount}개` : ''}`}
                aria-pressed={isSelected}
                className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
              >
                <span className={`grid h-8 w-8 place-items-center rounded-full text-sm ${
                  isSelected
                    ? 'bg-black font-bold text-white'
                    : isToday
                      ? 'border-2 border-black font-bold text-black'
                      : 'text-gray-700'
                }`}>
                  {date.getDate()}
                </span>
                <span className={`h-1.5 w-1.5 rounded-full ${itemCount ? 'bg-[#F0A65B]' : 'bg-transparent'}`} aria-hidden="true" />
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-7" aria-labelledby="selected-calendar-heading">
        <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
          <h2 id="selected-calendar-heading" className="text-base font-bold">
            {selectedDate === today ? '오늘' : formatShortDate(selectedDate)} 일정
          </h2>
          <span className="text-sm font-semibold text-gray-400">{selectedOccurrences.length}건</span>
        </div>
        <CalendarOccurrenceList occurrences={selectedOccurrences} onEdit={onEditItem} />
      </section>
    </div>
  )
}
