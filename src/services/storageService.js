import { isCategory } from '../constants/categories.js'
import { DEFAULT_THEME, normalizeTheme } from '../constants/themes.js'
import { ITEM_SCHEMA_VERSION, REPEAT_TYPES, createItemModel, normalizeStoredItem } from '../models/item.js'
import { parseYmdParts } from '../utils/dates.js'

export const STORAGE_KEYS = Object.freeze({
  ITEMS: 'mirikkok_items',
  PRO: 'mirikkok_pro',
  THEME: 'mirikkok_theme',
  SCHEMA_VERSION: 'mirikkok_schema_version',
  SAMPLE_DISMISSED: 'mirikkok_sample_dismissed',
})

export { DEFAULT_THEME }
export const APP_NAME = '미리꼭'

const memoryFallback = new Map()

function safeGet(key) {
  try {
    const storage = globalThis.localStorage
    if (!storage) return memoryFallback.get(key) ?? null

    const value = storage.getItem(key)
    if (value !== null && value !== undefined) {
      memoryFallback.set(key, value)
      return value
    }

    memoryFallback.delete(key)
    return null
  } catch {
    // 메모리 저장소로 대체합니다.
  }

  return memoryFallback.get(key) ?? null
}

function safeSet(key, value) {
  const serialized = String(value)
  memoryFallback.set(key, serialized)

  try {
    const storage = globalThis.localStorage
    if (!storage) return false
    storage.setItem(key, serialized)
    return true
  } catch {
    return false
  }
}

function safeRemove(key) {
  memoryFallback.delete(key)

  try {
    const storage = globalThis.localStorage
    if (!storage) return false
    storage.removeItem(key)
    return true
  } catch {
    return false
  }
}

