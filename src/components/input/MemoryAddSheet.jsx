import { useEffect, useMemo, useRef, useState } from 'react'
import {
  MEMORY_KIND_EMOJIS,
  MEMORY_KIND_LABELS,
  MEMORY_KIND_VALUES,
} from '../../constants/memoryKinds.js'
import { REPEAT_TYPES } from '../../models/item.js'
import { FEATURES } from '../../services/entitlementService.js'
import { formatKoreanYmd } from '../../utils/dates.js'
import {
  MEMORY_MONTH_OPTIONS,
  createMemoryItemValues,
  getMemoryDayOptions,
  resolveMemorySchedule,
  toMemoryFormValues,
} from '../../utils/memorySchedule.js'

const HISTORY_KEY = 'mirikkokMemoryEditor'

const CALENDAR_OPTIONS = [
  { value: false, label: '양력' },
  { value: true, label: '음력' },
]

const REPEAT_OPTIONS = [
  { value: REPEAT_TYPES.YEARLY, label: '매년' },
  { value: REPEAT_TYPES.NONE, label: '1회만' },
]

export default function MemoryAddSheet({ open, item = null, isPro = false, onClose, onSave, onRequirePro }) {
  const [title, setTitle] = useState('')
  const [memoryKind, setMemoryKind] = useState(MEMORY_KIND_VALUES[0])
  const [month, setMonth] = useState(1)
  const [day, setDay] = useState(1)
  const [isLunar, setIsLunar] = useState(false)
  const [isLeapMonth, setIsLeapMonth] = useState(false)
  const [repeatType, setRepeatType] = useState(REPEAT_TYPES.NONE)
  const [notice, setNotice] = useState('')
  const [viewport, setViewport] = useState(null)
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const previousFocusRef = useRef(null)

  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return

    const values = toMemoryFormValues(item)
    setTitle(values.title)
    setMemoryKind(values.memoryKind)
    setMonth(values.month)
    setDay(values.day)
    setIsLunar(values.isLunar)
    setIsLeapMonth(values.isLeapMonth)
    setRepeatType(item ? (item.repeatType ?? REPEAT_TYPES.NONE) : (isPro ? REPEAT_TYPES.YEARLY : REPEAT_TYPES.NONE))
    setNotice('')
  }, [isPro, item, open])

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    previousFocusRef.current = document.activeElement
    document.body.style.overflow = 'hidden'
    window.history.pushState({ ...window.history.state, [HISTORY_KEY]: true }, '')

    const handlePopState = () => onCloseRef.current()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (window.history.state?.[HISTORY_KEY]) window.history.back()
        else onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = [...(dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [])]
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus?.()
    }
  }, [open])

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

  const dayOptions = useMemo(() => getMemoryDayOptions(month, isLunar), [isLunar, month])
  const schedule = useMemo(
    () => resolveMemorySchedule({ month, day, isLunar, isLeapMonth }),
    [day, isLeapMonth, isLunar, month],
  )

  if (!open) return null

  const editing = Boolean(item)
  const canSave = Boolean(title.trim()) && schedule.valid

  const requestClose = () => {
    if (window.history.state?.[HISTORY_KEY]) window.history.back()
    else onClose()
  }

  const selectCalendar = (nextIsLunar) => {
    if (nextIsLunar === isLunar) return
    setIsLunar(nextIsLunar)
    setIsLeapMonth(false)
    const maxDay = getMemoryDayOptions(month, nextIsLunar).length
    if (day > maxDay) setDay(maxDay)
    setNotice('')
  }

  const selectMonth = (nextMonth) => {
    setMonth(nextMonth)
    const maxDay = getMemoryDayOptions(nextMonth, isLunar).length
    if (day > maxDay) setDay(maxDay)
  }

  const selectRepeatType = (value) => {
    if (value === REPEAT_TYPES.YEARLY && !isPro && value !== item?.repeatType) {
      setNotice('매년 반복은 Pro에서 사용할 수 있어요.')
      onRequirePro?.(FEATURES.RECURRING_SCHEDULES)
      return
    }
    setRepeatType(value)
    setNotice('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const values = createMemoryItemValues({
      title,
      memoryKind,
      month,
      day,
      isLunar,
      isLeapMonth,
      repeatType: isPro || repeatType === item?.repeatType ? repeatType : REPEAT_TYPES.NONE,
      memo: item?.memo ?? '',
    })
    if (!values) return

    const saved = onSave?.(values)
    if (saved === false) return
    requestClose()
  }

  return (
    <div
      className="sheet-overlay"
      role="presentation"
      style={viewport ? { height: `${viewport.height}px`, top: `${viewport.top}px` } : undefined}
      onMouseDown={(event) => event.target === event.currentTarget && requestClose()}
    >
      <section
        ref={dialogRef}
        className="bottom-sheet bottom-sheet-compact memory-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="memory-editor-title"
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-gray-300" aria-hidden="true" />

        <form className="editor-form" onSubmit={handleSubmit}>
          <div className="editor-scroll-area">
            <div className="flex items-start justify-between gap-4">
              <h2 id="memory-editor-title" className="text-lg font-extrabold">기억할 것</h2>
              <button
                type="button"
                onClick={requestClose}
                aria-label={editing ? '수정 화면 닫기' : '추가 화면 닫기'}
                className="memory-sheet-close"
              >
                ×
              </button>
            </div>

            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-label="기억할 내용"
              placeholder="기억할 내용"
              autoComplete="off"
              enterKeyHint="done"
              className="memory-title-input"
            />

            <fieldset className="memory-field">
              <legend className="memory-field-label">종류</legend>
              <div className="memory-kind-row">
                {MEMORY_KIND_VALUES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMemoryKind(value)}
                    aria-pressed={memoryKind === value}
                    className={`memory-chip ${memoryKind === value ? 'memory-chip-active' : ''}`}
                  >
                    <span aria-hidden="true">{MEMORY_KIND_EMOJIS[value]}</span> {MEMORY_KIND_LABELS[value]}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="memory-field">
              <legend className="memory-field-label">달력</legend>
              <div className="memory-pair-row">
                {CALENDAR_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => selectCalendar(option.value)}
                    aria-pressed={isLunar === option.value}
                    className={`memory-toggle ${isLunar === option.value ? 'memory-toggle-active' : ''}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="memory-field">
              <legend className="memory-field-label">날짜</legend>
              <div className="memory-pair-row">
                <label className="memory-select">
                  <span className="sr-only">{isLunar ? '음력 월' : '월'}</span>
                  <select value={month} onChange={(event) => selectMonth(Number(event.target.value))}>
                    {MEMORY_MONTH_OPTIONS.map((value) => (
                      <option key={value} value={value}>{value}월</option>
                    ))}
                  </select>
                </label>
                <label className="memory-select">
                  <span className="sr-only">{isLunar ? '음력 일' : '일'}</span>
                  <select value={day} onChange={(event) => setDay(Number(event.target.value))}>
                    {dayOptions.map((value) => (
                      <option key={value} value={value}>{value}일</option>
                    ))}
                  </select>
                </label>
              </div>
              {isLunar && (
                <label className="memory-leap-check">
                  <input
                    type="checkbox"
                    checked={isLeapMonth}
                    onChange={(event) => setIsLeapMonth(event.target.checked)}
                  />
                  윤달로 입력
                </label>
              )}
            </fieldset>

            <fieldset className="memory-field">
              <legend className="memory-field-label">반복</legend>
              <div className="memory-pair-row">
                {REPEAT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => selectRepeatType(option.value)}
                    aria-pressed={repeatType === option.value}
                    className={`memory-toggle ${repeatType === option.value ? 'memory-toggle-active' : ''}`}
                  >
                    {option.label}
                    {option.value === REPEAT_TYPES.YEARLY && !isPro && <span className="memory-pro-tag">PRO</span>}
                  </button>
                ))}
              </div>
            </fieldset>

            {schedule.valid ? (
              <p className="memory-preview" role="status">
                {isLunar
                  ? `음력 ${isLeapMonth ? '윤' : ''}${month}.${day} → ${formatKoreanYmd(schedule.dueDate)}에 알려드려요.`
                  : `${formatKoreanYmd(schedule.dueDate)}에 알려드려요.`}
              </p>
            ) : (
              <p className="memory-error" role="alert">{schedule.error}</p>
            )}

            {notice && <p className="memory-notice" role="status">{notice}</p>}
          </div>

          <div className="editor-footer">
            <button type="submit" disabled={!canSave} className="memory-save-button">
              {editing ? '수정 완료' : '저장'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
