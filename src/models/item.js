import { CATEGORIES, isCategory } from '../constants/categories.js'

export const ITEM_SCHEMA_VERSION = 2

export const REPEAT_TYPES = Object.freeze({
  NONE: 'none',
  YEARLY: 'yearly',
  MONTHLY: 'monthly',
})

const REPEAT_TYPE_VALUES = Object.freeze(Object.values(REPEAT_TYPES))

/**
 * @typedef {'todo' | 'payment' | 'shopping' | 'thought' | 'memory'} ItemCategory
 * @typedef {'none' | 'yearly' | 'monthly'} RepeatType
 *
 * @typedef {Object} MirikkokItem
 * @property {string} id
 * @property {ItemCategory} category
 * @property {string} title
 * @property {number | null} amount
 * @property {string | null} dueDate
 * @property {string | null} dueTime
 * @property {string} memo
 * @property {boolean} completed
 * @property {string | null} completedAt
 * @property {boolean} isLunar
 * @property {number | null} lunarYear
 * @property {number | null} lunarMonth
 * @property {number | null} lunarDay
 * @property {boolean} isLeapMonth
 * @property {RepeatType} repeatType
 * @property {number[]} notificationOffsets
 * @property {string} createdAt
 * @property {string} updatedAt
 */

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `item-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function nullableString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function nullableInteger(value) {
  return Number.isInteger(value) ? value : null
}

function nullableTime(value) {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(normalized) ? normalized : null
}

function normalizeAmount(value, category) {
  if (category !== CATEGORIES.PAYMENT && category !== CATEGORIES.SHOPPING) return null
  if (value === null || value === undefined || value === '') return null
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 ? amount : null
}

function normalizeNotificationOffsets(value) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((offset) => Number.isInteger(offset) && offset >= 0))]
}

/**
 * Creates a valid item from user input. Invalid category or blank title throws.
 *
 * @param {Partial<MirikkokItem>} input
 * @param {Date} [now]
 * @returns {MirikkokItem}
 */
export function createItemModel(input, now = new Date()) {
  if (!input || !isCategory(input.category)) {
    throw new TypeError('유효한 카테고리가 필요합니다.')
  }

  const title = typeof input.title === 'string' ? input.title.trim() : ''
  if (!title) throw new TypeError('제목이 필요합니다.')

  const nowIso = now.toISOString()
  const isLunar = input.isLunar === true
  const completed = input.completed === true

  return {
    id: nullableString(input.id) ?? createId(),
    category: input.category,
    title,
    amount: normalizeAmount(input.amount, input.category),
    dueDate: nullableString(input.dueDate),
    dueTime: nullableTime(input.dueTime),
    memo: typeof input.memo === 'string' ? input.memo : '',
    completed,
    completedAt: completed ? nullableString(input.completedAt) : null,
    isLunar,
    lunarYear: isLunar ? nullableInteger(input.lunarYear) : null,
    lunarMonth: isLunar ? nullableInteger(input.lunarMonth) : null,
    lunarDay: isLunar ? nullableInteger(input.lunarDay) : null,
    isLeapMonth: isLunar && input.isLeapMonth === true,
    repeatType: REPEAT_TYPE_VALUES.includes(input.repeatType)
      ? input.repeatType
      : REPEAT_TYPES.NONE,
    notificationOffsets: normalizeNotificationOffsets(input.notificationOffsets),
    createdAt: nullableString(input.createdAt) ?? nowIso,
    updatedAt: nullableString(input.updatedAt) ?? nowIso,
  }
}

/**
 * Normalizes persisted or imported data and rejects unusable records.
 *
 * @param {unknown} value
 * @returns {MirikkokItem | null}
 */
export function normalizeStoredItem(value) {
  if (!value || typeof value !== 'object') return null

  try {
    return createItemModel(value)
  } catch {
    return null
  }
}
