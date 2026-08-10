import { CATEGORIES } from '../constants/categories.js'
import { DEFAULT_MEMORY_KIND, isMemoryKind } from '../constants/memoryKinds.js'
import { REPEAT_TYPES } from '../models/item.js'
import { formatYmd, parseYmdParts } from './dates.js'
import { getMemoryOccurrence, getThisYearSolarForLunar, solarToLunar } from './lunar.js'

const MAX_SOLAR_SEARCH_YEARS = 8
const LUNAR_MAX_DAY = 30
const SOLAR_MAX_DAYS = Object.freeze([31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31])

export const MEMORY_MONTH_OPTIONS = Object.freeze(
  Array.from({ length: 12 }, (_, index) => index + 1),
)

function toInteger(value) {
  if (value === '' || value === null || value === undefined) return null
  const number = Number(value)
  return Number.isInteger(number) ? number : null
}

function pad(value) {
  return String(value).padStart(2, '0')
}

/**
 * 월에 실제로 존재할 수 있는 일 수. 양력 2월은 윤년을 고려해 29일까지 허용합니다.
 *
 * @param {number} month
 * @param {boolean} [isLunar]
 * @returns {number}
 */
export function getMemoryDayCount(month, isLunar = false) {
  if (isLunar) return LUNAR_MAX_DAY
  const index = toInteger(month)
  if (index === null || index < 1 || index > 12) return 31
  return SOLAR_MAX_DAYS[index - 1]
}

/**
 * @param {number} month
 * @param {boolean} [isLunar]
 * @returns {number[]}
 */
export function getMemoryDayOptions(month, isLunar = false) {
  return Array.from({ length: getMemoryDayCount(month, isLunar) }, (_, index) => index + 1)
}

function getNextSolarOccurrence(month, day, now) {
  const today = formatYmd(now)
  const todayParts = parseYmdParts(today)
  if (!todayParts) return null

  for (let offset = 0; offset <= MAX_SOLAR_SEARCH_YEARS; offset += 1) {
    const candidate = `${todayParts.year + offset}-${pad(month)}-${pad(day)}`
    if (parseYmdParts(candidate) && candidate >= today) return candidate
  }

  return null
}

/**
 * 월·일만 고른 기억할 것을 다가오는 양력 날짜로 확정합니다. 연도를 묻지 않기 때문에
 * 오늘 이후에 처음 오는 날짜를 저장 기준으로 씁니다.
 *
 * @param {{ month: unknown, day: unknown, isLunar?: boolean, isLeapMonth?: boolean }} input
 * @param {Date} [now]
 * @returns {{ valid: boolean, error: string | null, dueDate?: string, lunar?: { year: number, month: number, day: number, isLeapMonth: boolean } | null }}
 */
export function resolveMemorySchedule({ month, day, isLunar = false, isLeapMonth = false }, now = new Date()) {
  const targetMonth = toInteger(month)
  const targetDay = toInteger(day)

  if (targetMonth === null || targetDay === null) {
    return { valid: false, error: '월과 일을 선택해 주세요.' }
  }
  if (targetMonth < 1 || targetMonth > 12 || targetDay < 1 || targetDay > getMemoryDayCount(targetMonth, isLunar)) {
    return { valid: false, error: '올바른 날짜를 선택해 주세요.' }
  }

  if (isLunar) {
    const occurrence = getThisYearSolarForLunar(targetMonth, targetDay, isLeapMonth, now)
    if (!occurrence) {
      return {
        valid: false,
        error: isLeapMonth ? '가까운 해에 해당 윤달이 없어요.' : '존재하지 않는 음력 날짜예요.',
      }
    }
    return {
      valid: true,
      error: null,
      dueDate: occurrence.solarDate,
      lunar: {
        year: solarToLunar(occurrence.solarDate)?.year ?? null,
        month: targetMonth,
        day: targetDay,
        isLeapMonth,
      },
    }
  }

  const dueDate = getNextSolarOccurrence(targetMonth, targetDay, now)
  if (!dueDate) return { valid: false, error: '존재하지 않는 날짜예요.' }
  return { valid: true, error: null, dueDate, lunar: null }
}

function normalizeMemoryRepeatType(repeatType, isLunar) {
  if (repeatType === REPEAT_TYPES.YEARLY) return REPEAT_TYPES.YEARLY
  if (repeatType === REPEAT_TYPES.MONTHLY) return isLunar ? REPEAT_TYPES.NONE : REPEAT_TYPES.MONTHLY
  return REPEAT_TYPES.NONE
}

