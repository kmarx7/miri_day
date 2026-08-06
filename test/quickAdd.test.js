import assert from 'node:assert/strict'
import test from 'node:test'
import { CATEGORIES } from '../src/constants/categories.js'
import { createQuickItemValues } from '../src/utils/quickAdd.js'

test('빠른 입력은 제목·금액·날짜·시간·메모를 저장 입력값으로 변환한다', () => {
  assert.deepEqual(createQuickItemValues({
    category: CATEGORIES.PAYMENT,
    title: '  관리비 납부 ',
    amount: '120,000원',
    dueDate: '2026-08-10',
    dueTime: '09:40',
    memo: ' 자동이체 확인 ',
  }), {
    category: CATEGORIES.PAYMENT,
    title: '관리비 납부',
    amount: 120000,
    dueDate: '2026-08-10',
    dueTime: '09:40',
    memo: '자동이체 확인',
    notificationOffsets: [0],
  })
})

test('시간만 선택하면 Asia/Seoul 기준 오늘 날짜를 연결한다', () => {
  const values = createQuickItemValues({
    category: CATEGORIES.TODO,
    title: '전화하기',
    dueTime: '18:30',
  }, new Date('2026-08-06T15:30:00.000Z'))

  assert.equal(values.dueDate, '2026-08-07')
  assert.equal(values.dueTime, '18:30')
  assert.deepEqual(values.notificationOffsets, [0])
})

test('금액 카테고리가 아니면 입력된 금액을 저장하지 않고 빈 제목을 거부한다', () => {
  assert.equal(createQuickItemValues({ category: CATEGORIES.TODO, title: '   ' }), null)
  assert.equal(createQuickItemValues({ category: CATEGORIES.THOUGHT, title: '아이디어', amount: '9,900' }).amount, null)
})
