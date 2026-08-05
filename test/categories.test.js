import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CATEGORIES,
  CATEGORY_ACTION_COLORS,
  getCategoryActionColor,
} from '../src/constants/categories.js'

test('모든 카테고리에 목록 추가 버튼 색상이 정의되어 있다', () => {
  Object.values(CATEGORIES).forEach((category) => {
    assert.match(CATEGORY_ACTION_COLORS[category], /^#[0-9A-F]{6}$/i)
    assert.equal(getCategoryActionColor(category), CATEGORY_ACTION_COLORS[category])
  })
})

test('알 수 없는 카테고리의 추가 버튼은 기본 검은색을 사용한다', () => {
  assert.equal(getCategoryActionColor('unknown'), '#171717')
})
