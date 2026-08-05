import { getCategoryLabel } from '../constants/categories.js'
import ItemList from '../components/items/ItemList.jsx'
import ScreenHeader from '../components/layout/ScreenHeader.jsx'
import { formatCurrency } from '../utils/currency.js'

export default function CategoryListScreen({ category, items, isSample, onBack, onEditItem }) {
  const categoryItems = items.filter((item) => item.category === category)
  const activeItems = categoryItems.filter((item) => !item.completed)
  const completedItems = categoryItems.filter((item) => item.completed)
  const amountTotal = activeItems.reduce((sum, item) => sum + (item.amount ?? 0), 0)

  return (
    <div className="pt-5">
      <ScreenHeader
        eyebrow={isSample ? '샘플 미리보기' : `${activeItems.length}개 남음`}
        title={getCategoryLabel(category)}
        description={amountTotal > 0 ? `남은 금액 ${formatCurrency(amountTotal)}` : '미리 기록하고 하나씩 정리해요.'}
        onBack={onBack}
      />

      <section aria-labelledby="active-items-heading">
        <h2 id="active-items-heading" className="mb-3 px-1 text-sm font-bold">진행 중 {activeItems.length}</h2>
        <ItemList items={activeItems} emptyMessage="진행 중인 항목이 없어요." onEdit={onEditItem} />
      </section>

      {completedItems.length > 0 && (
        <section className="mt-8" aria-labelledby="completed-items-heading">
          <h2 id="completed-items-heading" className="mb-3 px-1 text-sm font-bold text-gray-400">완료 {completedItems.length}</h2>
          <ItemList items={completedItems} emptyMessage="완료한 항목이 없어요." onEdit={onEditItem} />
        </section>
      )}
    </div>
  )
}
