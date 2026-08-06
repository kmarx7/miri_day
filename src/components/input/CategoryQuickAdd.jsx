import { useEffect, useRef, useState } from 'react'
import { CATEGORIES, getCategoryActionColor, getCategoryLabel } from '../../constants/categories.js'
import { formatCurrencyInput } from '../../utils/currency.js'
import { createQuickItemValues } from '../../utils/quickAdd.js'

const OPTIONAL_FIELDS = Object.freeze({
  DATE: 'date',
  TIME: 'time',
  MEMO: 'memo',
})

export default function CategoryQuickAdd({ category, onSave }) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [memo, setMemo] = useState('')
  const [openFields, setOpenFields] = useState([])
  const [status, setStatus] = useState('')
  const dateRef = useRef(null)
  const timeRef = useRef(null)
  const memoRef = useRef(null)

  const categoryLabel = getCategoryLabel(category)
  const actionColor = getCategoryActionColor(category)
  const showAmount = category === CATEGORIES.PAYMENT || category === CATEGORIES.SHOPPING

  useEffect(() => {
    setTitle('')
    setAmount('')
    setDueDate('')
    setDueTime('')
    setMemo('')
    setOpenFields([])
    setStatus('')
  }, [category])

  useEffect(() => {
    if (!status) return undefined
    const timer = globalThis.setTimeout(() => setStatus(''), 1800)
    return () => globalThis.clearTimeout(timer)
  }, [status])

  const fieldIsOpen = (field) => openFields.includes(field)

  const toggleField = (field, ref) => {
    const opening = !fieldIsOpen(field)
    setOpenFields((current) => (
      opening ? [...current, field] : current.filter((value) => value !== field)
    ))
    if (!opening) {
      if (field === OPTIONAL_FIELDS.DATE) setDueDate('')
      if (field === OPTIONAL_FIELDS.TIME) setDueTime('')
      if (field === OPTIONAL_FIELDS.MEMO) setMemo('')
      return
    }
    globalThis.setTimeout(() => {
      ref.current?.focus()
      if (field !== OPTIONAL_FIELDS.MEMO) {
        try {
          ref.current?.showPicker?.()
        } catch {
          // 일부 모바일 브라우저는 사용자 동작 밖의 picker 호출을 제한합니다.
        }
      }
    }, 30)
  }

  const reset = () => {
    setTitle('')
    setAmount('')
    setDueDate('')
    setDueTime('')
    setMemo('')
    setOpenFields([])
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const values = createQuickItemValues({ category, title, amount, dueDate, dueTime, memo })
    if (!values) return

    const saved = onSave?.(values)
    if (saved === false) return
    reset()
    setStatus(`${categoryLabel}에 추가했어요.`)
  }

  const toolClass = (active) => `category-quick-tool ${active ? 'category-quick-tool-active' : ''}`

  return (
    <form
      className="category-quick-add"
      style={{ '--category-action': actionColor }}
      onSubmit={handleSubmit}
      aria-label={`${categoryLabel} 빠른 입력`}
    >
      <div className={`category-quick-main ${showAmount ? 'category-quick-main-with-amount' : ''}`}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="category-quick-title"
          placeholder={`${categoryLabel}을 빠르게 입력`}
          aria-label={`${categoryLabel} 제목`}
          autoComplete="off"
          enterKeyHint="done"
        />
        {showAmount && (
          <input
            value={amount}
            onChange={(event) => setAmount(formatCurrencyInput(event.target.value))}
            className="category-quick-amount"
            placeholder="금액"
            aria-label="금액"
            inputMode="numeric"
          />
        )}
        <button
          type="submit"
          className="category-quick-submit"
          disabled={!title.trim()}
          aria-label={`${categoryLabel} 추가`}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>

      <div className="category-quick-tools" aria-label="추가 정보">
        <button
          type="button"
          className={toolClass(fieldIsOpen(OPTIONAL_FIELDS.DATE))}
          aria-expanded={fieldIsOpen(OPTIONAL_FIELDS.DATE)}
          onClick={() => toggleField(OPTIONAL_FIELDS.DATE, dateRef)}
        >
          <span aria-hidden="true">▣</span> 날짜
        </button>
        <button
          type="button"
          className={toolClass(fieldIsOpen(OPTIONAL_FIELDS.TIME))}
          aria-expanded={fieldIsOpen(OPTIONAL_FIELDS.TIME)}
          onClick={() => toggleField(OPTIONAL_FIELDS.TIME, timeRef)}
        >
          <span aria-hidden="true">◷</span> 시간
        </button>
        <button
          type="button"
          className={toolClass(fieldIsOpen(OPTIONAL_FIELDS.MEMO))}
          aria-expanded={fieldIsOpen(OPTIONAL_FIELDS.MEMO)}
          onClick={() => toggleField(OPTIONAL_FIELDS.MEMO, memoRef)}
        >
          <span aria-hidden="true">≡</span> 메모
        </button>
      </div>

      {openFields.length > 0 && (
        <div className="category-quick-options">
          {fieldIsOpen(OPTIONAL_FIELDS.DATE) && (
            <label className="category-quick-option">
              <span>날짜</span>
              <input ref={dateRef} type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </label>
          )}
          {fieldIsOpen(OPTIONAL_FIELDS.TIME) && (
            <label className="category-quick-option">
              <span>시간</span>
              <input ref={timeRef} type="time" value={dueTime} onChange={(event) => setDueTime(event.target.value)} />
            </label>
          )}
          {fieldIsOpen(OPTIONAL_FIELDS.MEMO) && (
            <label className="category-quick-option category-quick-memo">
              <span>메모</span>
              <input ref={memoRef} value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="필요한 내용을 덧붙여보세요" />
            </label>
          )}
        </div>
      )}
      <p className="sr-only" role="status" aria-live="polite">{status}</p>
    </form>
  )
}
