import { Lunar, LunarYear, Solar } from 'lunar-javascript'
import { daysFromToday, formatYmd, parseYmdParts } from './dates.js'

const MAX_LUNAR_SEARCH_YEARS = 100

function toInteger(value) {
  if (value === '' || value === null || value === undefined) return null
  const number = Number(value)
  return Number.isInteger(number) ? number : null
}

/**
 * Validates and converts a lunar calendar date without creating JavaScript Date
 * objects, so the calendar day cannot shift through UTC conversion.
 */
export function convertLunarToSolar({ year, month, day, isLeapMonth = false }) {
  const lunarYear = toInteger(year)
  const lunarMonth = toInteger(month)
  const lunarDay = toInteger(day)

  if (lunarYear === null || lunarMonth === null || lunarDay === null) {
    return { valid: false, error: '음력 연·월·일을 모두 입력해 주세요.' }
  }
  if (lunarYear < 1 || lunarMonth < 1 || lunarMonth > 12 || lunarDay < 1 || lunarDay > 30) {
    return { valid: false, error: '올바른 음력 날짜를 입력해 주세요.' }
  }

  try {
    if (isLeapMonth && LunarYear.fromYear(lunarYear).getLeapMonth() !== lunarMonth) {
      return { valid: false, error: `${lunarYear}년에는 윤${lunarMonth}월이 없어요.` }
    }

    const signedMonth = isLeapMonth ? -lunarMonth : lunarMonth
    const lunar = Lunar.fromYmd(lunarYear, signedMonth, lunarDay)

    // lunar-javascript may normalize some numeric input. Round-trip validation
    // makes sure only the exact requested lunar date can be saved.
    if (lunar.getYear() !== lunarYear || lunar.getMonth() !== signedMonth || lunar.getDay() !== lunarDay) {
      return { valid: false, error: '존재하지 않는 음력 날짜예요.' }
    }

    const solar = lunar.getSolar()
    const solarDate = solar.toYmd()
    return {
      valid: true,
      error: null,
      solarDate,
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      ym: solarDate,
    }
  } catch {
    return { valid: false, error: '존재하지 않는 음력 날짜예요.' }
  }
}

// 이전 호출부와 호환되는 간단한 변환 인터페이스입니다.
export function lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeapMonth = false) {
  const result = convertLunarToSolar({
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    isLeapMonth,
  })
  if (!result.valid) return null
  const { year, month, day, ym } = result
  return { year, month, day, ym }
}

export function solarToLunar(solarDate) {
  const parts = parseYmdParts(solarDate)
  if (!parts) return null

  try {
    const lunar = Solar.fromYmd(parts.year, parts.month, parts.day).getLunar()
    return {
      year: lunar.getYear(),
      month: Math.abs(lunar.getMonth()),
      day: lunar.getDay(),
      isLeapMonth: lunar.getMonth() < 0,
    }
  } catch {
    return null
  }
}

/** Returns the next valid occurrence of a recurring lunar month/day. */
export function getThisYearSolarForLunar(
  lunarMonth,
  lunarDay,
  isLeapMonth = false,
  now = new Date(),
) {
  const today = formatYmd(now)
  const currentLunar = solarToLunar(today)
  if (!currentLunar) return null

  for (let offset = 0; offset <= MAX_LUNAR_SEARCH_YEARS; offset += 1) {
    const candidate = convertLunarToSolar({
      year: currentLunar.year + offset,
      month: lunarMonth,
      day: lunarDay,
      isLeapMonth,
    })
    if (candidate.valid && candidate.solarDate >= today) return candidate
  }

  return null
}

export function getNextSolarYearlyOccurrence(dueDate, now = new Date()) {
  const original = parseYmdParts(dueDate)
  if (!original) return null

  const currentYear = parseYmdParts(formatYmd(now)).year
  for (let offset = 0; offset <= 8; offset += 1) {
    const year = currentYear + offset
    const candidate = `${year}-${String(original.month).padStart(2, '0')}-${String(original.day).padStart(2, '0')}`
    if (parseYmdParts(candidate) && candidate >= formatYmd(now)) return candidate
  }

  return null
}

export function getMemoryOccurrence(item, { now = new Date(), isPro = false } = {}) {
  let date = item?.dueDate ?? null
  let recalculated = false
  const calendarType = item?.isLunar ? 'lunar' : 'solar'

  if (item?.repeatType === 'yearly') {
    if (item.isLunar && isPro && item.lunarMonth && item.lunarDay) {
      const next = getThisYearSolarForLunar(
        item.lunarMonth,
        item.lunarDay,
        item.isLeapMonth,
        now,
      )
      if (next) {
        date = next.solarDate
        recalculated = date !== item.dueDate
      }
    } else if (!item.isLunar) {
      const next = getNextSolarYearlyOccurrence(item.dueDate, now)
      if (next) {
        date = next
        recalculated = date !== item.dueDate
      }
    }
  }

  return {
    date,
    dDay: date ? daysFromToday(date, now) : null,
    calendarType,
    recalculated,
  }
}

export function calcDDay(solarYmd, now = new Date()) {
  const date = typeof solarYmd === 'string'
    ? solarYmd
    : solarYmd?.ym ?? (solarYmd
      ? `${solarYmd.year}-${String(solarYmd.month).padStart(2, '0')}-${String(solarYmd.day).padStart(2, '0')}`
      : null)
  return date ? daysFromToday(date, now) : null
}
