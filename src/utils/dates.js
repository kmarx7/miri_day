const DAY_MS = 24 * 60 * 60 * 1000

export function formatYmd(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseLocalDate(value) {
  if (typeof value !== 'string') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

export function addDays(date, amount) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export const DATE_PRESETS = Object.freeze({
  TODAY: 'today',
  TOMORROW: 'tomorrow',
  THIS_WEEK: 'thisWeek',
  CUSTOM: 'custom',
})

export function getDatePresetValue(preset, now = new Date()) {
  if (preset === DATE_PRESETS.TODAY) return formatYmd(now)
  if (preset === DATE_PRESETS.TOMORROW) return formatYmd(addDays(now, 1))
  if (preset === DATE_PRESETS.THIS_WEEK) return formatYmd(addDays(now, 6 - now.getDay()))
  return null
}

export function inferDatePreset(value, now = new Date()) {
  const presets = [DATE_PRESETS.TODAY, DATE_PRESETS.TOMORROW, DATE_PRESETS.THIS_WEEK]
  return presets.find((preset) => getDatePresetValue(preset, now) === value) ?? DATE_PRESETS.CUSTOM
}

export function daysFromToday(value, now = new Date()) {
  const target = parseLocalDate(value)
  if (!target) return null

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target.getTime() - today.getTime()) / DAY_MS)
}

export function formatDDay(value, now = new Date()) {
  const difference = daysFromToday(value, now)
  if (difference === null) return ''
  if (difference === 0) return 'D-Day'
  return difference > 0 ? `D-${difference}` : `D+${Math.abs(difference)}`
}

export function formatKoreanToday(date = new Date()) {
  return new Intl.DateTimeFormat('ko-KR', {
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
  const date = parseLocalDate(value)
  if (!date) return '날짜 없음'
  return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' }).format(date)
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
