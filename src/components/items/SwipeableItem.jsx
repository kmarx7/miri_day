import { useEffect, useRef, useState } from 'react'
import { getCategoryColor } from '../../constants/categories.js'
import { formatCurrency } from '../../utils/currency.js'
import { formatShortDate } from '../../utils/dates.js'
import { clampSwipeOffset, resolveSwipeAction, SWIPE_ACTIONS } from '../../utils/swipe.js'

export default function SwipeableItem({
  item,
  completionLabel,
  onEdit,
  onComplete,
  onRestore,
  onDelete,
  showSwipeHint = false,
}) {
  const [offset, setOffset] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
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

  const handleEdit = () => {
    if (suppressClickRef.current) return
    onEdit?.(item)
  }

  const runMenuAction = (action) => {
    setMenuOpen(false)
    action?.(item.id)
  }

  const dateLabel = item.isLunar && item.lunarMonth && item.lunarDay
    ? `음력 ${item.lunarMonth}.${item.lunarDay}`
    : formatShortDate(item.dueDate)

  return (
    <article className={`swipe-item ${showSwipeHint ? 'swipe-hint' : ''}`}>
      <div className="swipe-action swipe-action-complete" aria-hidden="true">
        <span>{completionLabel}</span>
      </div>
      <div className="swipe-action swipe-action-delete" aria-hidden="true">
        <span>삭제</span>
      </div>

      <div
        className={`swipe-item-content ${item.completed ? 'swipe-item-completed' : ''}`}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishGesture}
        onPointerCancel={cancelGesture}
      >
        <span
          className="h-9 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: getCategoryColor(item.category) }}
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={handleEdit}
          aria-label={`${item.title} 수정`}
          className="min-w-0 flex-1 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          <span className={`block truncate text-sm font-semibold ${item.completed ? 'line-through' : ''}`}>{item.title}</span>
          <span className="mt-1 block text-xs text-gray-400">{dateLabel}</span>
        </button>
        {item.amount !== null && (
          <span className="shrink-0 text-sm font-semibold">{formatCurrency(item.amount)}</span>
        )}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={`${item.title} 작업 메뉴`}
            aria-expanded={menuOpen}
            className="grid h-11 w-11 place-items-center rounded-full text-xl text-gray-500 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
          >
            <span aria-hidden="true">⋮</span>
          </button>
          {menuOpen && (
            <div className="item-action-menu" role="menu" aria-label={`${item.title} 작업`}>
              <button
                type="button"
                role="menuitem"
                onClick={() => runMenuAction(item.completed ? onRestore : onComplete)}
              >
                {item.completed ? '진행 중으로 복원' : completionLabel}
              </button>
              <button type="button" role="menuitem" onClick={() => runMenuAction(onDelete)} className="text-red-600">
                삭제
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