function parseJson(value, fallback) {
  if (typeof value !== 'string') return fallback

  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function ensureSchemaVersion() {
  const storedVersion = Number.parseInt(safeGet(STORAGE_KEYS.SCHEMA_VERSION), 10)
  if (storedVersion !== ITEM_SCHEMA_VERSION) {
    safeSet(STORAGE_KEYS.SCHEMA_VERSION, ITEM_SCHEMA_VERSION)
  }
  return Number.isInteger(storedVersion) ? storedVersion : ITEM_SCHEMA_VERSION
}

function normalizeItems(items) {
  if (!Array.isArray(items)) return []
  return items.map(normalizeStoredItem).filter(Boolean)
}

function isValidTimestamp(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function isBackupItemShape(item) {
  if (!item || typeof item !== 'object') return false
  const validAmount = item.amount === null || (Number.isFinite(item.amount) && item.amount >= 0)
  const validDueDate = item.dueDate === null || parseYmdParts(item.dueDate) !== null
  const validDueTime = item.dueTime === null || (typeof item.dueTime === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(item.dueTime))
  const validCompletedAt = item.completedAt === null || isValidTimestamp(item.completedAt)
  const validLunarPart = (value) => value === null || Number.isInteger(value)
  const validRepeatType = Object.values(REPEAT_TYPES).includes(item.repeatType)
  const validOffsets = Array.isArray(item.notificationOffsets)
    && item.notificationOffsets.every((offset) => Number.isInteger(offset) && offset >= 0)

  return typeof item.id === 'string'
    && item.id.trim().length > 0
    && isCategory(item.category)
    && typeof item.title === 'string'
    && item.title.trim().length > 0
    && validAmount
    && validDueDate
    && validDueTime
    && typeof item.memo === 'string'
    && typeof item.completed === 'boolean'
    && validCompletedAt
    && typeof item.isLunar === 'boolean'
    && validLunarPart(item.lunarYear)
    && validLunarPart(item.lunarMonth)
    && validLunarPart(item.lunarDay)
    && typeof item.isLeapMonth === 'boolean'
    && validRepeatType
    && validOffsets
    && isValidTimestamp(item.createdAt)
    && isValidTimestamp(item.updatedAt)
}

function saveItems(items) {
  const normalized = normalizeItems(items)
  ensureSchemaVersion()
  safeSet(STORAGE_KEYS.ITEMS, JSON.stringify(normalized))
  return normalized
}

/** @returns {import('../models/item.js').MirikkokItem[]} */
export function getItems() {
  ensureSchemaVersion()
  const stored = parseJson(safeGet(STORAGE_KEYS.ITEMS), [])
  return normalizeItems(stored)
}

/**
 * @param {Partial<import('../models/item.js').MirikkokItem>} input
 */
export function createItem(input) {
  const item = createItemModel(input)
  saveItems([...getItems(), item])
  dismissSampleData()
  return item
}

/**
 * @param {string} id
 * @param {Partial<import('../models/item.js').MirikkokItem>} updates
 */
export function updateItem(id, updates) {
  const items = getItems()
  const index = items.findIndex((item) => item.id === id)
  if (index < 0) return null

  const current = items[index]
  const updated = createItemModel({
    ...current,
    ...updates,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  })

  items[index] = updated
  saveItems(items)
  return updated
}

/**
 * Removes an item and returns a temporary snapshot that can be passed to
 * restoreDeletedItem while the undo UI is visible.
 *
 * @param {string} id
 */
export function deleteItem(id) {
  const items = getItems()
  const index = items.findIndex((item) => item.id === id)
  if (index < 0) return null

  const [item] = items.splice(index, 1)
  saveItems(items)

  return {
    item,
    index,
    deletedAt: new Date().toISOString(),
  }
}

/** @param {string} id */
export function completeItem(id) {
  const completedAt = new Date().toISOString()
  return updateItem(id, { completed: true, completedAt })
}

/** @param {string} id */
export function restoreItem(id) {
  return updateItem(id, { completed: false, completedAt: null })
}

/**
 * @param {{ item: import('../models/item.js').MirikkokItem, index: number }} snapshot
 */
export function restoreDeletedItem(snapshot) {
  if (!snapshot?.item) return null

  const restored = normalizeStoredItem(snapshot.item)
  if (!restored) return null

  const items = getItems()
  if (items.some((item) => item.id === restored.id)) return null

  const index = Number.isInteger(snapshot.index)
    ? Math.max(0, Math.min(snapshot.index, items.length))
    : items.length

  items.splice(index, 0, restored)
  saveItems(items)
  return restored
}

export function getProStatus() {
  return safeGet(STORAGE_KEYS.PRO) === 'true'
}

export function setProStatus(isPro) {
  safeSet(STORAGE_KEYS.PRO, isPro === true ? 'true' : 'false')
  return isPro === true
}

export function getTheme() {
  // 목록에서 사라진 예전 테마 값은 기본 테마로 되돌립니다.
  return normalizeTheme(safeGet(STORAGE_KEYS.THEME))
}

export function setTheme(theme) {
  const nextTheme = normalizeTheme(theme)
  safeSet(STORAGE_KEYS.THEME, nextTheme)
  return nextTheme
}

export function isSampleDataDismissed() {
  return safeGet(STORAGE_KEYS.SAMPLE_DISMISSED) === 'true'
}

export function dismissSampleData() {
  safeSet(STORAGE_KEYS.SAMPLE_DISMISSED, 'true')
  return true
}

export function exportData() {
  return {
    schemaVersion: ITEM_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appName: APP_NAME,
    items: getItems(),
    settings: {
      theme: getTheme(),
    },
  }
}

/**
 * Validates the full backup before any persisted data is changed.
 * Purchase entitlements and authentication values are intentionally ignored.
 *
 * @param {unknown} payload
 */
export function validateBackupData(payload) {
  const parsed = typeof payload === 'string' ? parseJson(payload, null) : payload
  const validHeader = parsed
    && typeof parsed === 'object'
    && parsed.appName === APP_NAME
    && Number.isInteger(parsed.schemaVersion)
    && parsed.schemaVersion > 0
    && parsed.schemaVersion <= ITEM_SCHEMA_VERSION
    && typeof parsed.exportedAt === 'string'
    && !Number.isNaN(Date.parse(parsed.exportedAt))
    && Array.isArray(parsed.items)
    && parsed.settings
    && typeof parsed.settings === 'object'
    && typeof parsed.settings.theme === 'string'

  if (!validHeader) {
    return { success: false, error: '올바른 미리꼭 백업 데이터가 아닙니다.' }
  }

  const backupItemsValid = parsed.items.every((item) => (
    parsed.schemaVersion < 2
      ? isBackupItemShape({ ...item, dueTime: item.dueTime ?? null })
      : isBackupItemShape(item)
  ))
  if (!backupItemsValid) {
    return { success: false, error: '백업에 올바르지 않은 아이템이 포함돼 있습니다.' }
  }
  const normalizedItems = parsed.items.map(normalizeStoredItem)

  return {
    success: true,
    data: {
      schemaVersion: parsed.schemaVersion,
      exportedAt: parsed.exportedAt,
      appName: APP_NAME,
      items: normalizedItems,
      settings: { theme: parsed.settings.theme },
    },
  }
}

/**
 * @param {string | object} payload
 * @param {{ merge?: boolean }} [options]
 */
export function importData(payload, { merge = false } = {}) {
  const validation = validateBackupData(payload)
  if (!validation.success) return validation

  const { data } = validation
  const existingItems = merge ? getItems() : []
  const merged = new Map(existingItems.map((item) => [item.id, item]))
  let duplicateCount = 0
  data.items.forEach((item) => {
    if (merged.has(item.id)) duplicateCount += 1
    merged.set(item.id, item)
  })
  const nextItems = [...merged.values()]

  saveItems(nextItems)
  setTheme(data.settings.theme)
  dismissSampleData()
  safeSet(STORAGE_KEYS.SCHEMA_VERSION, ITEM_SCHEMA_VERSION)

  return {
    success: true,
    importedCount: data.items.length,
    totalCount: nextItems.length,
    duplicateCount,
  }
}

export function resetUserData() {
  safeRemove(STORAGE_KEYS.ITEMS)
  safeRemove(STORAGE_KEYS.THEME)
  dismissSampleData()
  safeSet(STORAGE_KEYS.SCHEMA_VERSION, ITEM_SCHEMA_VERSION)
  return { success: true }
}
