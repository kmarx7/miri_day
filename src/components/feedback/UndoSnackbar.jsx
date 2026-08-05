export default function UndoSnackbar({ deletion, onUndo }) {
  if (!deletion) return null

  return (
    <div className="undo-snackbar" role="status" aria-live="polite">
      <span className="min-w-0 flex-1 truncate text-sm">‘{deletion.item.title}’ 삭제됨</span>
      <button
        type="button"
        onClick={onUndo}
        className="min-h-11 shrink-0 rounded-full px-3 text-sm font-bold text-[#F9D96D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        실행취소
      </button>
    </div>
  )
}
