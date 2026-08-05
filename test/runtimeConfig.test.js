import test from 'node:test'
import assert from 'node:assert/strict'
import { isIphoneTestProEnabled, resolveProStatus } from '../src/config/runtime.js'

test('아이폰 테스트 Pro는 문자열 true일 때만 활성화된다', () => {
  assert.equal(isIphoneTestProEnabled('true'), true)
  assert.equal(isIphoneTestProEnabled('false'), false)
  assert.equal(isIphoneTestProEnabled(undefined), false)
})

test('저장된 Pro 권한과 테스트 배포 권한 중 하나가 있으면 Pro로 판정한다', () => {
  assert.equal(resolveProStatus(true, undefined), true)
  assert.equal(resolveProStatus(false, 'true'), true)
  assert.equal(resolveProStatus(false, 'false'), false)
})
