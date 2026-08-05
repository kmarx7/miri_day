export default function ManagementLinks({ onOpenReport, onOpenBackup }) {
  return (
    <section aria-labelledby="management-heading">
      <h2 id="management-heading" className="text-base font-bold">기록 관리</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onOpenReport}
          className="min-h-24 rounded-2xl border border-gray-200 bg-white p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
        >
          <span className="block text-lg" aria-hidden="true">₩</span>
          <span className="mt-2 block text-sm font-bold">돈 리포트</span>
          <span className="mt-1 block text-xs leading-relaxed text-gray-400">월별·연간 금액 보기</span>
        </button>
        <button
          type="button"
          onClick={onOpenBackup}
          className="min-h-24 rounded-2xl border border-gray-200 bg-white p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
        >
          <span className="block text-lg" aria-hidden="true">↕</span>
          <span className="mt-2 block text-sm font-bold">백업·복원</span>
          <span className="mt-1 block text-xs leading-relaxed text-gray-400">JSON으로 안전하게 보관</span>
        </button>
      </div>
    </section>
  )
}
