import ScreenHeader from '../components/layout/ScreenHeader.jsx'

const PRO_BENEFITS = [
  '모든 테마와 앱 아이콘',
  '음력 기념일 매년 자동 변환',
  '월별·연간 돈 리포트',
  '기억할 것 무제한과 반복 일정',
  '생체인증 잠금과 암호화 백업',
  '홈 화면 위젯 3종',
  '평생 업데이트',
]

export default function ProScreen() {
  return (
    <div className="pt-5">
      <ScreenHeader
        eyebrow="한 번 구매하면 평생"
        title="미리꼭 PRO"
        description="자주 챙기는 일정은 더 편하게, 중요한 기록은 더 든든하게 관리해요."
      />

      <section className="rounded-3xl bg-black p-6 text-white">
        <p className="inline-flex rounded-full bg-[#FDE68A] px-3 py-1 text-xs font-bold text-[#5C4300]">출시 기념 한정 할인</p>
        <p className="mt-6 text-sm text-white/60 line-through">정가 9,900원</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight">한정 할인가 5,900원</p>
        <p className="mt-2 text-sm font-bold text-[#FDE68A]">40% 할인</p>
      </section>

      <section className="mt-6" aria-labelledby="pro-benefits-heading">
        <h2 id="pro-benefits-heading" className="px-1 text-base font-bold">PRO에서 열리는 기능</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {PRO_BENEFITS.map((benefit) => (
            <div key={benefit} className="flex min-h-14 items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#E8F8F0] text-xs font-bold text-[#287A4D]">✓</span>
              <span className="text-sm font-semibold">{benefit}</span>
            </div>
          ))}
        </div>
      </section>

      <button
        type="button"
        disabled
        className="mt-6 min-h-14 w-full rounded-2xl bg-gray-200 px-4 text-sm font-bold text-gray-500"
      >
        한정 할인가 5,900원으로 시작하기
      </button>
      <p className="mt-3 text-center text-xs leading-relaxed text-gray-400">결제는 Android 앱의 Google Play Billing 단계에서 연결합니다.</p>
    </div>
  )
}
