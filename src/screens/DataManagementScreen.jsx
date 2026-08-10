import { useRef, useState } from 'react'
import ScreenHeader from '../components/layout/ScreenHeader.jsx'
import { downloadBackup, readBackupFile } from '../services/backupService.js'
import { exportData, importData, resetUserData, validateBackupData } from '../services/storageService.js'
import { initTheme } from '../services/themeService.js'

export default function DataManagementScreen({ itemCount, onBack, onDataChanged }) {
  const inputRef = useRef(null)
  const [payload, setPayload] = useState(null)
  const [fileName, setFileName] = useState('')
  const [mode, setMode] = useState('merge')
  const [message, setMessage] = useState('')
  const [replacePending, setReplacePending] = useState(false)
  const [resetPending, setResetPending] = useState(false)
  const [reading, setReading] = useState(false)

  const handleExport = () => {
    const success = downloadBackup(exportData())
    setMessage(success ? '백업 파일을 저장했어요.' : '이 환경에서는 파일을 저장할 수 없어요.')
  }

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    setPayload(null)
    setFileName('')
    setReplacePending(false)
    if (!file) return

    setReading(true)
    try {
      const text = await readBackupFile(file)
      const validation = validateBackupData(text)
      if (!validation.success) {
        setMessage(validation.error)
        return
      }
      setPayload(text)
      setFileName(file.name)
      setMessage(`${validation.data.items.length}개 아이템이 든 백업을 확인했어요.`)
    } catch {
      setMessage('백업 파일을 읽을 수 없어요.')
    } finally {
      event.target.value = ''
      setReading(false)
    }
  }

  const applyImport = (merge) => {
    const result = importData(payload, { merge })
    if (!result.success) {
      setMessage(result.error)
      return
    }
    setMessage(`${result.importedCount}개를 가져왔어요. 현재 ${result.totalCount}개${result.duplicateCount ? ` · 중복 ${result.duplicateCount}개 갱신` : ''}`)
    setPayload(null)
    setFileName('')
    setReplacePending(false)
    initTheme()
    onDataChanged?.()
  }

  const handleImport = () => {
    if (!payload) {
      setMessage('먼저 올바른 JSON 백업 파일을 선택해 주세요.')
      inputRef.current?.click()
      return
    }
    if (mode === 'replace') {
      setReplacePending(true)
      return
    }
    applyImport(true)
  }

  const handleReset = () => {
    resetUserData()
    setResetPending(false)
    setPayload(null)
    setFileName('')
    setMessage('기기에 저장된 아이템과 설정을 초기화했어요.')
    initTheme()
    onDataChanged?.()
  }

  return (
    <div className="pt-5">
      <ScreenHeader
        eyebrow={`${itemCount}개 아이템 저장 중`}
        title="백업·복원"
        description="결제 권한이나 인증정보를 제외한 일정과 설정만 다뤄요."
        onBack={onBack}
      />

      <section className="rounded-2xl border border-gray-200 bg-white p-5" aria-labelledby="export-heading">
        <h2 id="export-heading" className="text-base font-bold">JSON으로 내보내기</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">전체 아이템과 앱 설정을 파일 하나로 보관해요.</p>
        <button type="button" onClick={handleExport} className="mt-4 min-h-12 w-full rounded-xl bg-black px-4 text-sm font-bold text-white">
          백업 파일 저장
        </button>
      </section>

      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5" aria-labelledby="import-heading">
        <h2 id="import-heading" className="text-base font-bold">JSON에서 가져오기</h2>
        <input ref={inputRef} type="file" accept="application/json,.json" onChange={handleFile} className="sr-only" aria-label="백업 JSON 파일 선택" />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={reading} aria-busy={reading} className="mt-4 min-h-12 w-full rounded-xl border border-gray-300 px-4 text-sm font-bold disabled:text-gray-400">
          {reading ? '백업 파일 확인 중…' : (fileName || '백업 파일 선택')}
        </button>

        <fieldset className="mt-4">
          <legend className="text-sm font-bold">가져오기 방식</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[
              { value: 'merge', label: '기존 데이터와 병합' },
              { value: 'replace', label: '기존 데이터 교체' },
            ].map((option) => (
              <label key={option.value} className={`flex min-h-14 cursor-pointer items-center rounded-xl border px-3 text-sm font-semibold ${mode === option.value ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                <input type="radio" name="import-mode" value={option.value} checked={mode === option.value} onChange={(event) => { setMode(event.target.value); setReplacePending(false) }} className="mr-2" />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        {replacePending && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
            <p className="text-sm font-bold text-red-800">기존 데이터를 모두 교체할까요?</p>
            <p className="mt-1 text-xs leading-relaxed text-red-600">현재 아이템은 선택한 백업 내용으로 대체됩니다.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setReplacePending(false)} className="min-h-11 rounded-xl border border-red-200 bg-white text-sm font-bold text-red-700">취소</button>
              <button type="button" onClick={() => applyImport(false)} className="min-h-11 rounded-xl bg-red-600 text-sm font-bold text-white">교체 확인</button>
            </div>
          </div>
        )}

        <button type="button" onClick={handleImport} disabled={!payload || replacePending} className="mt-4 min-h-12 w-full rounded-xl bg-black px-4 text-sm font-bold text-white disabled:bg-gray-200 disabled:text-gray-400">
          가져오기
        </button>
      </section>

      <section className="mt-4 rounded-2xl border border-red-200 bg-white p-5" aria-labelledby="reset-heading">
        <h2 id="reset-heading" className="text-base font-bold text-red-700">데이터 초기화</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">Pro 구매 권한은 유지하고 아이템과 앱 설정만 삭제해요.</p>
        {!resetPending ? (
          <button type="button" onClick={() => setResetPending(true)} className="mt-4 min-h-12 w-full rounded-xl border border-red-300 text-sm font-bold text-red-700">1단계 · 초기화 시작</button>
        ) : (
          <div className="mt-4 rounded-xl bg-red-50 p-4" role="alert">
            <p className="text-sm font-bold text-red-800">삭제한 데이터는 되돌릴 수 없어요.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setResetPending(false)} className="min-h-11 rounded-xl border border-red-200 bg-white text-sm font-bold text-red-700">취소</button>
              <button type="button" onClick={handleReset} className="min-h-11 rounded-xl bg-red-600 text-sm font-bold text-white">2단계 · 모두 삭제</button>
            </div>
          </div>
        )}
      </section>

      {message && <p className="mt-4 rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-600" role="status">{message}</p>}
    </div>
  )
}
