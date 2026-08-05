import assert from 'node:assert/strict'
import test from 'node:test'
import {
  SWIPE_ACTIONS,
  SWIPE_LIMIT,
  clampSwipeOffset,
  resolveSwipeAction,
} from '../src/utils/swipe.js'

test('오른쪽 80px 이상은 완료 처리한다', () => {
  assert.equal(resolveSwipeAction(80), SWIPE_ACTIONS.COMPLETE)
  assert.equal(resolveSwipeAction(120), SWIPE_ACTIONS.COMPLETE)
})

test('왼쪽 80px 이상은 삭제 처리한다', () => {
  assert.equal(resolveSwipeAction(-80), SWIPE_ACTIONS.DELETE)
  assert.equal(resolveSwipeAction(-120), SWIPE_ACTIONS.DELETE)
})

test('임계값 미만은 원래 위치로 복귀한다', () => {
  assert.equal(resolveSwipeAction(79), SWIPE_ACTIONS.RESET)
  assert.equal(resolveSwipeAction(-79), SWIPE_ACTIONS.RESET)
})

test('드래그 거리는 표시 한계 안으로 제한한다', () => {
  assert.equal(clampSwipeOffset(300), SWIPE_LIMIT)
  assert.equal(clampSwipeOffset(-300), -SWIPE_LIMIT)
  assert.equal(clampSwipeOffset(35), 35)
})
