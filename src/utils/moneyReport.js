import { CATEGORIES } from '../constants/categories.js'
import { parseYmdParts } from './dates.js'

const MONEY_CATEGORIES = new Set([CATEGORIES.PAYMENT, CATEGORIES.SHOPPING])

function summarize(items) {
  return items.reduce((summary, item) => {
    const amount = Number.isFinite(item.amount) ? item.amount : 0
    summary.total += amount
    summary[item.completed ? 'completed' : 'planned'] += amount
    summary.categories[item.category] += amount
    summary.count += 1
    return summary
  }, {
    total: 0,
    completed: 0,
    planned: 0,
    count: 0,
    categories: {
      [CATEGORIES.PAYMENT]: 0,
      [CATEGORIES.SHOPPING]: 0,
    },
  })
}

/**
 * Calculates only dated payment and shopping items for the requested period.
 */
export function buildMoneyReport(items, { year, month }) {
  const validYear = Number.isInteger(year) ? year : new Date().getFullYear()
  const validMonth = Number.isInteger(month) && month >= 1 && month <= 12
    ? month
    : new Date().getMonth() + 1

  const annualItems = items.filter((item) => {
    if (!MONEY_CATEGORIES.has(item.category) || !Number.isFinite(item.amount)) return false
    const date = parseYmdParts(item.dueDate)
    return date?.year === validYear
  })
  const monthlyItems = annualItems.filter((item) => parseYmdParts(item.dueDate)?.month === validMonth)

  return {
    year: validYear,
    month: validMonth,
    monthly: summarize(monthlyItems),
    annual: summarize(annualItems),
  }
}
