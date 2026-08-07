import assert from 'node:assert/strict'
import test from 'node:test'
import { CATEGORIES } from '../src/constants/categories.js'
import { getOccurrenceCategories } from '../src/utils/calendar.js'

const occurrence = (category) => ({ item: { category } })

test('캘린더 날짜에 존재하는 카테고리를 중복 없이 정해진 순서로 표시한다', () => {
  const categories = getOccurrenceCategories([
    occurrence(CATEGORIES.PAYMENT),
    occurrence(CATEGORIES.TODO),
    occurrence(CATEGORIES.TODO),
    occurrence(CATEGORIES.SHOPPING),
  ])

  assert.deepEqual(categories, [
    CATEGORIES.TODO,
    CATEGORIES.PAYMENT,
    CATEGORIES.SHOPPING,
  ])
})

test('일정이 없거나 알 수 없는 카테고리는 표시하지 않는다', () => {
  assert.deepEqual(getOccurrenceCategories(), [])
  assert.deepEqual(getOccurrenceCategories([occurrence('unknown'), {}]), [])
})
