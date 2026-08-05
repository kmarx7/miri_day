import { useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIES, CATEGORY_VALUES, getCategoryLabel } from '../../constants/categories.js'
import { REPEAT_TYPES } from '../../models/item.js'
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/currency.js'
import { DATE_PRESETS, formatKoreanYmd, formatYmd, getDatePresetValue, inferDatePreset } from '../../utils/dates.js'
import { convertLunarToSolar, solarToLunar } from '../../utils/lunar.js'

const DATE_PRESET_OPTIONS = [
  { value: DATE_PRESETS.TODAY, label: '오늘' },
  { value: DATE_PRESETS.TOMORROW, label: '내일' },
  { value: DATE_PRESETS.THIS_WEEK, label: '이번 주' },
  { value: DATE_PRESETS.CUSTOM, label: '직접 선택' },
]

const HISTORY_KEY = 'mirikkokItemEditor'

export default function QuickAddSheet({ open, initialCategory, item, isPro = false, onClose, onSave }) {
  const [category, setCategory] = useState(initialCategory ?? CATEGORIES.TODO)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [datePreset, setDatePreset] = useState(DATE_PRESETS.TODAY)
  const [isLunar, setIsLunar] = useState(false)
  const [lunarYear, setLunarYear] = useState('')
  const [lunarMonth, setLunarMonth] = useState('')
  const [lunarDay, setLunarDay] = useState('')
  const [isLeapMonth, setIsLeapMonth] = useState(false)
  const [repeatType, setRepeatType] = useState(REPEAT_TYPES.NONE)
  const [memo, setMemo] = useState('')
  const [memoExpanded, setMemoExpanded] = useState(false)
  const [viewport, setViewport] = useState(null)
  const onCloseRef = useRef(onClose)

  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return

    const initialDueDate = item?.dueDate ?? formatYmd(new Date())
    const initialLunar = item?.isLunar
      ? {
          year: item.lunarYear,
          month: item.lunarMonth,
          day: item.lunarDay,
          isLeapMonth: item.isLeapMonth,
        }
      : solarToLunar(initialDueDate)
    setCategory(item?.category ?? initialCategory ?? CATEGORIES.TODO)
    setTitle(item?.title ?? '')
    setAmount(item?.amount === null || item?.amount === undefined ? '' : formatCurrencyInput(item.amount))
    setDueDate(initialDueDate)
    setDatePreset(inferDatePreset(initialDueDate))
    setIsLunar(item?.isLunar === true)
    setLunarYear(initialLunar?.year ? String(initialLunar.year) : '')
    setLunarMonth(initialLunar?.month ? String(initialLunar.month) : '')
    setLunarDay(initialLunar?.day ? String(initialLunar.day) : '')
    setIsLeapMonth(initialLunar?.isLeapMonth === true)
    setRepeatType(item?.repeatType ?? REPEAT_TYPES.NONE)
    setMemo(item?.memo ?? '')
    setMemoExpanded(Boolean(item?.memo))
  }, [initialCategory, item, open])

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.history.pushState({ ...window.history.state, [HISTORY_KEY]: true }, '')

    const handlePopState = () => onCloseRef.current()
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return
      if (window.history.state?.[HISTORY_KEY]) window.history.back()
      else onCloseRef.current()
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const lunarConversion = useMemo(() => convertLunarToSolar({
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    isLeapMonth,
  }), [isLeapMonth, lunarDay, lunarMonth, lunarYear])

  useEffect(() => {
    if (!open) return undefined

    const visualViewport = window.visualViewport
    const updateViewport = () => {
      setViewport({
        height: visualViewport?.height ?? window.innerHeight,
        top: visualViewport?.offsetTop ?? 0,
      })
    }

    updateViewport()
    visualViewport?.addEventListener('resize', updateViewport)
    visualViewport?.addEventListener('scroll', updateViewport)
    window.addEventListener('resize', updateViewport)

    return () => {
      visualViewport?.removeEventListener('resize', updateViewport)
      visualViewport?.removeEventListener('scroll', updateViewport)
      window.removeEventListener('resize', updateViewport)
    }
  }, [open])

  if (!open) return null

  const editing = Boolean(item)
  const showAmount = category === CATEGORIES.PAYMENT || category === CATEGORIES.SHOPPING

  const requestClose = () => {
    if (window.history.state?.[HISTORY_KEY]) window.history.back()
    else onClose()
  }

  const selectDatePreset = (preset) => {
    setDatePreset(preset)
    const nextDate = getDatePresetValue(preset)
    if (nextDate) setDueDate(nextDate)
  }

  const handleAmountChange = (event) => {
    setAmount(formatCurrencyInput(event.target.value))
  }

  const toggleLunar = () => {
    if (!isLunar) {
      const converted = solarToLunar(dueDate)
      if (converted) {
        setLunarYear(String(converted.year))
        setLunarMonth(String(converted.month))
        setLunarDay(String(converted.day))
        setIsLeapMonth(converted.isLeapMonth)
      }
    }
    setIsLunar((value) => !value)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!title.trim() || (isLunar && !lunarConversion.valid)) return

    onSave({
      category,
      title: title.trim(),
      amount: showAmount ? parseCurrencyInput(amount) : null,
      dueDate: isLunar ? lunarConversion.solarDate : (dueDate || null),
      isLunar,
      lunarYear: isLunar ? Number(lunarYear) : null,
      lunarMonth: isLunar ? Number(lunarMonth) : null,
      lunarDay: isLunar ? Number(lunarDay) : null,
      isLeapMonth: isLunar && isLeapMonth,
      repeatType: category === CATEGORIES.MEMORY ? repeatType : REPEAT_TYPES.NONE,
      memo,
    })
    requestClose()
  }

  return (
    <div
      className="sheet-overlay"
      role="presentation"
      style={viewport ? { height: `${viewport.height}px`, top: `${viewport.top}px` } : undefined}
      onMouseDown={(event) => event.target === event.currentTarget && requestClose()}
    >
      <section className="bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="item-editor-title">
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-gray-300" aria-hidden="true" />
        <div className="flex shrink-0 items-center justify-between gap-4 px-5 pb-3 pt-4">
          <h2 id="item-editor-title" className="text-lg font-bold">{editing ? '항목 수정' : '새로 추가'}</h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label={editing ? '수정 화면 닫기' : '추가 화면 닫기'}
            className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
          >
            ×
          </button>
        </div>

        <form className="editor-form" onSubmit={handleSubmit}>
          <div className="editor-scroll-area">
            <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2" role="group" aria-label="카테고리 선택">
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
                aria-label="제목"
                placeholder="무엇을 미리 챙길까요?"
                className="mt-2 min-h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base outline-none focus:border-black"
              />
            </label>

            {showAmount && (
              <label className="mt-4 block">
                <span className="text-sm font-semibold">금액</span>
                <div className="mt-2 flex min-h-12 items-center rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-black">
                  <span className="mr-2 text-gray-400" aria-hidden="true">₩</span>
                  <input
                    inputMode="numeric"
                    value={amount}
                    onChange={handleAmountChange}
                    aria-label="금액"
                    placeholder="0"
                    className="min-w-0 flex-1 bg-transparent text-base outline-none"
                  />
                </div>
              </label>
            )}

            <div className="mt-5 flex min-h-14 items-center justify-between rounded-xl bg-gray-50 px-4">
              <div>
                <p className="text-sm font-semibold">음력으로 입력</p>
                <p className="mt-0.5 text-xs text-gray-400">음력 일정으로 표시해요.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isLunar}
                aria-label="음력 입력"
                onClick={toggleLunar}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${isLunar ? 'bg-black' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${isLunar ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold">{isLunar ? '음력 날짜' : '날짜'}</legend>
              {!isLunar ? (
                <>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {DATE_PRESET_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => selectDatePreset(option.value)}
                        aria-pressed={datePreset === option.value}
                        className={`min-h-10 rounded-xl border px-3 text-sm font-semibold ${
                          datePreset === option.value ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-500'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {datePreset === DATE_PRESETS.CUSTOM && (
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(event) => setDueDate(event.target.value)}
                      aria-label="직접 선택 날짜"
                      className="mt-3 min-h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base outline-none focus:border-black"
                    />
                  )}
                </>
              ) : (
                <div className="mt-2 space-y-3">
                  <div className="grid grid-cols-[1.35fr_1fr_1fr] gap-2">
                    <label>
                      <span className="sr-only">음력 연도</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        value={lunarYear}
                        onChange={(event) => setLunarYear(event.target.value)}
                        aria-label="음력 연도"
                        placeholder="연도"
                        className="min-h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-base outline-none focus:border-black"
                      />
                    </label>
                    <label>
                      <span className="sr-only">음력 월</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        max="12"
                        value={lunarMonth}
                        onChange={(event) => setLunarMonth(event.target.value)}
                        aria-label="음력 월"
                        placeholder="월"
                        className="min-h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-base outline-none focus:border-black"
                      />
                    </label>
                    <label>
                      <span className="sr-only">음력 일</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        max="30"
                        value={lunarDay}
                        onChange={(event) => setLunarDay(event.target.value)}
                        aria-label="음력 일"
                        placeholder="일"
                        className="min-h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-base outline-none focus:border-black"
                      />
                    </label>
                  </div>

                  <label className="flex min-h-11 items-center gap-3 rounded-xl border border-gray-200 px-3 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={isLeapMonth}
                      onChange={(event) => setIsLeapMonth(event.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 accent-black"
                    />
                    윤달로 입력
                  </label>

                  {lunarConversion.valid ? (
                    <div className="rounded-xl border border-[#F3E5A6] bg-[#FFFEF5] px-4 py-3" role="status">
                      <p className="text-sm font-semibold leading-relaxed text-[#6E5318]">
                        음력 {isLeapMonth ? '윤' : ''}{Number(lunarMonth)}월 {Number(lunarDay)}일 → 양력 {formatKoreanYmd(lunarConversion.solarDate)}로 저장돼요
                      </p>
                      {!isPro && (
                        <span className="mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#8A6517]">
                          Pro에서 매년 자동 변환
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
                      {lunarConversion.error}
                    </p>
                  )}
                </div>
              )}
            </fieldset>

            {category === CATEGORIES.MEMORY && (
              <div className="mt-4 flex min-h-14 items-center justify-between rounded-xl border border-gray-200 bg-white px-4">
                <div>
                  <p className="text-sm font-semibold">매년 반복</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {isLunar && !isPro ? '저장 후 Pro에서 자동 재계산할 수 있어요.' : '다가오는 기념일을 매년 계산해요.'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={repeatType === REPEAT_TYPES.YEARLY}
                  aria-label="매년 반복"
                  onClick={() => setRepeatType((value) => (
                    value === REPEAT_TYPES.YEARLY ? REPEAT_TYPES.NONE : REPEAT_TYPES.YEARLY
                  ))}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${repeatType === REPEAT_TYPES.YEARLY ? 'bg-black' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${repeatType === REPEAT_TYPES.YEARLY ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => setMemoExpanded((value) => !value)}
                aria-expanded={memoExpanded}
                className="flex min-h-12 w-full items-center justify-between px-4 text-sm font-semibold"
              >
                <span>메모 {memo ? '작성됨' : '(선택)'}</span>
                <span aria-hidden="true">{memoExpanded ? '−' : '+'}</span>
              </button>
              {memoExpanded && (
                <textarea
                  value={memo}
                  onChange={(event) => setMemo(event.target.value)}
                  aria-label="메모"
                  rows="4"
                  placeholder="잊지 말아야 할 내용을 적어두세요."
                  className="block w-full resize-none border-t border-gray-100 bg-gray-50 px-4 py-3 text-sm outline-none focus:bg-white"
                />
              )}
            </div>
          </div>

          <div className="editor-footer">
            <button
              type="submit"
              disabled={!title.trim() || (isLunar && !lunarConversion.valid)}
              className="min-h-12 w-full rounded-xl bg-black px-4 text-base font-bold text-white disabled:bg-gray-200 disabled:text-gray-400"
            >
              {editing ? '수정 완료' : '저장하기'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
