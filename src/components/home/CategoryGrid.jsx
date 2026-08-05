import { CATEGORIES } from '../../constants/categories.js'
import { formatCurrency } from '../../utils/currency.js'

const CATEGORY_CARDS = [
  { category: CATEGORIES.TODO, label: '할 것', color: 'bg-cardBlue', accent: 'bg-[#78A6F5]' },
  { category: CATEGORIES.PAYMENT, label: '낼 것', color: 'bg-cardOrange', accent: 'bg-[#F0A65B]' },
  { category: CATEGORIES.SHOPPING, label: '살 것', color: 'bg-cardGreen', accent: 'bg-[#65B88A]' },
  { category: CATEGORIES.THOUGHT, label: '생각할 것', color: 'bg-cardPurple', accent: 'bg-[#AE82D7]' },
]

export default function CategoryGrid({ items, onSelect }) {
  return (
    <section aria-labelledby="category-heading">
      <div className="mb-3 flex items-end justify-between px-1">
        <h2 id="category-heading" className="text-base font-bold">한눈에 보기</h2>
        <span className="text-xs text-gray-400">완료 전 일정</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORY_CARDS.map(({ category, label, color, accent }) => {
          const categoryItems = items.filter((item) => item.category === category && !item.completed)
          const amount = categoryItems.reduce((sum, item) => sum + (item.amount ?? 0), 0)

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category)}
              className={`${color} flex min-h-28 flex-col items-start justify-between rounded-2xl p-4 text-left transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black`}
            >
              <span className={`h-2 w-2 rounded-full ${accent}`} aria-hidden="true" />
              <span className="mt-5 min-w-0">
                <span className="block text-base font-bold leading-snug">{label}</span>
                <span className="mt-1 block text-sm leading-snug text-gray-600">
                  {categoryItems.length}개{amount > 0 ? ` · ${formatCurrency(amount)}` : ' 남음'}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
