export const CATEGORIES = Object.freeze({
  TODO: 'todo',
  PAYMENT: 'payment',
  SHOPPING: 'shopping',
  THOUGHT: 'thought',
  MEMORY: 'memory',
})

export const CATEGORY_LABELS = Object.freeze({
  [CATEGORIES.TODO]: '할 것',
  [CATEGORIES.PAYMENT]: '낼 것',
  [CATEGORIES.SHOPPING]: '살 것',
  [CATEGORIES.THOUGHT]: '생각할 것',
  [CATEGORIES.MEMORY]: '기억할 것',
})

export const CATEGORY_VALUES = Object.freeze(Object.values(CATEGORIES))

export const CATEGORY_COMPLETION_LABELS = Object.freeze({
  [CATEGORIES.TODO]: '완료',
  [CATEGORIES.PAYMENT]: '냈다',
  [CATEGORIES.SHOPPING]: '샀다',
  [CATEGORIES.THOUGHT]: '보관',
  [CATEGORIES.MEMORY]: '확인',
})

export const CATEGORY_COLORS = Object.freeze({
  [CATEGORIES.TODO]: '#78A6F5',
  [CATEGORIES.PAYMENT]: '#F0A65B',
  [CATEGORIES.SHOPPING]: '#65B88A',
  [CATEGORIES.THOUGHT]: '#AE82D7',
  [CATEGORIES.MEMORY]: '#E5B840',
})

export function isCategory(value) {
  return CATEGORY_VALUES.includes(value)
}

export function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] ?? category
}

export function getCompletionLabel(category) {
  return CATEGORY_COMPLETION_LABELS[category] ?? '완료'
}

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] ?? '#9CA3AF'
}
