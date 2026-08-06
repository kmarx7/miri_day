import { CATEGORIES } from '../../constants/categories.js'
import { formatCurrency } from '../../utils/currency.js'

const CATEGORY_CARDS = [
  { category: CATEGORIES.TODO, label: '할 것', color: 'bg-cardBlue', iconColor: 'text-[#2F6FDB]', iconBackground: 'bg-[#DCEAFF]' },
  { category: CATEGORIES.PAYMENT, label: '낼 것', color: 'bg-cardOrange', iconColor: 'text-[#E95519]', iconBackground: 'bg-[#FFE8C7]' },
  { category: CATEGORIES.SHOPPING, label: '살 것', color: 'bg-cardGreen', iconColor: 'text-[#16A36A]', iconBackground: 'bg-[#CFF7E6]' },
  { category: CATEGORIES.THOUGHT, label: '생각할 것', color: 'bg-cardPurple', iconColor: 'text-[#7C3AED]', iconBackground: 'bg-[#EAE4FF]' },
]

function CategoryIcon({ category }) {
  const commonProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: 'h-6 w-6',
    'aria-hidden': true,
  }

  if (category === CATEGORIES.TODO) {
    return (
      <svg {...commonProps}>
        <path d="M15 4H6.8A2.8 2.8 0 0 0 4 6.8v10.4A2.8 2.8 0 0 0 6.8 20h10.4a2.8 2.8 0 0 0 2.8-2.8V10" />
        <path d="m9 11.5 2.2 2.2L20 5" />
      </svg>
    )
  }

  if (category === CATEGORIES.PAYMENT) {
    return (
      <svg {...commonProps}>
        <path d="M5.5 5h10.8A2.7 2.7 0 0 1 19 7.7V9H7a3 3 0 0 1 0-6h9" />
        <path d="M5 6v11.5A2.5 2.5 0 0 0 7.5 20H19V9H7" />
        <path d="M16.5 12.5H21v4h-4.5a2 2 0 0 1 0-4Z" />
      </svg>
    )
  }

  if (category === CATEGORIES.SHOPPING) {
    return (
      <svg {...commonProps}>
        <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.5L20.5 8H6" />
        <circle cx="9.5" cy="19" r="1" />
        <circle cx="17.5" cy="19" r="1" />
      </svg>
    )
  }

  return (
    <svg {...commonProps}>
      <path d="M8.5 15.5A7 7 0 1 1 15.5 15.5c-.9.7-1.2 1.4-1.2 2.5H9.7c0-1.1-.3-1.8-1.2-2.5Z" />
      <path d="M9.5 21h5" />
    </svg>
  )
}

export default function CategoryGrid({ items, onSelect }) {
  return (
    <section aria-labelledby="category-heading">
      <div className="mb-3 flex items-end justify-between px-1">
        <h2 id="category-heading" className="text-base font-bold">한눈에 보기</h2>
        <span className="text-xs text-gray-400">완료 전 일정</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORY_CARDS.map(({ category, label, color, iconColor, iconBackground }) => {
          const categoryItems = items.filter((item) => item.category === category && !item.completed)
          const amount = categoryItems.reduce((sum, item) => sum + (item.amount ?? 0), 0)

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category)}
              className={`${color} flex min-h-36 flex-col items-start justify-between rounded-[1.375rem] p-4 text-left transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black`}
            >
              <span className={`${iconBackground} ${iconColor} grid h-11 w-11 place-items-center rounded-2xl`} aria-hidden="true">
                <CategoryIcon category={category} />
              </span>
              <span className="mt-5 min-w-0">
                <span className="block text-base font-bold leading-snug">{label}</span>
                <span className="mt-1 block text-sm leading-snug text-gray-600">
                  {amount > 0 ? formatCurrency(amount) : `${categoryItems.length}개 남음`}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
