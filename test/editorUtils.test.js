import assert from 'node:assert/strict'
import test from 'node:test'
import { formatCurrencyInput, parseCurrencyInput } from '../src/utils/currency.js'
import { DATE_PRESETS, getDatePresetValue, inferDatePreset } from '../src/utils/dates.js'

test('원화 입력은 쉼표로 표시하고 숫자로 변환한다', () => {
  assert.equal(formatCurrencyInput('₩ 90,000'), '90,000')
  assert.equal(parseCurrencyInput('90,000원'), 90000)
  assert.equal(parseCurrencyInput(''), null)
})

test('오늘, 내일, 이번 주 날짜 프리셋을 계산한다', () => {
  const now = new Date(2026, 7, 5)

  assert.equal(getDatePresetValue(DATE_PRESETS.TODAY, now), '2026-08-05')
  assert.equal(getDatePresetValue(DATE_PRESETS.TOMORROW, now), '2026-08-06')
  assert.equal(getDatePresetValue(DATE_PRESETS.THIS_WEEK, now), '2026-08-08')
  assert.equal(inferDatePreset('2026-08-06', now), DATE_PRESETS.TOMORROW)
  assert.equal(inferDatePreset('2026-08-20', now), DATE_PRESETS.CUSTOM)
})
