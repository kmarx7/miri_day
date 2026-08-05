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

export function isCategory(value) {
  return CATEGORY_VALUES.includes(value)
}

export function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] ?? category
}
