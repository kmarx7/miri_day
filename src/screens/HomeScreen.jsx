import { useMemo, useState } from 'react'
import { CATEGORIES } from '../constants/categories.js'
import CategoryGrid from '../components/home/CategoryGrid.jsx'
import MemoryBanner from '../components/home/MemoryBanner.jsx'
import TodayHighlights from '../components/home/TodayHighlights.jsx'
import { formatKoreanToday, formatYmd } from '../utils/dates.js'

export default function HomeScreen({ items, isSample, onSelectCategory, onEditItem }) {
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
          <h1 className="text-2xl font-extrabold tracking-tight">미리꼭</h1>
          {isSample && <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-500">샘플 미리보기</span>}
        </div>
        <p className="mt-2 text-sm font-medium text-gray-600">{formatKoreanToday()}</p>
        <p className="mt-1 text-sm leading-relaxed text-gray-400">일정과 메모는 이 기기에 저장돼요 🔒</p>
      </header>

      <div className="space-y-7">
        <MemoryBanner
          items={memories}
          expanded={memoryExpanded}
          onToggle={() => setMemoryExpanded((value) => !value)}
          onOpen={() => onSelectCategory(CATEGORIES.MEMORY)}
        />
        <CategoryGrid items={items} onSelect={onSelectCategory} />
        <TodayHighlights
          items={highlights}
          expanded={highlightsExpanded}
          onToggle={() => setHighlightsExpanded((value) => !value)}
          onEdit={onEditItem}
        />
      </div>
    </div>
  )
}
