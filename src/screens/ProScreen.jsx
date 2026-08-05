import { useState } from 'react'
import ScreenHeader from '../components/layout/ScreenHeader.jsx'
import { PRO_PRICING } from '../constants/pricing.js'
import { mockPurchaseService } from '../services/mockPurchaseService.js'
import { purchaseService, restorePurchases } from '../services/purchaseService.js'

const PRO_BENEFITS = [
  '아이템과 기억할 것 무제한',
  '매월·매년 반복 일정',
  '음력 기념일 매년 자동 변환',
  '사전 알림',
  '월별·연간 돈 리포트',
  '추가 테마',
  '생체인증 잠금',
  '향후 위젯 기능',
  '평생 업데이트',
]

const formatPrice = (price) => `${new Intl.NumberFormat('ko-KR').format(price)}원`

export default function ProScreen({ isPro = false, reason, onEntitlementChange }) {
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const handleRestore = async () => {
    setBusy(true)
    const result = await restorePurchases(purchaseService)
    setMessage(result.message ?? (result.success ? '구매 내역을 복원했어요.' : '복원할 구매 내역이 없어요.'))
    setBusy(false)
  }

  const setDevelopmentEntitlement = (enabled) => {
    const next = enabled
      ? mockPurchaseService.activateForDevelopment()
      : mockPurchaseService.resetForDevelopment()
    onEntitlementChange?.(next)
    setMessage(enabled ? '개발 모드에서 Pro를 활성화했어요.' : '개발 모드에서 Free로 전환했어요.')
  }

  return (
    <div className="pt-5">
      <ScreenHeader
        eyebrow={isPro ? '평생 이용권 활성화됨' : '한 번 구매하면 평생'}
        title="미리꼭 PRO"
        description="구독이 아닌 일회성 비소모성 평생 이용권이에요."
      />

      {reason?.message && !isPro && (
        <p className="mb-4 rounded-2xl border border-[#F3E5A6] bg-[#FFFEF5] px-4 py-3 text-sm font-semibold leading-relaxed text-[#6E5318]" role="status">
          {reason.message}
        </p>
      )}

      <section className="rounded-3xl bg-black p-6 text-white" aria-labelledby="pro-product-title">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="inline-flex rounded-full bg-[#FDE68A] px-3 py-1 text-xs font-bold text-[#5C4300]">{PRO_PRICING.promotionLabel}</p>
          <p className="rounded-full border border-white/20 px-3 py-1 text-xs font-bold text-white/80">{PRO_PRICING.discountPercent}% 할인</p>
        </div>
        <h2 id="pro-product-title" className="mt-6 text-lg font-bold">미리꼭 Pro 평생 이용권</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/70">한 번 구매하면 계속 사용할 수 있어요</p>
        <p className="mt-6 text-sm text-white/60 line-through">정가 {formatPrice(PRO_PRICING.regularPrice)}</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight">한정 할인가 {formatPrice(PRO_PRICING.launchPrice)}</p>
      </section>

      <section className="mt-6" aria-labelledby="pro-benefits-heading">
        <h2 id="pro-benefits-heading" className="px-1 text-base font-bold">Pro에서 열리는 기능</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {PRO_BENEFITS.map((benefit) => (
            <div key={benefit} className="flex min-h-14 items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#E8F8F0] text-xs font-bold text-[#287A4D]" aria-hidden="true">✓</span>
              <span className="text-sm font-semibold">{benefit}</span>
            </div>
          ))}
        </div>
      </section>

      <button
        type="button"
        disabled
        className={`mt-6 min-h-14 w-full rounded-2xl px-4 text-sm font-bold ${isPro ? 'bg-[#287A4D] text-white' : 'bg-gray-200 text-gray-500'}`}
      >
        {isPro ? 'Pro 평생 이용권 사용 중' : 'Google Play 결제 연결 전'}
      </button>
      <button
        type="button"
        onClick={handleRestore}
        disabled={busy}
        aria-busy={busy}
        className="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-600 disabled:text-gray-300"
      >
        {busy ? '구매 내역 확인 중…' : '구매 내역 복원'}
      </button>
      <p className="mt-3 text-center text-xs leading-relaxed text-gray-400">실제 구매와 복원은 Android의 Google Play Billing 연결 후 제공됩니다.</p>

      {import.meta.env.DEV && (
        <section className="mt-6 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4" aria-labelledby="development-controls-title">
          <h2 id="development-controls-title" className="text-sm font-bold text-amber-900">개발 모드 전용</h2>
          <p className="mt-1 text-xs leading-relaxed text-amber-700">실제 구매가 아닌 권한 화면 테스트용 제어입니다.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setDevelopmentEntitlement(true)} className="min-h-11 rounded-xl bg-black px-3 text-sm font-bold text-white">
              개발용 Pro 활성화
            </button>
            <button type="button" onClick={() => setDevelopmentEntitlement(false)} className="min-h-11 rounded-xl border border-amber-300 bg-white px-3 text-sm font-bold text-amber-900">
              개발용 Free 전환
            </button>
          </div>
        </section>
      )}

      {message && <p className="mt-4 text-center text-sm font-medium text-gray-600" role="status">{message}</p>}
    </div>
  )
}
