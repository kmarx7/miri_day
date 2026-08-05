import assert from 'node:assert/strict'
import test from 'node:test'
import { REPEAT_TYPES } from '../src/models/item.js'
import {
  RECURRENCE_EDIT_SCOPES,
  SUPPORTED_RECURRENCE_EDIT_SCOPES,
  getOccurrencesForRange,
} from '../src/utils/recurrence.js'

function item(overrides = {}) {
  return {
    id: 'source-1',
    title: '반복 일정',
    dueDate: '2024-01-31',
    repeatType: REPEAT_TYPES.NONE,
    isLunar: false,
    lunarMonth: null,
    lunarDay: null,
    isLeapMonth: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

test('매월 31일 일정은 월말에 맞춰 필요한 기간만 계산한다', () => {
  const occurrences = getOccurrencesForRange([
    item({ repeatType: REPEAT_TYPES.MONTHLY }),
  ], '2024-02-01', '2024-03-31', { includeRecurring: true })

  assert.deepEqual(occurrences.map((entry) => entry.date), ['2024-02-29', '2024-03-31'])
  assert.equal(occurrences.length, 2)
})

test('매월 반복은 연말에서 다음 해로 넘어간다', () => {
  const occurrences = getOccurrencesForRange([
    item({ dueDate: '2025-12-31', repeatType: REPEAT_TYPES.MONTHLY }),
  ], '2025-12-01', '2026-01-31', { includeRecurring: true })

  assert.deepEqual(occurrences.map((entry) => entry.date), ['2025-12-31', '2026-01-31'])
})

test('2월 29일 매년 반복은 평년 말일과 윤년 날짜를 구분한다', () => {
  const source = item({ dueDate: '2024-02-29', repeatType: REPEAT_TYPES.YEARLY })
  const regularYear = getOccurrencesForRange([source], '2025-01-01', '2025-12-31', { includeRecurring: true })
  const leapYear = getOccurrencesForRange([source], '2028-01-01', '2028-12-31', { includeRecurring: true })

  assert.equal(regularYear[0].date, '2025-02-28')
  assert.equal(leapYear[0].date, '2028-02-29')
})

test('음력과 양력 아이템은 변환되어 저장된 같은 양력 날짜에 표시된다', () => {
  const occurrences = getOccurrencesForRange([
    item({ id: 'solar', dueDate: '2026-08-05' }),
    item({
      id: 'lunar',
      dueDate: '2026-08-05',
      isLunar: true,
      lunarMonth: 6,
      lunarDay: 23,
    }),
  ], '2026-08-01', '2026-08-31')

  assert.deepEqual(occurrences.map((entry) => entry.date), ['2026-08-05', '2026-08-05'])
})

test('음력 매년 반복은 해당 연도의 변환 날짜만 계산한다', () => {
  const occurrences = getOccurrencesForRange([
    item({
      dueDate: '2025-07-09',
      repeatType: REPEAT_TYPES.YEARLY,
      isLunar: true,
      lunarMonth: 6,
      lunarDay: 15,
    }),
  ], '2026-07-01', '2026-07-31', { includeRecurring: true })

  assert.equal(occurrences[0].date, '2026-07-28')
})

test('발생 일정은 원본 식별자와 별도 occurrenceId를 가진다', () => {
  const [occurrence] = getOccurrencesForRange([
    item({ repeatType: REPEAT_TYPES.MONTHLY }),
  ], '2024-02-01', '2024-02-29', { includeRecurring: true })

  assert.equal(occurrence.sourceItemId, 'source-1')
  assert.equal(occurrence.occurrenceId, 'source-1:2024-02-29')
  assert.equal(occurrence.isGenerated, true)
  assert.equal(occurrence.item.id, 'source-1')
})

test('반복 계산을 요청하지 않으면 저장된 원본 날짜만 반환한다', () => {
  const occurrences = getOccurrencesForRange([
    item({ repeatType: REPEAT_TYPES.MONTHLY }),
  ], '2024-02-01', '2024-02-29')

  assert.deepEqual(occurrences, [])
})

test('MVP 반복 수정 범위는 전체 반복 일정만 지원한다', () => {
  assert.deepEqual(SUPPORTED_RECURRENCE_EDIT_SCOPES, [RECURRENCE_EDIT_SCOPES.ALL])
})
