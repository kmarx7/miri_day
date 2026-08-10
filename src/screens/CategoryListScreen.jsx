import { useEffect, useState } from 'react'
import { CATEGORIES, getCategoryLabel, getCompletionLabel } from '../constants/categories.js'
import ItemList from '../components/items/ItemList.jsx'
import CategoryQuickAdd from '../components/input/CategoryQuickAdd.jsx'
import ScreenHeader from '../components/layout/ScreenHeader.jsx'
import { formatCurrency } from '../utils/currency.js'

export default function CategoryListScreen({
  category,
  items,
  isSample,
  onBack,
  onEditItem,
  onCompleteItem,
  onRestoreItem,
  onDeleteItem,
  showSwipeHint,
  onSwipeHintShown,
  onQuickAdd,
  onAddMemory,
}) {
  const [completedExpanded, setCompletedExpanded] = useState(true)
  const [expandedMemoId, setExpandedMemoId] = useState(null)
  const [displaySwipeHint] = useState(showSwipeHint)
  const isMemory = category === CATEGORIES.MEMORY
  const categoryItems = items.filter((item) => item.category === category)
  const activeItems = categoryItems.filter((item) => !item.completed)
  const completedItems = categoryItems.filter((item) => item.completed)
  const amountTotal = activeItems.reduce((sum, item) => sum + (item.amount ?? 0), 0)
  const completionLabel = getCompletionLabel(category)
  const toggleMemo = (id) => setExpandedMemoId((current) => (current === id ? null : id))

  useEffect(() => {
    if (!isSample && displaySwipeHint && activeItems.length > 0) onSwipeHintShown?.()
  }, [activeItems.length, displaySwipeHint, isSample, onSwipeHintShown])

  return (
    <div className={`category-screen pt-5 ${isMemory ? 'category-screen-plain' : ''}`}>
      <ScreenHeader
        eyebrow={isSample ? '샘플 미리보기' : `${activeItems.length}개 남음`}
        title={getCategoryLabel(category)}
        description={amountTotal > 0 ? `남은 금액 ${formatCurrency(amountTotal)}` : '미리 기록하고 하나씩 정리해요.'}
        onBack={onBack}
      />

      {isMemory && (
        <button type="button" onClick={onAddMemory} className="memory-add-button mb-6">
          <span aria-hidden="true">＋</span> 추가
        </button>
      )}

      <section aria-labelledby="active-items-heading">
        <h2 id="active-items-heading" className="mb-3 px-1 text-sm font-bold">진행 중 {activeItems.length}</h2>
        <ItemList
          items={activeItems}
          emptyMessage="진행 중인 항목이 없어요."
          onEdit={onEditItem}
          onComplete={isSample ? undefined : onCompleteItem}
          onDelete={isSample ? undefined : onDeleteItem}
          completionLabel={completionLabel}
          showSwipeHint={!isSample && displaySwipeHint}
          expandedMemoId={expandedMemoId}
          onToggleMemo={toggleMemo}
        />
      </section>

      {completedItems.length > 0 && (
        <section className="mt-8" aria-labelledby="completed-items-heading">
          <button
            type="button"
            onClick={() => setCompletedExpanded((expanded) => !expanded)}
            aria-expanded={completedExpanded}
            aria-controls="completed-items-list"
            className="mb-3 flex min-h-11 w-full items-center justify-between rounded-xl px-1 text-left text-sm font-bold text-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
          >
            <span id="completed-items-heading">완료 {completedItems.length}</span>
            <span aria-hidden="true" className={`text-lg transition-transform ${completedExpanded ? 'rotate-180' : ''}`}>⌄</span>
          </button>
          {completedExpanded && (
            <div id="completed-items-list">
              <ItemList
                items={completedItems}
                emptyMessage="완료한 항목이 없어요."
                onEdit={onEditItem}
                onRestore={isSample ? undefined : onRestoreItem}
                onDelete={isSample ? undefined : onDeleteItem}
                completionLabel={completionLabel}
                expandedMemoId={expandedMemoId}
                onToggleMemo={toggleMemo}
              />
            </div>
          )}
        </section>
      )}
      {!isMemory && <CategoryQuickAdd category={category} onSave={onQuickAdd} />}
    </div>
  )
}
