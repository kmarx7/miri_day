import { CATEGORIES } from '../constants/categories.js'
import { parseCurrencyInput } from './currency.js'
import { formatYmd } from './dates.js'

export function createQuickItemValues({
  category,
  title,
  amount = '',
  dueDate = '',
  dueTime = '',
  memo = '',
}, now = new Date()) {
  const normalizedTitle = typeof title === 'string' ? title.trim() : ''
  if (!normalizedTitle) return null

  const normalizedDueTime = typeof dueTime === 'string' ? dueTime.trim() : ''
  const normalizedDueDate = dueDate || (normalizedDueTime ? formatYmd(now) : null)
  const hasAmount = category === CATEGORIES.PAYMENT || category === CATEGORIES.SHOPPING

  return {
    category,
    title: normalizedTitle,
    amount: hasAmount ? parseCurrencyInput(amount) : null,
    dueDate: normalizedDueDate || null,
    dueTime: normalizedDueDate && normalizedDueTime ? normalizedDueTime : null,
    memo: typeof memo === 'string' ? memo.trim() : '',
    notificationOffsets: normalizedDueDate ? [0] : [],
  }
}
