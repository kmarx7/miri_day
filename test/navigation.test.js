import assert from 'node:assert/strict'
import test from 'node:test'
import {
  APP_HISTORY_DEPTH_KEY,
  APP_SCREEN_STATE_KEY,
  createScreenHistoryState,
  getHistoryDepth,
  getScreenFromHistory,
} from '../src/utils/navigation.js'

test('새 화면은 기존 상태를 보존하며 히스토리 깊이를 증가시킨다', () => {
  const next = createScreenHistoryState('calendar', { existing: true, [APP_HISTORY_DEPTH_KEY]: 1 })
  assert.equal(next.existing, true)
  assert.equal(next[APP_SCREEN_STATE_KEY], 'calendar')
  assert.equal(next[APP_HISTORY_DEPTH_KEY], 2)
})

test('화면 교체는 현재 히스토리 깊이를 유지한다', () => {
  const next = createScreenHistoryState('pro', { [APP_HISTORY_DEPTH_KEY]: 2 }, { replace: true })
  assert.equal(getHistoryDepth(next), 2)
})

test('알 수 없는 화면 상태는 홈으로 안전하게 복귀한다', () => {
  assert.equal(getScreenFromHistory({ [APP_SCREEN_STATE_KEY]: 'unknown' }, ['home', 'calendar'], 'home'), 'home')
  assert.equal(getHistoryDepth({ [APP_HISTORY_DEPTH_KEY]: -1 }), 0)
})
