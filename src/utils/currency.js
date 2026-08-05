export function formatCurrency(value) {
  if (!Number.isFinite(value)) return ''
  return `₩${new Intl.NumberFormat('ko-KR').format(value)}`
}

export function formatCurrencyInput(value) {
  const amount = parseCurrencyInput(value)
  return amount === null ? '' : new Intl.NumberFormat('ko-KR').format(amount)
}

export function parseCurrencyInput(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) return null

  const amount = Number(digits)
  return Number.isSafeInteger(amount) ? amount : null
}
