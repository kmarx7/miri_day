import { useEffect, useState } from 'react'
import { CATEGORIES, CATEGORY_VALUES, getCategoryLabel } from '../../constants/categories.js'
import { formatYmd } from '../../utils/dates.js'

export default function QuickAddSheet({ open, initialCategory, onClose, onCreate }) {
  const [category, setCategory] = useState(initialCategory ?? CATEGORIES.TODO)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (!open) return
    setCategory(initialCategory ?? CATEGORIES.TODO)
    setTitle('')
    setAmount('')
  }, [initialCategory, open])

  if (!open) return null

  const showAmount = category === CATEGORIES.PAYMENT || category === CATEGORIES.SHOPPING

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!title.trim()) return

    onCreate({
      category,
      title,
      amount: showAmount && amount !== '' ? Number(amount) : null,
      dueDate: formatYmd(new Date()),
    })
    onClose()
  }

  return (
    <div className="sheet-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="quick-add-title">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" />
        <div className="flex items-center justify-between gap-4">
          <h2 id="quick-add-title" className="text-lg font-bold">새로 추가</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="추가 화면 닫기"
            className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
          >
            ×
          </button>
        </div>

        <form className="mt-5" onSubmit={handleSubmit}>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2" aria-label="카테고리 선택">
            {CATEGORY_VALUES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                aria-pressed={category === value}
                className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold ${
                  category === value ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-500'
                }`}
              >
                {getCategoryLabel(value)}
              </button>
            ))}
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-semibold">제목</span>
            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="무엇을 미리 챙길까요?"
              className="mt-2 min-h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base outline-none focus:border-black"
            />
          </label>

          {showAmount && (
            <label className="mt-4 block">
              <span className="text-sm font-semibold">금액</span>
              <input
                inputMode="numeric"
                min="0"
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0"
                className="mt-2 min-h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base outline-none focus:border-black"
              />
            </label>
          )}

          <button
            type="submit"
            disabled={!title.trim()}
            className="mt-6 min-h-12 w-full rounded-xl bg-black px-4 text-base font-bold text-white disabled:bg-gray-200 disabled:text-gray-400"
          >
            저장하기
          </button>
        </form>
      </section>
    </div>
  )
}
