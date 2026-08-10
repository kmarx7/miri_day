import { useEffect, useRef, useState } from 'react'
import { CATEGORIES, getCategoryActionColor, getCategoryColor } from '../../constants/categories.js'
import { getMemoryKindEmoji, getMemoryKindLabel } from '../../constants/memoryKinds.js'
import { formatCurrency } from '../../utils/currency.js'
import { formatCompactCreatedAt, formatCompactDueDate, formatDDay } from '../../utils/dates.js'
import { clampSwipeOffset, resolveSwipeAction, SWIPE_ACTIONS } from '../../utils/swipe.js'

function MemoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 4h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-4.5 3v-3H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="M8 8h8M8 12h6" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m4 20 4.2-1 10.6-10.6a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" />
      <path d="m14.5 6.7 2.8 2.8" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
    </svg>
  )
}

export default function SwipeableItem({
  item,
  completionLabel,
  onEdit,
  onComplete,
  onRestore,
  onDelete,
  showSwipeHint = false,
  memoExpanded = false,
  onToggleMemo,
}) {
  const [offset, setOffset] = useState(0)
  const gestureRef = useRef(null)
  const suppressClickRef = useRef(false)
  const resetClickTimerRef = useRef(null)

  useEffect(() => () => globalThis.clearTimeout(resetClickTimerRef.current), [])

  const finishGesture = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    gestureRef.current = null
    if (gesture.horizontal && Math.abs(gesture.offset) > 5) {
      suppressClickRef.current = true
      globalThis.clearTimeout(resetClickTimerRef.current)
      resetClickTimerRef.current = globalThis.setTimeout(() => {
        suppressClickRef.current = false
      }, 0)
    }

    const action = resolveSwipeAction(gesture.offset)
    setOffset(0)
    if (action === SWIPE_ACTIONS.COMPLETE && !item.completed && onComplete) onComplete(item.id)
    if (action === SWIPE_ACTIONS.DELETE && onDelete) onDelete(item.id)
  }

  const cancelGesture = (event) => {
    if (gestureRef.current?.pointerId !== event.pointerId) return
    gestureRef.current = null
    setOffset(0)
  }

  const handlePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return
    if (!onDelete && (!onComplete || item.completed)) return

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      horizontal: false,
      offset: 0,
    }
  }

  const handlePointerMove = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    const deltaX = event.clientX - gesture.startX
    const deltaY = event.clientY - gesture.startY
    if (!gesture.horizontal) {
      if (Math.abs(deltaX) < 6) return
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        gestureRef.current = null
        return
      }
      gesture.horizontal = true
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // Synthetic pointer events and older browsers may not expose pointer capture.
      }
    }

    event.preventDefault()
    const nextOffset = item.completed ? Math.min(0, deltaX) : deltaX
    gesture.offset = clampSwipeOffset(nextOffset)
    setOffset(gesture.offset)
  }

  const handleMemoToggle = () => {
    if (suppressClickRef.current || !item.memo) return
    onToggleMemo?.(item.id)
  }

  const completionAction = item.completed ? onRestore : onComplete
  const createdLabel = formatCompactCreatedAt(item.createdAt)
  const dueLabel = item.isLunar && item.lunarMonth && item.lunarDay
    ? `음력 ${item.lunarMonth}.${item.lunarDay}${item.dueTime ? ` ${item.dueTime}` : ''}`
    : formatCompactDueDate(item.dueDate, item.dueTime)
  const dDayLabel = formatDDay(item.dueDate)
  const summary = (
    <>
      <span className="item-title-row">
        {item.category === CATEGORIES.MEMORY && (
          <span className="item-memory-kind" role="img" aria-label={getMemoryKindLabel(item.memoryKind)}>
            {getMemoryKindEmoji(item.memoryKind)}
          </span>
        )}
        <span className={`item-title ${item.completed ? 'line-through' : ''}`}>{item.title}</span>
        {item.memo && (
          <span className="item-memo-indicator" role="img" aria-label="메모 있음"><MemoIcon /></span>
        )}
        {item.amount !== null && <span className="item-amount">{formatCurrency(item.amount)}</span>}
      </span>
      {memoExpanded && <span className="item-memo-preview">{item.memo}</span>}
      <span className="item-meta" aria-hidden="true">
        {createdLabel && <span className="item-created-meta">{createdLabel}</span>}
        {dueLabel && <span className="item-meta-divider">|</span>}
        {dueLabel && <span className="item-due-meta">{dueLabel}</span>}
        {dDayLabel && <span className="item-dday">{dDayLabel}</span>}
      </span>
      <span className="sr-only">
        {createdLabel ? `등록 ${createdLabel}. ` : ''}
        {dueLabel ? `예정 ${dueLabel}. ` : ''}
        {dDayLabel}
      </span>
    </>
  )

  return (
    <article
      className={`swipe-item ${memoExpanded ? 'swipe-item-memo-open' : ''} ${showSwipeHint ? 'swipe-hint' : ''}`}
      style={{ '--item-action': getCategoryActionColor(item.category) }}
    >
      <div className="swipe-action swipe-action-complete" aria-hidden="true"><span>{completionLabel}</span></div>
      <div className="swipe-action swipe-action-delete" aria-hidden="true"><span>삭제</span></div>

      <div
        className={`swipe-item-content ${item.completed ? 'swipe-item-completed' : ''}`}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishGesture}
        onPointerCancel={cancelGesture}
      >
        <span className="item-category-bar" style={{ backgroundColor: getCategoryColor(item.category) }} aria-hidden="true" />
        <button
          type="button"
          onClick={() => completionAction?.(item.id)}
          disabled={!completionAction}
          aria-label={item.completed ? `${item.title} 진행 중으로 복원` : `${item.title} ${completionLabel} 처리`}
          className="item-completion-button"
        >
          <span className={`item-check-circle ${item.completed ? 'item-check-circle-completed' : ''}`} aria-hidden="true">
            {item.completed ? '✓' : ''}
          </span>
        </button>

        {item.memo ? (
          <button
            type="button"
            onClick={handleMemoToggle}
            aria-expanded={memoExpanded}
            aria-label={`${item.title} 메모 ${memoExpanded ? '접기' : '펼치기'}`}
            className="item-details"
          >
            {summary}
          </button>
        ) : (
          <div className="item-details">{summary}</div>
        )}

        <button type="button" onClick={() => onEdit?.(item)} disabled={!onEdit} aria-label={`${item.title} 수정`} className="item-action-button">
          <PencilIcon />
        </button>
        <button type="button" onClick={() => onDelete?.(item.id)} disabled={!onDelete} aria-label={`${item.title} 삭제`} className="item-action-button item-delete-button">
          <TrashIcon />
        </button>
      </div>
    </article>
  )
}
