import assert from 'node:assert/strict'
import test from 'node:test'
import { DATE_PRESETS, daysFromToday, formatYmd, getDatePresetValue } from '../src/utils/dates.js'
import {
  convertLunarToSolar,
  getMemoryOccurrence,
  getThisYearSolarForLunar,
} from '../src/utils/lunar.js'

test('일반 음력 날짜를 양력으로 변환한다', () => {
  const result = convertLunarToSolar({ year: 2026, month: 6, day: 15 })

  assert.equal(result.valid, true)
  assert.equal(result.solarDate, '2026-07-28')
})

test('음력 연말 날짜가 다음 양력 연도로 넘어가는 경계를 보존한다', () => {
  const result = convertLunarToSolar({ year: 2026, month: 11, day: 24 })

  assert.equal(result.valid, true)
  assert.equal(result.solarDate, '2027-01-01')
})

test('올해 이미 지난 음력 기념일은 다음 음력 연도로 계산한다', () => {
  const now = new Date('2026-08-05T09:00:00+09:00')
  const result = getThisYearSolarForLunar(6, 15, false, now)

  assert.equal(result.solarDate, '2027-07-18')
})

test('윤달 날짜를 일반 달과 구분해 변환한다', () => {
  const regular = convertLunarToSolar({ year: 2025, month: 6, day: 15 })
  const leap = convertLunarToSolar({ year: 2025, month: 6, day: 15, isLeapMonth: true })

  assert.equal(regular.solarDate, '2025-07-09')
  assert.equal(leap.solarDate, '2025-08-08')
})

test('존재하지 않는 음력 날짜와 존재하지 않는 윤달을 거부한다', () => {
  const invalidDay = convertLunarToSolar({ year: 2026, month: 2, day: 30 })
  const invalidLeap = convertLunarToSolar({ year: 2026, month: 6, day: 15, isLeapMonth: true })

  assert.equal(invalidDay.valid, false)
  assert.match(invalidDay.error, /존재하지 않는/)
  assert.equal(invalidLeap.valid, false)
  assert.match(invalidLeap.error, /윤6월이 없어요/)
})

test('1월 1일에는 해당 연도의 다음 음력 기념일을 계산한다', () => {
  const now = new Date('2026-01-01T00:00:00+09:00')
  const result = getThisYearSolarForLunar(6, 15, false, now)

  assert.equal(result.solarDate, '2026-07-28')
})

test('Asia/Seoul 자정 경계에서 날짜와 D-Day가 하루 밀리지 않는다', () => {
  const seoulAfterMidnight = new Date('2026-08-04T15:30:00.000Z')

  assert.equal(formatYmd(seoulAfterMidnight), '2026-08-05')
  assert.equal(daysFromToday('2026-08-05', seoulAfterMidnight), 0)
  assert.equal(daysFromToday('2026-08-06', seoulAfterMidnight), 1)
  assert.equal(getDatePresetValue(DATE_PRESETS.TOMORROW, seoulAfterMidnight), '2026-08-06')
  assert.equal(getDatePresetValue(DATE_PRESETS.THIS_WEEK, seoulAfterMidnight), '2026-08-08')
})

test('양력 반복 기념일은 지난 경우 다음 해 날짜를 사용한다', () => {
  const occurrence = getMemoryOccurrence({
    dueDate: '2020-08-01',
    isLunar: false,
    repeatType: 'yearly',
  }, { now: new Date('2026-08-05T09:00:00+09:00') })

  assert.equal(occurrence.calendarType, 'solar')
  assert.equal(occurrence.date, '2027-08-01')
  assert.equal(occurrence.recalculated, true)
})

test('음력 반복 자동 재계산은 Pro에만 적용하고 Free는 저장 날짜를 유지한다', () => {
  const item = {
    dueDate: '2025-07-09',
    isLunar: true,
    lunarMonth: 6,
    lunarDay: 15,
    isLeapMonth: false,
    repeatType: 'yearly',
  }
  const now = new Date('2026-08-05T09:00:00+09:00')

  assert.equal(getMemoryOccurrence(item, { now, isPro: false }).date, '2025-07-09')
  assert.equal(getMemoryOccurrence(item, { now, isPro: true }).date, '2027-07-18')
})
