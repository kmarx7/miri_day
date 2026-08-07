import { CATEGORY_VALUES } from '../constants/categories.js'

export function getOccurrenceCategories(occurrences = []) {
  const presentCategories = new Set(
    occurrences.map((occurrence) => occurrence?.item?.category).filter(Boolean),
  )
  return CATEGORY_VALUES.filter((category) => presentCategories.has(category))
}
