import ScreenHeader from '../components/layout/ScreenHeader.jsx'
import { LEGAL_DOCUMENT_META, LEGAL_DOCUMENT_TYPES } from '../constants/legal.js'

export default function PolicyScreen({ documentType = LEGAL_DOCUMENT_TYPES.PRIVACY, onBack }) {
  const document = LEGAL_DOCUMENT_META[documentType] ?? LEGAL_DOCUMENT_META[LEGAL_DOCUMENT_TYPES.PRIVACY]

  return (
    <div className="pt-5">
      <ScreenHeader
        eyebrow={document.eyebrow}
        title={document.title}
        description={document.description}
        onBack={onBack}
      />

      {document.sections ? (
        <div className="space-y-4">
          {document.sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-base font-bold">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-6 text-gray-600">{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white" aria-label="오픈소스 구성요소">
          {document.packages.map((dependency) => (
            <a
              key={`${dependency.name}-${dependency.version}`}
              href={dependency.url}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-16 items-center justify-between gap-4 border-b border-gray-100 px-4 py-3 last:border-b-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-black"
              aria-label={`${dependency.name} ${dependency.version}, ${dependency.license} 라이선스`}
            >
              <span className="min-w-0">
                <span className="block text-sm font-bold">{dependency.name}</span>
                <span className="mt-1 block text-xs text-gray-500">버전 {dependency.version}</span>
              </span>
              <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">{dependency.license}</span>
            </a>
          ))}
        </section>
      )}
    </div>
  )
}
