import { CATEGORIES, getCategoryLabel } from '../constants/categories.js'
import {
  NOTIFICATION_HOUR_KST,
  NOTIFICATION_OFFSET_LABELS,
  NOTIFICATION_OWNER,
  NOTIFICATION_SCHEDULE_DAYS,
  getAllowedNotificationOffsets,
} from '../constants/notifications.js'
import { REPEAT_TYPES } from '../models/item.js'
import { addDaysToYmd, formatYmd, parseYmdParts } from './dates.js'
import { getOccurrencesForRange } from './recurrence.js'

const MAX_ANDROID_NOTIFICATION_ID = 2_147_483_647

export function createSeoulNotificationDate(value, time = NOTIFICATION_HOUR_KST) {
  const parts = parseYmdParts(value)
  if (!parts) return null

  let hour
  let minute = 0
  if (typeof time === 'string') {
    const match = /^(?:([01]\d|2[0-3])):([0-5]\d)$/.exec(time)
    if (!match) return null
    hour = Number(match[1])
    minute = Number(match[2])
  } else {
    hour = time
  }
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null

  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, hour - 9, minute))
}

function hashNotificationKey(key) {
  let hash = 2_166_136_261
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619)
  }
  return hash >>> 0
}

export function allocateNotificationId(key, reservedIds = new Map()) {
  let id = hashNotificationKey(key) & MAX_ANDROID_NOTIFICATION_ID
  if (id === 0) id = 1

  while (reservedIds.has(id) && reservedIds.get(id) !== key) {
    id = id === MAX_ANDROID_NOTIFICATION_ID ? 1 : id + 1
  }
  reservedIds.set(id, key)
  return id
}

export function createNotificationKey(itemId, occurrenceDate, offset) {
  return `${itemId}:${occurrenceDate}:${offset}`
}

function getNotificationKind(item) {
  if (item.isLunar) return '음력 기념일'
  if (item.repeatType !== REPEAT_TYPES.NONE) return '반복 일정'
  if (item.category === CATEGORIES.PAYMENT) return '납부 일정'
  if (item.category === CATEGORIES.SHOPPING) return '구매 일정'
  if (item.category === CATEGORIES.MEMORY) return '기념일'
  return getCategoryLabel(item.category)
}

function getOccurrences(item, now, isPro, scheduleDays) {
  const rangeStart = formatYmd(now)
  const rangeEnd = addDaysToYmd(rangeStart, scheduleDays)
  if (!rangeStart || !rangeEnd) return []

  return getOccurrencesForRange([item], rangeStart, rangeEnd, {
    includeRecurring: isPro,
  })
}

export function buildItemNotificationPlans(item, {
  isPro = false,
  now = new Date(),
  scheduleDays = NOTIFICATION_SCHEDULE_DAYS,
  reservedIds = new Map(),
} = {}) {
  if (!item?.id || !item.dueDate || item.completed) return []

  const allowedOffsets = new Set(getAllowedNotificationOffsets(isPro))
  const offsets = [...new Set(item.notificationOffsets ?? [])]
    .filter((offset) => allowedOffsets.has(offset))
  if (offsets.length === 0) return []

  const plans = []
  const seenKeys = new Set()
  for (const occurrence of getOccurrences(item, now, isPro, scheduleDays)) {
    for (const offset of offsets) {
      const notificationDate = addDaysToYmd(occurrence.date, -offset)
      const at = createSeoulNotificationDate(notificationDate, item.dueTime ?? NOTIFICATION_HOUR_KST)
      if (!at || at.getTime() <= now.getTime()) continue

      const notificationKey = createNotificationKey(item.id, occurrence.date, offset)
      if (seenKeys.has(notificationKey)) continue
      seenKeys.add(notificationKey)

      const kind = getNotificationKind(item)
      const timing = NOTIFICATION_OFFSET_LABELS[offset] ?? `D-${offset}`
      plans.push({
        id: allocateNotificationId(notificationKey, reservedIds),
        title: `미리꼭 · ${kind}`,
        body: `${timing} · ${item.title}`,
        schedule: { at },
        extra: {
          managedBy: NOTIFICATION_OWNER,
          notificationKey,
          itemId: item.id,
          occurrenceDate: occurrence.date,
          offset,
          category: item.category,
          repeatType: item.repeatType,
          isLunar: item.isLunar,
        },
      })
    }
  }
  return plans
}

export function buildNotificationPlans(items, options = {}) {
  const reservedIds = options.reservedIds ?? new Map()
  return items.flatMap((item) => buildItemNotificationPlans(item, {
    ...options,
    reservedIds,
  }))
}

export function buildTestNotificationPlan(now = new Date()) {
  const at = new Date(now.getTime() + 5 * 60 * 1000)
  const notificationKey = `test:${at.getTime()}`
  return {
    id: allocateNotificationId(notificationKey),
    title: '미리꼭 · 테스트 알림',
    body: '5분 후 테스트 알림이 정상적으로 도착했어요.',
    schedule: { at },
    extra: {
      managedBy: NOTIFICATION_OWNER,
      notificationKey,
      test: true,
    },
  }
}
