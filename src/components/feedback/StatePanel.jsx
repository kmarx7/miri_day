export default function StatePanel({ title, description, loading = false, compact = false }) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-gray-300 bg-white px-5 text-center ${compact ? 'py-7' : 'py-10'}`}
      role={loading ? 'status' : undefined}
      aria-live={loading ? 'polite' : undefined}
      aria-busy={loading || undefined}
    >
      {loading && <span className="mx-auto mb-3 block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black" aria-hidden="true" />}
      <p className="text-sm font-bold text-gray-700">{title}</p>
      {description && <p className="mt-2 text-xs leading-relaxed text-gray-500">{description}</p>}
    </div>
  )
}
