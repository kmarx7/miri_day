import SwipeableItem from './SwipeableItem.jsx'
import StatePanel from '../feedback/StatePanel.jsx'

export default function ItemList({
  items,
  emptyMessage,
  onEdit,
  onComplete,
  onRestore,
  onDelete,
  completionLabel = '완료',
  showSwipeHint = false,
  expandedMemoId = null,
  onToggleMemo,
}) {
  if (items.length === 0) {
    return <StatePanel title={emptyMessage} />
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {items.map((item, index) => (
        <SwipeableItem
          key={item.id}
          item={item}
          completionLabel={completionLabel}
          onEdit={onEdit}
          onComplete={onComplete}
          onRestore={onRestore}
          onDelete={onDelete}
          showSwipeHint={showSwipeHint && index === 0}
          memoExpanded={expandedMemoId === item.id}
          onToggleMemo={onToggleMemo}
        />
      ))}
    </div>
  )
}
