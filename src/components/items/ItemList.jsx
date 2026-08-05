import SwipeableItem from './SwipeableItem.jsx'

export default function ItemList({
  items,
  emptyMessage,
  onEdit,
  onComplete,
  onRestore,
  onDelete,
  completionLabel = '완료',
  showSwipeHint = false,
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      </div>
    )
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
        />
      ))}
    </div>
  )
}
