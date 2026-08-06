const DAY_MS = 24 * 60 * 60 * 1000
export const SEOUL_TIME_ZONE = 'Asia/Seoul'

const seoulDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: SEOUL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const seoulDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: SEOUL_TIME_ZONE,
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

export function parseYmdParts(value) {
  if (typeof value !== 'string') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null

  const check = new Date(Date.UTC(year, month - 1, day))
  if (check.getUTCFullYear() !== year || check.getUTCMonth() + 1 !== month || check.getUTCDate() !== day) return null
  return { year, month, day }
}

export function formatYmd(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''
  const parts = Object.fromEntries(
    seoulDateFormatter.formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function parseLocalDate(value) {
  const parts = parseYmdParts(value)
  return parts ? new Date(parts.year, parts.month - 1, parts.day) : null
}

export function addDays(date, amount) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function addDaysToYmd(value, amount) {
  const parts = parseYmdParts(value)
  if (!parts || !Number.isInteger(amount)) return null

  const next = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + amount))
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}-${String(next.getUTCDate()).padStart(2, '0')}`
}

export const DATE_PRESETS = Object.freeze({
  TODAY: 'today',
  TOMORROW: 'tomorrow',
  THIS_WEEK: 'thisWeek',
  CUSTOM: 'custom',
})

export function getDatePresetValue(preset, now = new Date()) {
  const today = formatYmd(now)
  const todayParts = parseYmdParts(today)
  if (!todayParts) return null

  if (preset === DATE_PRESETS.TODAY) return today
  if (preset === DATE_PRESETS.TOMORROW) return addDaysToYmd(today, 1)
  if (preset === DATE_PRESETS.THIS_WEEK) {
    const weekday = new Date(Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day)).getUTCDay()
    return addDaysToYmd(today, 6 - weekday)
  }
  return null
}

export function inferDatePreset(value, now = new Date()) {
  const presets = [DATE_PRESETS.TODAY, DATE_PRESETS.TOMORROW, DATE_PRESETS.THIS_WEEK]
  return presets.find((preset) => getDatePresetValue(preset, now) === value) ?? DATE_PRESETS.CUSTOM
}

export function daysFromToday(value, now = new Date()) {
  const target = parseYmdParts(value)
  const today = parseYmdParts(formatYmd(now))
  if (!target || !today) return null

  const targetDay = Date.UTC(target.year, target.month - 1, target.day)
  const todayDay = Date.UTC(today.year, today.month - 1, today.day)
  return Math.round((targetDay - todayDay) / DAY_MS)
}

export function formatDDay(value, now = new Date()) {
  const difference = daysFromToday(value, now)
  if (difference === null) return ''
  if (difference === 0) return 'D-Day'
  return difference > 0 ? `D-${difference}` : `D+${Math.abs(difference)}`
}

export function formatKoreanToday(date = new Date()) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: SEOUL_TIME_ZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date)
}

export function formatMonthTitle(date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
  }).format(date)
}

export function formatShortDate(value) {
  const parts = parseYmdParts(value)
  if (!parts) return '날짜 없음'
  return `${parts.month}월 ${parts.day}일`
}

export function formatKoreanYmd(value) {
  const parts = parseYmdParts(value)
  if (!parts) return ''
  return `${parts.year}년 ${parts.month}월 ${parts.day}일`
}

export function formatCompactTime(value) {
  if (typeof value !== 'string') return ''
  const match = /^(?:([01]\d|2[0-3])):([0-5]\d)$/.exec(value)
  if (!match) return ''
  const hour = Number(match[1])
  const period = hour < 12 ? 'am' : 'pm'
  return `(${period}:${hour % 12 || 12}:${match[2]})`
}

export function formatCompactDueDate(value, time = null) {
  const parts = parseYmdParts(value)
  if (!parts) return ''
  const timeLabel = formatCompactTime(time)
  return `${parts.month}.${parts.day}${timeLabel ? ` ${timeLabel}` : ''}`
}

export function formatCompactCreatedAt(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const parts = Object.fromEntries(
    seoulDateTimeFormatter.formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )
  const period = parts.dayPeriod?.toLowerCase()
  if (!parts.month || !parts.day || !parts.hour || !parts.minute || !period) return ''
  return `${parts.month}.${parts.day} (${period}:${parts.hour}:${parts.minute})`
}

export function getMonthDays(date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  const cells = Array(firstDay).fill(null)

  for (let day = 1; day <= lastDate; day += 1) {
    cells.push(new Date(year, month, day))
  }

  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}
