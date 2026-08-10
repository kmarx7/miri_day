import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_THEME,
  THEME_OPTIONS,
  THEME_VALUES,
  getThemeOption,
  isDarkTheme,
  isTheme,
  normalizeTheme,
} from '../src/constants/themes.js'

test('테마는 여섯 벌이고 값이 중복되지 않는다', () => {
  assert.equal(THEME_VALUES.length, 6)
  assert.equal(new Set(THEME_VALUES).size, 6)
  assert.equal(THEME_OPTIONS.length, 6)
})

test('모든 테마에 이름·설명·미리보기 색이 있다', () => {
  THEME_OPTIONS.forEach((option) => {
    assert.ok(isTheme(option.value))
    assert.ok(option.label.length > 0)
    assert.ok(option.description.length > 0)
    assert.match(option.chrome, /^#[0-9A-F]{6}$/i)
    assert.equal(option.swatch.length, 5)
    option.swatch.forEach((color) => assert.match(color, /^#[0-9A-F]{6}$/i))
    assert.ok(['light', 'dark'].includes(option.ground))
  })
})

test('기본 테마는 소프트 팝이다', () => {
  assert.equal(DEFAULT_THEME, 'soft')
  assert.equal(getThemeOption(DEFAULT_THEME).label, '소프트 팝')
})

test('목록에 없는 값은 기본 테마로 되돌린다', () => {
  assert.equal(normalizeTheme('없는테마'), DEFAULT_THEME)
  assert.equal(normalizeTheme(''), DEFAULT_THEME)
  assert.equal(normalizeTheme(undefined), DEFAULT_THEME)
  assert.equal(normalizeTheme(null), DEFAULT_THEME)
  assert.equal(normalizeTheme('hanji'), 'hanji')
})

test('어두운 바탕을 쓰는 테마는 미드나잇뿐이다', () => {
  const dark = THEME_OPTIONS.filter((option) => option.ground === 'dark')
  assert.deepEqual(dark.map((option) => option.value), ['midnight'])
  assert.equal(isDarkTheme('midnight'), true)
  assert.equal(isDarkTheme('soft'), false)
  assert.equal(isDarkTheme('없는테마'), false)
})
