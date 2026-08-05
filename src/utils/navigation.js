export const APP_SCREEN_STATE_KEY = 'mirikkokScreen'
export const APP_HISTORY_DEPTH_KEY = 'mirikkokHistoryDepth'
const ITEM_EDITOR_HISTORY_KEY = 'mirikkokItemEditor'

export function getHistoryDepth(state) {
  const depth = state?.[APP_HISTORY_DEPTH_KEY]
  return Number.isInteger(depth) && depth >= 0 ? depth : 0
}

export function createScreenHistoryState(screen, currentState, { replace = false, consumeModal = false } = {}) {
  const currentDepth = getHistoryDepth(currentState)
  const baseState = currentState && typeof currentState === 'object' ? { ...currentState } : {}
  delete baseState[ITEM_EDITOR_HISTORY_KEY]
  return {
    ...baseState,
    [APP_SCREEN_STATE_KEY]: screen,
    [APP_HISTORY_DEPTH_KEY]: currentDepth + (!replace || consumeModal ? 1 : 0),
  }
}

export function getScreenFromHistory(state, validScreens, fallback) {
  const screen = state?.[APP_SCREEN_STATE_KEY]
  return validScreens.includes(screen) ? screen : fallback
}

export function shouldNavigateBack(state) {
  return state?.[ITEM_EDITOR_HISTORY_KEY] === true || getHistoryDepth(state) > 0
}
