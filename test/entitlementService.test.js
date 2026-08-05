import assert from 'node:assert/strict'
import test from 'node:test'
import { CATEGORIES } from '../src/constants/categories.js'
import {
  FEATURES,
  FREE_LIMITS,
  PAYWALL_TRIGGERS,
  canUseFeature,
  evaluateItemCreation,
  requirePro,
} from '../src/services/entitlementService.js'

test('Free 기본 기능과 Pro 전용 기능을 구분한다', () => {
  assert.equal(canUseFeature(FEATURES.MANUAL_LUNAR), true)
  assert.equal(canUseFeature(FEATURES.BASIC_BACKUP), true)
  assert.equal(canUseFeature(FEATURES.BASIC_DDAY), true)
  assert.equal(canUseFeature(FEATURES.RECURRING_SCHEDULES), false)
  assert.equal(canUseFeature(FEATURES.RECURRING_SCHEDULES, { isPro: true }), true)
})

test('51번째 전체 아이템 추가를 Pro 페이월로 연결한다', () => {
  const items = Array.from({ length: FREE_LIMITS.totalItems }, (_, index) => ({
    id: String(index),
    category: CATEGORIES.TODO,
  }))
  const decision = evaluateItemCreation(items, { category: CATEGORIES.TODO })

  assert.equal(decision.allowed, false)
  assert.equal(decision.trigger, PAYWALL_TRIGGERS.ITEM_LIMIT)
})

test('여섯 번째 기억할 것 추가를 Pro 페이월로 연결한다', () => {
  const items = Array.from({ length: FREE_LIMITS.memoryItems }, (_, index) => ({
    id: String(index),
    category: CATEGORIES.MEMORY,
  }))
  const decision = evaluateItemCreation(items, { category: CATEGORIES.MEMORY })

  assert.equal(decision.allowed, false)
  assert.equal(decision.trigger, PAYWALL_TRIGGERS.MEMORY_LIMIT)
})

test('Pro는 아이템과 기억할 것 개수 제한을 받지 않는다', () => {
  const items = Array.from({ length: 60 }, (_, index) => ({
    id: String(index),
    category: CATEGORIES.MEMORY,
  }))

  assert.equal(evaluateItemCreation(items, { category: CATEGORIES.MEMORY }, true).allowed, true)
})

test('반복·돈 리포트·테마 트리거를 구분한다', () => {
  assert.equal(requirePro(FEATURES.RECURRING_SCHEDULES).trigger, PAYWALL_TRIGGERS.RECURRING_SCHEDULE)
  assert.equal(requirePro(FEATURES.MONEY_REPORT_DETAIL).trigger, PAYWALL_TRIGGERS.MONEY_REPORT)
  assert.equal(requirePro(FEATURES.PRO_THEMES).trigger, PAYWALL_TRIGGERS.PRO_THEME)
})
