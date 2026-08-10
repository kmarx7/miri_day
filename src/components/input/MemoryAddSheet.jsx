import { useEffect, useRef, useState } from 'react'
import { CATEGORIES, getCategoryActionVar, getCategoryColorVar } from '../../constants/categories.js'
import { useMemoryForm } from '../../hooks/useMemoryForm.js'
import { requestNotificationPermission } from '../../services/notificationService.js'
import MemoryFormFields from './MemoryFormFields.jsx'

const HISTORY_KEY = 'mirikkokMemoryEditor'

export default function MemoryAddSheet({ open, item = null, isPro = false, onClose, onSave, onRequirePro }) {
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [viewport, setViewport] = useState(null)
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const previousFocusRef = useRef(null)

  onCloseRef.current = onClose

  const form = useMemoryForm({ active: open, item, isPro, onRequirePro })

  useEffect(() => {
    if (!open) return
    setTitle(item?.title ?? '')
    setSaving(false)
  }, [item, open])

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
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

  if (!open) return null

  const editing = Boolean(item)
  const canSave = Boolean(title.trim()) && form.schedule.valid && !saving

  const requestClose = () => {
    if (window.history.state?.[HISTORY_KEY]) window.history.back()
    else onClose()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (saving) return

    const values = form.buildValues(title)
    if (!values) return

    setSaving(true)
    if (form.notificationOffsets.length > 0) {
      try {
        const permission = await requestNotificationPermission()
        if (permission.supported && permission.display !== 'granted') {
          form.setNotice('알림 권한이 꺼져 있어요. 설정에서 허용하거나 알림 선택을 모두 해제해 주세요.')
          setSaving(false)
          return
        }
      } catch {
        form.setNotice('알림 권한을 확인하지 못했어요. 알림 선택을 해제하면 항목은 저장할 수 있어요.')
        setSaving(false)
        return
      }
    }

    const saved = onSave?.(values)
    setSaving(false)
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
        className="bottom-sheet bottom-sheet-compact themed-sheet"
        style={{
          '--sheet-accent': getCategoryColorVar(CATEGORIES.MEMORY),
          '--sheet-accent-strong': getCategoryActionVar(CATEGORIES.MEMORY),
        }}
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
                className="sheet-close"
              >
                ×
              </button>
            </div>

            <MemoryFormFields
              form={form}
              isPro={isPro}
              title={title}
              onTitleChange={setTitle}
              autoFocusTitle
            />
          </div>

          <div className="editor-footer">
            <button type="submit" disabled={!canSave} className="sheet-save-button">
              {saving ? '권한 확인 중…' : (editing ? '수정 완료' : '저장')}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
