export function formatCurrency(value) {
  if (!Number.isFinite(value)) return ''
  return `₩${new Intl.NumberFormat('ko-KR').format(value)}`
}
