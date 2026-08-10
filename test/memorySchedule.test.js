import assert from 'node:assert/strict'
import test from 'node:test'
import { CATEGORIES } from '../src/constants/categories.js'
import { MEMORY_KINDS } from '../src/constants/memoryKinds.js'
import { REPEAT_TYPES, createItemModel } from '../src/models/item.js'
import {
  createMemoryItemValues,
  getMemoryDayOptions,
  resolveMemorySchedule,
  toMemoryFormValues,
} from '../src/utils/memorySchedule.js'

const NOW = new Date('2026-08-10T03:00:00.000Z') // Asia/Seoul 2026-08-10

test('양력 월·일은 오늘 이후 가장 가까운 날짜로 확정된다', () => {
  assert.equal(resolveMemorySchedule({ month: 12, day: 25 }, NOW).dueDate, '2026-12-25')
  assert.equal(resolveMemorySchedule({ month: 8, day: 10 }, NOW).dueDate, '2026-08-10')
  // 이미 지난 날짜는 다음 해로 넘어갑니다.
  assert.equal(resolveMemorySchedule({ month: 1, day: 3 }, NOW).dueDate, '2027-01-03')
})

test('2월 29일은 다음 윤년으로 확정된다', () => {
  assert.equal(resolveMemorySchedule({ month: 2, day: 29 }, NOW).dueDate, '2028-02-29')
})

test('일 선택지는 달력 종류와 월에 따라 달라진다', () => {
  assert.equal(getMemoryDayOptions(2, false).length, 29)
  assert.equal(getMemoryDayOptions(4, false).length, 30)
  assert.equal(getMemoryDayOptions(1, false).length, 31)
  assert.equal(getMemoryDayOptions(4, true).length, 30)
})

test('월·일을 고르지 않으면 저장할 수 없다', () => {
  const result = resolveMemorySchedule({ month: '', day: 5 }, NOW)
  assert.equal(result.valid, false)
  assert.equal(result.error, '월과 일을 선택해 주세요.')
})

test('음력 월·일은 다가오는 양력 날짜와 음력 정보를 함께 반환한다', () => {
  const result = resolveMemorySchedule({ month: 6, day: 1, isLunar: true }, NOW)
  assert.equal(result.valid, true)
  assert.equal(result.lunar.month, 6)
  assert.equal(result.lunar.day, 1)
  assert.ok(result.dueDate >= '2026-08-10')
})

test('기억할 것 입력값은 저장 가능한 아이템으로 변환된다', () => {
  const values = createMemoryItemValues({
    title: '  어머니 생신 ',
    memoryKind: MEMORY_KINDS.BIRTHDAY,
    month: 12,
    day: 25,
    repeatType: REPEAT_TYPES.YEARLY,
  }, NOW)

  assert.equal(values.category, CATEGORIES.MEMORY)
  assert.equal(values.memoryKind, MEMORY_KINDS.BIRTHDAY)
  assert.equal(values.title, '어머니 생신')
  assert.equal(values.dueDate, '2026-12-25')
  assert.equal(values.repeatType, REPEAT_TYPES.YEARLY)
  assert.deepEqual(values.notificationOffsets, [0])
  assert.equal(values.isLunar, false)
  assert.equal(values.lunarMonth, null)
})

test('제목이 비어 있으면 변환하지 않는다', () => {
  assert.equal(createMemoryItemValues({ title: '   ', month: 1, day: 1 }, NOW), null)
})

test('매월 같은 지원하지 않는 반복은 1회만으로 정규화된다', () => {
  const values = createMemoryItemValues({
    title: '결혼기념일',
    month: 5,
    day: 20,
    repeatType: REPEAT_TYPES.MONTHLY,
  }, NOW)
  assert.equal(values.repeatType, REPEAT_TYPES.NONE)
})

test('저장된 기억할 것은 폼 값으로 되돌릴 수 있다', () => {
  const item = createItemModel({
    category: CATEGORIES.MEMORY,
    memoryKind: MEMORY_KINDS.MEMORIAL,
    title: '할머니 제사',
    dueDate: '2026-08-06',
    isLunar: true,
    lunarYear: 2026,
    lunarMonth: 6,
    lunarDay: 24,
    repeatType: REPEAT_TYPES.YEARLY,
  })

  assert.deepEqual(toMemoryFormValues(item, NOW), {
    title: '할머니 제사',
    memoryKind: MEMORY_KINDS.MEMORIAL,
    month: 6,
    day: 24,
    isLunar: true,
    isLeapMonth: false,
    memo: '',
  })
})

test('종류가 없는 예전 기억할 것은 기타로 정규화된다', () => {
  const item = createItemModel({ category: CATEGORIES.MEMORY, title: '옛 기록' })
  assert.equal(item.memoryKind, MEMORY_KINDS.ETC)
})

test('기억할 것이 아닌 카테고리는 종류를 갖지 않는다', () => {
  const item = createItemModel({
    category: CATEGORIES.TODO,
    memoryKind: MEMORY_KINDS.BIRTHDAY,
    title: '할 일',
  })
  assert.equal(item.memoryKind, null)
})
