import { useMemo, useState } from 'react'
import { CATEGORIES } from '../constants/categories.js'
import CategoryGrid from '../components/home/CategoryGrid.jsx'
import MemoryBanner from '../components/home/MemoryBanner.jsx'
import TodayHighlights from '../components/home/TodayHighlights.jsx'
import ManagementLinks from '../components/home/ManagementLinks.jsx'
import { formatKoreanToday, formatYmd } from '../utils/dates.js'

export default function HomeScreen({ items, isSample, isPro, testProEnabled = false, onSelectCategory, onEditItem, onOpenReport, onOpenBackup, onOpenSettings }) {
  const [memoryExpanded, setMemoryExpanded] = useState(false)
  const [highlightsExpanded, setHighlightsExpanded] = useState(false)
  const today = formatYmd(new Date())

  const memories = useMemo(
    () => items.filter((item) => item.category === CATEGORIES.MEMORY && !item.completed),
    [items],
  )
  const highlights = useMemo(
    () => items.filter((item) => item.dueDate === today && !item.completed),
    [items, today],
  )

  return (
    <div>
      <header className="pb-6 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-3xl font-extrabold tracking-[-0.05em]">미리꼭</h1>
          <div className="flex items-center gap-2">
            {testProEnabled ? (
              <span className="rounded-full bg-white px-2.5 py-1 text-[0.625rem] font-semibold text-gray-500">테스트 Pro 활성화</span>
            ) : isSample ? (
              <span className="rounded-full bg-white px-2.5 py-1 text-[0.625rem] font-semibold text-gray-500">샘플 미리보기</span>
            ) : null}
            <button
              type="button"
              onClick={onOpenSettings}
              aria-label="설정 열기"
              className="grid h-11 w-11 place-items-center rounded-full border border-gray-200 bg-white text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
            >
              <span aria-hidden="true">⚙</span>
            </button>
          </div>
        </div>
        <p className="mt-4 text-sm font-semibold text-gray-600">{formatKoreanToday()}</p>
      </header>

      <div className="space-y-7">
        <MemoryBanner
          items={memories}
          expanded={memoryExpanded}
          onToggle={() => setMemoryExpanded((value) => !value)}
          onOpen={() => onSelectCategory(CATEGORIES.MEMORY)}
          isPro={isPro}
        />
        <CategoryGrid items={items} onSelect={onSelectCategory} />
        <TodayHighlights
          items={highlights}
          expanded={highlightsExpanded}
          onToggle={() => setHighlightsExpanded((value) => !value)}
          onEdit={onEditItem}
        />
        <ManagementLinks onOpenReport={onOpenReport} onOpenBackup={onOpenBackup} />
      </div>
    </div>
  )
}