/**
 * 기억할 것 시트 입력을 저장 가능한 아이템 값으로 변환합니다.
 * 제목이나 날짜가 유효하지 않으면 null을 반환합니다.
 *
 * @param {Object} input
 * @param {Date} [now]
 * @returns {Object | null}
 */
export function createMemoryItemValues({
  title,
  memoryKind = DEFAULT_MEMORY_KIND,
  month,
  day,
  isLunar = false,
  isLeapMonth = false,
  repeatType = REPEAT_TYPES.YEARLY,
  notificationOffsets = [0],
  memo = '',
}, now = new Date()) {
  const normalizedTitle = typeof title === 'string' ? title.trim() : ''
  if (!normalizedTitle) return null

  const schedule = resolveMemorySchedule({ month, day, isLunar, isLeapMonth }, now)
  if (!schedule.valid) return null

  return {
    category: CATEGORIES.MEMORY,
    memoryKind: isMemoryKind(memoryKind) ? memoryKind : DEFAULT_MEMORY_KIND,
    title: normalizedTitle,
    amount: null,
    dueDate: schedule.dueDate,
    dueTime: null,
    isLunar,
    lunarYear: schedule.lunar?.year ?? null,
    lunarMonth: schedule.lunar?.month ?? null,
    lunarDay: schedule.lunar?.day ?? null,
    isLeapMonth: isLunar && isLeapMonth,
    // 음력은 아직 매년 반복만 계산할 수 있어 매월 선택은 반복 없음으로 되돌립니다.
    repeatType: normalizeMemoryRepeatType(repeatType, isLunar),
    notificationOffsets: Array.isArray(notificationOffsets)
      ? [...new Set(notificationOffsets.filter((offset) => Number.isInteger(offset) && offset >= 0))]
      : [],
    memo: typeof memo === 'string' ? memo.trim() : '',
  }
}

/**
 * 이번 달(Asia/Seoul 기준)에 돌아오는 기억할 것만 골라 날짜순으로 돌려줍니다.
 * 홈 화면은 이번 달 것만 보여주기 때문에 다음 달 이후 일정은 빠집니다.
 *
 * @param {import('../models/item.js').MirikkokItem[]} items
 * @param {{ now?: Date, isPro?: boolean }} [options]
 * @returns {{ item: import('../models/item.js').MirikkokItem, occurrence: Object }[]}
 */
export function getMonthlyMemoryOccurrences(items, { now = new Date(), isPro = false } = {}) {
  if (!Array.isArray(items)) return []

  const monthPrefix = formatYmd(now).slice(0, 7)
  return items
    .map((item) => ({ item, occurrence: getMemoryOccurrence(item, { now, isPro }) }))
    .filter(({ occurrence }) => (
      typeof occurrence.date === 'string' && occurrence.date.slice(0, 7) === monthPrefix
    ))
    .sort((a, b) => a.occurrence.date.localeCompare(b.occurrence.date))
}

/**
 * @param {Date} [now]
 * @returns {number} Asia/Seoul 기준 이번 달
 */
export function getCurrentMonth(now = new Date()) {
  return parseYmdParts(formatYmd(now))?.month ?? now.getMonth() + 1
}

/**
 * 저장된 기억할 것을 시트 폼 상태로 되돌립니다.
 *
 * @param {import('../models/item.js').MirikkokItem | null} item
 * @param {Date} [now]
 */
export function toMemoryFormValues(item, now = new Date()) {
  const todayParts = parseYmdParts(formatYmd(now))
  const fallback = {
    title: '',
    memoryKind: DEFAULT_MEMORY_KIND,
    month: todayParts?.month ?? 1,
    day: todayParts?.day ?? 1,
    isLunar: false,
    isLeapMonth: false,
    memo: '',
  }
  if (!item) return fallback

  const dueParts = parseYmdParts(item.dueDate)
  return {
    title: item.title ?? '',
    memoryKind: isMemoryKind(item.memoryKind) ? item.memoryKind : DEFAULT_MEMORY_KIND,
    month: item.isLunar ? (item.lunarMonth ?? fallback.month) : (dueParts?.month ?? fallback.month),
    day: item.isLunar ? (item.lunarDay ?? fallback.day) : (dueParts?.day ?? fallback.day),
    isLunar: item.isLunar === true,
    isLeapMonth: item.isLeapMonth === true,
    memo: item.memo ?? '',
  }
}
