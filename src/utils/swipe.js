export const SWIPE_THRESHOLD = 80
export const SWIPE_LIMIT = 120

export const SWIPE_ACTIONS = Object.freeze({
  COMPLETE: 'complete',
  DELETE: 'delete',
  RESET: 'reset',
})

export function clampSwipeOffset(offset) {
  return Math.max(-SWIPE_LIMIT, Math.min(SWIPE_LIMIT, offset))
}

export function resolveSwipeAction(offset) {
  if (offset >= SWIPE_THRESHOLD) return SWIPE_ACTIONS.COMPLETE
  if (offset <= -SWIPE_THRESHOLD) return SWIPE_ACTIONS.DELETE
  return SWIPE_ACTIONS.RESET
}
