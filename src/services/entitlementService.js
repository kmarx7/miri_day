import { CATEGORIES } from '../constants/categories.js'

export const FREE_LIMITS = Object.freeze({
  totalItems: 50,
  memoryItems: 5,
  themes: 1,
})

export const FEATURES = Object.freeze({
  CREATE_ITEM: 'createItem',
  CREATE_MEMORY: 'createMemory',
  BASIC_THEME: 'basicTheme',
  MANUAL_LUNAR: 'manualLunar',
  BASIC_BACKUP: 'basicBackup',
  BASIC_DDAY: 'basicDDay',
  RECURRING_SCHEDULES: 'recurringSchedules',
  LUNAR_AUTO_CONVERSION: 'lunarAutoConversion',
  ADVANCE_NOTIFICATIONS: 'advanceNotifications',
  MONEY_REPORT_DETAIL: 'moneyReportDetail',
  PRO_THEMES: 'proThemes',
  BIOMETRIC_LOCK: 'biometricLock',
  WIDGETS: 'widgets',
  LIFETIME_UPDATES: 'lifetimeUpdates',
})

export const PAYWALL_TRIGGERS = Object.freeze({
  ITEM_LIMIT: 'itemLimit',
  MEMORY_LIMIT: 'memoryLimit',
  RECURRING_SCHEDULE: 'recurringSchedule',
  MONEY_REPORT: 'moneyReport',
  PRO_THEME: 'proTheme',
  PRO_FEATURE: 'proFeature',
})

const FREE_FEATURES = new Set([
  FEATURES.BASIC_THEME,
  FEATURES.MANUAL_LUNAR,
  FEATURES.BASIC_BACKUP,
  FEATURES.BASIC_DDAY,
])

const TRIGGERS_BY_FEATURE = Object.freeze({
  [FEATURES.CREATE_ITEM]: PAYWALL_TRIGGERS.ITEM_LIMIT,
  [FEATURES.CREATE_MEMORY]: PAYWALL_TRIGGERS.MEMORY_LIMIT,
  [FEATURES.RECURRING_SCHEDULES]: PAYWALL_TRIGGERS.RECURRING_SCHEDULE,
  [FEATURES.MONEY_REPORT_DETAIL]: PAYWALL_TRIGGERS.MONEY_REPORT,
  [FEATURES.PRO_THEMES]: PAYWALL_TRIGGERS.PRO_THEME,
})

const MESSAGES_BY_TRIGGER = Object.freeze({
  [PAYWALL_TRIGGERS.ITEM_LIMIT]: 'Free에서는 전체 아이템을 최대 50개까지 저장할 수 있어요.',
  [PAYWALL_TRIGGERS.MEMORY_LIMIT]: 'Free에서는 기억할 것을 최대 5개까지 저장할 수 있어요.',
  [PAYWALL_TRIGGERS.RECURRING_SCHEDULE]: '반복 일정은 Pro에서 사용할 수 있어요.',
  [PAYWALL_TRIGGERS.MONEY_REPORT]: '월별·연간 돈 리포트 상세는 Pro 기능이에요.',
  [PAYWALL_TRIGGERS.PRO_THEME]: '추가 테마는 Pro에서 사용할 수 있어요.',
  [PAYWALL_TRIGGERS.PRO_FEATURE]: '이 기능은 Pro에서 사용할 수 있어요.',
})

export function canUseFeature(feature, { isPro = false, itemCount = 0, memoryCount = 0 } = {}) {
  if (isPro || FREE_FEATURES.has(feature)) return true
  if (feature === FEATURES.CREATE_ITEM) return itemCount < FREE_LIMITS.totalItems
  if (feature === FEATURES.CREATE_MEMORY) return memoryCount < FREE_LIMITS.memoryItems
  return false
}

export function requirePro(feature, context = {}, onRequired) {
  const allowed = canUseFeature(feature, context)
  const trigger = TRIGGERS_BY_FEATURE[feature] ?? PAYWALL_TRIGGERS.PRO_FEATURE
  const decision = {
    allowed,
    requiresPro: !allowed,
    feature,
    trigger,
    message: allowed ? '' : MESSAGES_BY_TRIGGER[trigger],
  }

  if (!allowed) onRequired?.(decision)
  return decision
}

export function evaluateItemCreation(items, input, isPro = false) {
  const context = {
    isPro,
    itemCount: items.length,
    memoryCount: items.filter((item) => item.category === CATEGORIES.MEMORY).length,
  }

  const itemDecision = requirePro(FEATURES.CREATE_ITEM, context)
  if (!itemDecision.allowed) return itemDecision
  if (input?.category === CATEGORIES.MEMORY) return requirePro(FEATURES.CREATE_MEMORY, context)
  return itemDecision
}
