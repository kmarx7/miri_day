import { useMemo, useState } from 'react'
import ScreenHeader from '../components/layout/ScreenHeader.jsx'
import StatePanel from '../components/feedback/StatePanel.jsx'
import { CATEGORIES, getCategoryLabel } from '../constants/categories.js'
import { formatCurrency } from '../utils/currency.js'
import { formatYmd, parseYmdParts } from '../utils/dates.js'
import { buildMoneyReport } from '../utils/moneyReport.js'

function AmountRow({ label, amount, emphasis = false }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 border-b border-gray-100 py-3 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <strong className={emphasis ? 'text-base text-black' : 'text-sm text-gray-700'}>{formatCurrency(amount)}</strong>
    </div>
  )
}

function DetailCard({ title, summary }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4" aria-labelledby={`${title}-heading`}>
      <h2 id={`${title}-heading`} className="text-sm font-bold">{title}</h2>
      <div className="mt-2">
        <AmountRow label="전체" amount={summary.total} emphasis />
        <AmountRow label="완료된 금액" amount={summary.completed} />
        <AmountRow label="예정 금액" amount={summary.planned} />
        <AmountRow label={getCategoryLabel(CATEGORIES.PAYMENT)} amount={summary.categories[CATEGORIES.PAYMENT]} />
        <AmountRow label={getCategoryLabel(CATEGORIES.SHOPPING)} amount={summary.categories[CATEGORIES.SHOPPING]} />
      </div>
    </section>
  )
}

export default function MoneyReportScreen({ items, isPro, isSample, onBack, onRequirePro }) {
  const today = parseYmdParts(formatYmd(new Date()))
  const [period, setPeriod] = useState(() => ({ year: today.year, month: today.month }))
  const report = useMemo(() => buildMoneyReport(items, period), [items, period])
  const isEmpty = report.monthly.count === 0 && report.annual.count === 0

  const changeMonth = (amount) => {
    const next = new Date(period.year, period.month - 1 + amount, 1)
    setPeriod({ year: next.getFullYear(), month: next.getMonth() + 1 })
  }

  return (
    <div className="pt-5">
      <ScreenHeader
        eyebrow={isSample ? '샘플 데이터 기준' : '낼 것 + 살 것'}
        title="돈 리포트"
        description="완료한 금액과 앞으로 쓸 금액을 한눈에 확인해요."
        onBack={onBack}
      />

      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-2">
        <button type="button" onClick={() => changeMonth(-1)} aria-label="이전 달" className="grid h-11 w-11 place-items-center rounded-xl bg-gray-100 text-xl">‹</button>
        <strong className="text-sm" aria-live="polite">{period.year}년 {period.month}월</strong>
        <button type="button" onClick={() => changeMonth(1)} aria-label="다음 달" className="grid h-11 w-11 place-items-center rounded-xl bg-gray-100 text-xl">›</button>
      </div>

      {isEmpty ? (
        <div className="mt-4">
          <StatePanel title="표시할 금액이 없어요" description="날짜와 금액이 있는 낼 것 또는 살 것을 추가해 보세요." />
        </div>
      ) : (
        <>
          <section className="mt-4 rounded-3xl bg-black p-5 text-white" aria-label="돈 리포트 요약">
            <p className="text-xs font-semibold text-white/60">{period.month}월 합계</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight">{formatCurrency(report.monthly.total)}</p>
            <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4 text-sm">
              <span className="text-white/60">{period.year}년 합계</span>
              <strong>{formatCurrency(report.annual.total)}</strong>
            </div>
          </section>

          {isPro ? (
            <div className="mt-4 space-y-4">
              <DetailCard title={`${period.month}월 상세`} summary={report.monthly} />
              <DetailCard title={`${period.year}년 상세`} summary={report.annual} />
            </div>
          ) : (
            <section className="mt-4 rounded-2xl border border-[#F3E5A6] bg-[#FFFEF5] p-5 text-center">
              <p className="text-sm font-bold text-[#6E5318]">완료·예정 금액과 카테고리별 상세</p>
              <p className="mt-2 text-xs leading-relaxed text-[#8A6A25]">상세 리포트는 Pro에서 확인할 수 있어요.</p>
              <button type="button" onClick={onRequirePro} className="mt-4 min-h-11 rounded-xl bg-black px-5 text-sm font-bold text-white">
                상세 리포트 보기
              </button>
            </section>
          )}
        </>
      )}
    </div>
  )
}
