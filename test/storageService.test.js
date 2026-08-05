import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { CATEGORIES } from '../src/constants/categories.js'
import { ITEM_SCHEMA_VERSION, REPEAT_TYPES, createItemModel } from '../src/models/item.js'
import {
  STORAGE_KEYS,
  completeItem,
  createItem,
  deleteItem,
  exportData,
  getProStatus,
  getItems,
  importData,
  restoreDeletedItem,
  restoreItem,
  setProStatus,
  updateItem,
} from '../src/services/storageService.js'

class LocalStorageMock {
  #values = new Map()

  getItem(key) {
    return this.#values.get(key) ?? null
  }

  setItem(key, value) {
    this.#values.set(key, String(value))
  }

  removeItem(key) {
    this.#values.delete(key)
  }

  clear() {
    this.#values.clear()
  }
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: new LocalStorageMock(),
  })
})

test('아이템 모델이 기본값과 카테고리별 금액 규칙을 적용한다', () => {
  const item = createItemModel({
    category: CATEGORIES.TODO,
    title: '  할 일  ',
    amount: 1000,
  }, new Date('2026-08-05T00:00:00.000Z'))

  assert.equal(item.title, '할 일')
  assert.equal(item.amount, null)
  assert.equal(item.repeatType, REPEAT_TYPES.NONE)
  assert.deepEqual(item.notificationOffsets, [])
  assert.equal(item.createdAt, '2026-08-05T00:00:00.000Z')
})

test('잘못된 JSON이나 레코드가 있어도 빈 목록 또는 정상 레코드를 반환한다', () => {
  localStorage.setItem(STORAGE_KEYS.ITEMS, '{broken json')
  assert.deepEqual(getItems(), [])

  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify([
    null,
    { category: 'unknown', title: '잘못된 항목' },
    { id: 'valid', category: CATEGORIES.THOUGHT, title: '정상 항목' },
  ]))

  assert.deepEqual(getItems().map((item) => item.id), ['valid'])
  assert.equal(localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION), String(ITEM_SCHEMA_VERSION))
})

test('아이템 CRUD와 완료 복원이 동작한다', () => {
  const created = createItem({
    category: CATEGORIES.PAYMENT,
    title: '월세',
    amount: 90000,
  })
  assert.equal(getItems().length, 1)

  const updated = updateItem(created.id, { title: '8월 월세', amount: 95000 })
  assert.equal(updated.title, '8월 월세')
  assert.equal(updated.amount, 95000)

  const completed = completeItem(created.id)
  assert.equal(completed.completed, true)
  assert.ok(completed.completedAt)

  const restored = restoreItem(created.id)
  assert.equal(restored.completed, false)
  assert.equal(restored.completedAt, null)
})

test('삭제 스냅샷으로 원래 위치에 실행취소할 수 있다', () => {
  const first = createItem({ category: CATEGORIES.TODO, title: '첫 번째' })
  createItem({ category: CATEGORIES.TODO, title: '두 번째' })

  const snapshot = deleteItem(first.id)
  assert.equal(getItems().length, 1)
  assert.equal(snapshot.index, 0)

  const restored = restoreDeletedItem(snapshot)
  assert.equal(restored.id, first.id)
  assert.deepEqual(getItems().map((item) => item.title), ['첫 번째', '두 번째'])
})

test('내보내기와 가져오기 인터페이스가 사용자 데이터를 복원한다', () => {
  createItem({ category: CATEGORIES.SHOPPING, title: '우산', amount: 12000 })
  const backup = exportData()

  localStorage.clear()
  const result = importData(JSON.stringify(backup))

  assert.equal(result.success, true)
  assert.equal(result.importedCount, 1)
  assert.equal(getItems()[0].title, '우산')
})

test('백업 데이터로 Pro 권한을 내보내거나 활성화하지 않는다', () => {
  setProStatus(false)
  const backup = exportData()
  assert.equal(Object.hasOwn(backup, 'pro'), false)

  const result = importData({ ...backup, pro: true })
  assert.equal(result.success, true)
  assert.equal(getProStatus(), false)
})

test('localStorage 접근이 불가능하면 메모리 저장소로 대체한다', () => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('storage blocked')
    },
  })

  const created = createItem({ category: CATEGORIES.MEMORY, title: '기념일' })
  assert.equal(getItems().some((item) => item.id === created.id), true)
})
