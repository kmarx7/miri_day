import { ITEM_SCHEMA_VERSION, createItemModel, normalizeStoredItem } from '../models/item.js'

export const STORAGE_KEYS = Object.freeze({
  ITEMS: 'mirikkok_items',
  PRO: 'mirikkok_pro',
  THEME: 'mirikkok_theme',
  SCHEMA_VERSION: 'mirikkok_schema_version',
})

export const DEFAULT_THEME = 'soft'

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
  return safeGet(STORAGE_KEYS.THEME) || DEFAULT_THEME
}

export function setTheme(theme) {
  const nextTheme = typeof theme === 'string' && theme.trim() ? theme.trim() : DEFAULT_THEME
  safeSet(STORAGE_KEYS.THEME, nextTheme)
  return nextTheme
}

export function exportData() {
  return {
    schemaVersion: ITEM_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    items: getItems(),
    theme: getTheme(),
  }
}

/**
 * @param {string | object} payload
 * @param {{ merge?: boolean }} [options]
 */
export function importData(payload, { merge = false } = {}) {
  const parsed = typeof payload === 'string' ? parseJson(payload, null) : payload
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.items)) {
    return { success: false, error: '올바른 미리꼭 백업 데이터가 아닙니다.' }
  }

  const importedItems = normalizeItems(parsed.items)
  let nextItems = importedItems

  if (merge) {
    const merged = new Map(getItems().map((item) => [item.id, item]))
    importedItems.forEach((item) => merged.set(item.id, item))
    nextItems = [...merged.values()]
  }

  saveItems(nextItems)
  if (typeof parsed.theme === 'string') setTheme(parsed.theme)
  safeSet(STORAGE_KEYS.SCHEMA_VERSION, ITEM_SCHEMA_VERSION)

  return {
    success: true,
    importedCount: importedItems.length,
    totalCount: nextItems.length,
  }
}
