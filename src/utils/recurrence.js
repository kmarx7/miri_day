import { REPEAT_TYPES } from '../models/item.js'
import { parseYmdParts } from './dates.js'
import { convertLunarToSolar } from './lunar.js'

export const RECURRENCE_EDIT_SCOPES = Object.freeze({
  SINGLE: 'single',
  FUTURE: 'future',
  ALL: 'all',
})

// MVP에서는 원본 하나를 수정해 전체 반복 일정에 반영하는 방식만 지원합니다.
export const SUPPORTED_RECURRENCE_EDIT_SCOPES = Object.freeze([
  RECURRENCE_EDIT_SCOPES.ALL,
])

export const REPEAT_LABELS = Object.freeze({
  [REPEAT_TYPES.NONE]: '반복 없음',
  [REPEAT_TYPES.MONTHLY]: '매월',
  [REPEAT_TYPES.YEARLY]: '매년',
})

function formatParts(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function lastDayOfMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function clampCalendarDate(year, month, preferredDay) {
  return formatParts(year, month, Math.min(preferredDay, lastDayOfMonth(year, month)))
}

function createOccurrence(item, date) {
  return {
    occurrenceId: `${item.id}:${date}`,
    sourceItemId: item.id,
    date,
    isGenerated: item.repeatType !== REPEAT_TYPES.NONE && date !== item.dueDate,
    repeatType: item.repeatType,
    item,
  }
}

function getSolarMonthlyDates(item, rangeStart, rangeEnd) {
  const source = parseYmdParts(item.dueDate)
  const start = parseYmdParts(rangeStart)
  const end = parseYmdParts(rangeEnd)
  if (!source || !start || !end) return []

  const startIndex = start.year * 12 + start.month - 1
  const endIndex = end.year * 12 + end.month - 1
  const dates = []

  for (let index = startIndex; index <= endIndex; index += 1) {
    const year = Math.floor(index / 12)
    const month = (index % 12) + 1
    const date = clampCalendarDate(year, month, source.day)
    if (date >= item.dueDate && date >= rangeStart && date <= rangeEnd) dates.push(date)
  }

  return dates
}

function getSolarYearlyDates(item, rangeStart, rangeEnd) {
  const source = parseYmdParts(item.dueDate)
  const start = parseYmdParts(rangeStart)
  const end = parseYmdParts(rangeEnd)
  if (!source || !start || !end) return []

  const dates = []
  for (let year = start.year; year <= end.year; year += 1) {
    const date = clampCalendarDate(year, source.month, source.day)
    if (date >= item.dueDate && date >= rangeStart && date <= rangeEnd) dates.push(date)
  }
  return dates
}

function getLunarYearlyDates(item, rangeStart, rangeEnd) {
  const start = parseYmdParts(rangeStart)
  const end = parseYmdParts(rangeEnd)
  if (!start || !end || !item.lunarMonth || !item.lunarDay) return []

  const dates = new Set()
  // 음력 연말은 다음 양력 연도로 넘어갈 수 있어 양력 범위 양쪽 1년을 확인합니다.
  for (let lunarYear = start.year - 1; lunarYear <= end.year + 1; lunarYear += 1) {
    const result = convertLunarToSolar({
      year: lunarYear,
      month: item.lunarMonth,
      day: item.lunarDay,
      isLeapMonth: item.isLeapMonth,
    })
    if (result.valid && result.solarDate >= item.dueDate && result.solarDate >= rangeStart && result.solarDate <= rangeEnd) {
      dates.add(result.solarDate)
    }
  }
  return [...dates].sort()
}

/**
 * Projects only the occurrences needed for the requested inclusive date range.
 * No projected occurrence is persisted to localStorage.
 */
export function getOccurrencesForRange(items, rangeStart, rangeEnd, { includeRecurring = false } = {}) {
  if (!parseYmdParts(rangeStart) || !parseYmdParts(rangeEnd) || rangeStart > rangeEnd) return []

  const occurrences = []
  for (const item of items) {
    if (!item?.dueDate || !parseYmdParts(item.dueDate)) continue

    let dates = item.dueDate >= rangeStart && item.dueDate <= rangeEnd ? [item.dueDate] : []
    if (includeRecurring && item.repeatType === REPEAT_TYPES.MONTHLY && !item.isLunar) {
      dates = getSolarMonthlyDates(item, rangeStart, rangeEnd)
    } else if (includeRecurring && item.repeatType === REPEAT_TYPES.YEARLY) {
      dates = item.isLunar
        ? getLunarYearlyDates(item, rangeStart, rangeEnd)
        : getSolarYearlyDates(item, rangeStart, rangeEnd)
    }

    dates.forEach((date) => occurrences.push(createOccurrence(item, date)))
  }

  return occurrences.sort((a, b) => (
    a.date.localeCompare(b.date)
    || (a.item.createdAt ?? '').localeCompare(b.item.createdAt ?? '')
  ))
}

export function getCalendarMonthRange(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return {
    start: formatParts(year, month, 1),
    end: formatParts(year, month, lastDayOfMonth(year, month)),
  }
}
