import assert from 'node:assert/strict'
import test from 'node:test'
import { CATEGORIES } from '../src/constants/categories.js'
import { buildMoneyReport } from '../src/utils/moneyReport.js'

const items = [
  { category: CATEGORIES.PAYMENT, amount: 90000, dueDate: '2026-08-01', completed: true },
  { category: CATEGORIES.SHOPPING, amount: 12000, dueDate: '2026-08-20', completed: false },
  { category: CATEGORIES.PAYMENT, amount: 30000, dueDate: '2026-09-01', completed: false },
  { category: CATEGORIES.TODO, amount: 50000, dueDate: '2026-08-03', completed: false },
  { category: CATEGORIES.SHOPPING, amount: 1000, dueDate: null, completed: false },
]

test('월별 금액을 완료·예정과 카테고리별로 구분한다', () => {
  const report = buildMoneyReport(items, { year: 2026, month: 8 })

  assert.equal(report.monthly.total, 102000)
  assert.equal(report.monthly.completed, 90000)
  assert.equal(report.monthly.planned, 12000)
  assert.equal(report.monthly.categories[CATEGORIES.PAYMENT], 90000)
  assert.equal(report.monthly.categories[CATEGORIES.SHOPPING], 12000)
})

test('연간 합계는 선택한 해의 날짜 있는 금액만 포함한다', () => {
  const report = buildMoneyReport(items, { year: 2026, month: 8 })

  assert.equal(report.annual.total, 132000)
  assert.equal(report.annual.completed, 90000)
  assert.equal(report.annual.planned, 42000)
  assert.equal(report.annual.count, 3)
})

test('해당 기간에 데이터가 없으면 0 합계를 반환한다', () => {
  const report = buildMoneyReport(items, { year: 2025, month: 1 })
  assert.equal(report.monthly.count, 0)
  assert.equal(report.annual.total, 0)
})
