export const MEMORY_KINDS = Object.freeze({
  BIRTHDAY: 'birthday',
  ANNIVERSARY: 'anniversary',
  MEMORIAL: 'memorial',
  ETC: 'etc',
})

export const MEMORY_KIND_VALUES = Object.freeze(Object.values(MEMORY_KINDS))

// 새로 추가할 때의 기본값입니다. 종류가 없는 예전 기록은 ETC로 정규화합니다.
export const DEFAULT_MEMORY_KIND = MEMORY_KINDS.BIRTHDAY
export const FALLBACK_MEMORY_KIND = MEMORY_KINDS.ETC

export const MEMORY_KIND_LABELS = Object.freeze({
  [MEMORY_KINDS.BIRTHDAY]: '생일',
  [MEMORY_KINDS.ANNIVERSARY]: '기념일',
  [MEMORY_KINDS.MEMORIAL]: '추도일',
  [MEMORY_KINDS.ETC]: '기타',
})

export const MEMORY_KIND_EMOJIS = Object.freeze({
  [MEMORY_KINDS.BIRTHDAY]: '🎂',
  [MEMORY_KINDS.ANNIVERSARY]: '🎉',
  [MEMORY_KINDS.MEMORIAL]: '🌹',
  [MEMORY_KINDS.ETC]: '📌',
})

export function isMemoryKind(value) {
  return MEMORY_KIND_VALUES.includes(value)
}

export function getMemoryKindLabel(value) {
  return MEMORY_KIND_LABELS[value] ?? MEMORY_KIND_LABELS[FALLBACK_MEMORY_KIND]
}

export function getMemoryKindEmoji(value) {
  return MEMORY_KIND_EMOJIS[value] ?? MEMORY_KIND_EMOJIS[FALLBACK_MEMORY_KIND]
}
