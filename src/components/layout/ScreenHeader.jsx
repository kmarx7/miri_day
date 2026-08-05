export default function ScreenHeader({ eyebrow, title, description, onBack }) {
  return (
    <header className="mb-6 flex items-start gap-3">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="이전 화면"
          className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gray-200 bg-white text-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
        >
          ‹
        </button>
      )}
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-semibold text-gray-400">{eyebrow}</p>}
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm leading-relaxed text-gray-500">{description}</p>}
      </div>
    </header>
  )
}
