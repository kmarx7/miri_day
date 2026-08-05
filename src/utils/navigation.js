export const APP_SCREEN_STATE_KEY = 'mirikkokScreen'
export const APP_HISTORY_DEPTH_KEY = 'mirikkokHistoryDepth'

export function getHistoryDepth(state) {
  const depth = state?.[APP_HISTORY_DEPTH_KEY]
  return Number.isInteger(depth) && depth >= 0 ? depth : 0
}

export function createScreenHistoryState(screen, currentState, { replace = false } = {}) {
  const currentDepth = getHistoryDepth(currentState)
  return {
    ...(currentState && typeof currentState === 'object' ? currentState : {}),
    [APP_SCREEN_STATE_KEY]: screen,
    [APP_HISTORY_DEPTH_KEY]: replace ? currentDepth : currentDepth + 1,
  }
}

export function getScreenFromHistory(state, validScreens, fallback) {
  const screen = state?.[APP_SCREEN_STATE_KEY]
  return validScreens.includes(screen) ? screen : fallback
}
