import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { CATEGORIES } from '../src/constants/categories.js'
import { ITEM_SCHEMA_VERSION, REPEAT_TYPES, createItemModel } from '../src/models/item.js'
import {
  STORAGE_KEYS,
  completeItem,
  createItem,
  deleteItem,
  dismissSampleData,
  exportData,
  getTheme,
  getProStatus,
  getItems,
  importData,
  isSampleDataDismissed,
  resetUserData,
  restoreDeletedItem,
  restoreItem,
  setProStatus,
  setTheme,
  updateItem,
  validateBackupData,
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
  assert.equal(item.dueTime, null)
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
    dueTime: '09:40',
  })
  assert.equal(getItems().length, 1)
  assert.equal(getItems()[0].dueTime, '09:40')
  assert.equal(isSampleDataDismissed(), true)

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

test('예정 시간은 HH:mm 형식만 저장한다', () => {
  const valid = createItemModel({ category: CATEGORIES.TODO, title: '정상 시간', dueTime: '23:59' })
  const invalid = createItemModel({ category: CATEGORIES.TODO, title: '잘못된 시간', dueTime: '24:00' })

  assert.equal(valid.dueTime, '23:59')
  assert.equal(invalid.dueTime, null)
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
  assert.equal(backup.appName, '미리꼭')
  assert.equal(typeof backup.settings.theme, 'string')
  assert.equal(isSampleDataDismissed(), true)
})

test('샘플 없이 시작 상태를 기기에 저장한다', () => {
  assert.equal(isSampleDataDismissed(), false)
  dismissSampleData()
  assert.equal(isSampleDataDismissed(), true)
})

test('백업 데이터로 Pro 권한을 내보내거나 활성화하지 않는다', () => {
  setProStatus(false)
  const backup = exportData()
  assert.equal(Object.hasOwn(backup, 'pro'), false)

  const result = importData({ ...backup, pro: true })
  assert.equal(result.success, true)
  assert.equal(getProStatus(), false)
})

test('잘못된 백업은 기존 데이터를 변경하지 않는다', () => {
  createItem({ category: CATEGORIES.TODO, title: '기존 항목' })
  const invalidBackup = {
    schemaVersion: ITEM_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appName: '미리꼭',
    settings: { theme: 'soft' },
    items: [{ category: 'invalid', title: '잘못된 항목' }],
  }

  assert.equal(validateBackupData(invalidBackup).success, false)
  assert.equal(importData(invalidBackup).success, false)
  assert.deepEqual(getItems().map((item) => item.title), ['기존 항목'])
})

test('백업 아이템의 필수 필드와 날짜 구조를 검증한다', () => {
  const backup = exportData()
  backup.items = [{ ...createItemModel({ category: CATEGORIES.PAYMENT, title: '정상', amount: 1000 }), dueDate: '2026-02-30' }]

  assert.equal(validateBackupData(backup).success, false)
  delete backup.items[0].memo
  assert.equal(validateBackupData(backup).success, false)
})

test('v1 백업은 예정 시간이 없어도 가져오고 v2 백업은 시간 형식을 검증한다', () => {
  const legacyItem = createItemModel({ category: CATEGORIES.TODO, title: '구버전 항목' })
  delete legacyItem.dueTime
  const legacyBackup = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    appName: '미리꼭',
    settings: { theme: 'soft' },
    items: [legacyItem],
  }

  const legacyValidation = validateBackupData(legacyBackup)
  assert.equal(legacyValidation.success, true)
  assert.equal(legacyValidation.data.items[0].dueTime, null)

  const currentBackup = { ...legacyBackup, schemaVersion: ITEM_SCHEMA_VERSION }
  assert.equal(validateBackupData(currentBackup).success, false)
  currentBackup.items = [{ ...legacyItem, dueTime: '25:00' }]
  assert.equal(validateBackupData(currentBackup).success, false)
})

test('병합은 중복 ID를 갱신하고 교체는 기존 항목을 제거한다', () => {
  const existing = createItem({ category: CATEGORIES.PAYMENT, title: '기존 월세', amount: 90000 })
  const backup = exportData()
  backup.items = [
    { ...existing, title: '수정된 월세', amount: 95000 },
    createItemModel({ id: 'new-item', category: CATEGORIES.SHOPPING, title: '새 항목', amount: 12000 }),
  ]

  const merged = importData(backup, { merge: true })
  assert.equal(merged.duplicateCount, 1)
  assert.equal(getItems().length, 2)
  assert.equal(getItems().find((item) => item.id === existing.id).title, '수정된 월세')

  const replacement = { ...backup, items: [backup.items[1]] }
  assert.equal(importData(replacement, { merge: false }).success, true)
  assert.deepEqual(getItems().map((item) => item.id), ['new-item'])
})

test('데이터 초기화는 아이템과 설정만 지우고 Pro 권한은 유지한다', () => {
  createItem({ category: CATEGORIES.TODO, title: '삭제할 항목' })
  setTheme('midnight')
  setProStatus(true)

  resetUserData()

  assert.deepEqual(getItems(), [])
  assert.equal(getTheme(), 'soft')
  assert.equal(getProStatus(), true)
  assert.equal(isSampleDataDismissed(), true)
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
