import { useEffect, useState } from 'react'
import packageInfo from '../../package.json'
import ScreenHeader from '../components/layout/ScreenHeader.jsx'
import { THEME_OPTIONS } from '../constants/themes.js'
import { getProStatus, getTheme } from '../services/storageService.js'
import { selectTheme } from '../services/themeService.js'
import { getNotificationPermission, requestNotificationPermission } from '../services/notificationService.js'
import { purchaseService, restorePurchases } from '../services/purchaseService.js'

function SettingButton({ title, description, value, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-16 w-full items-center justify-between gap-4 border-b border-gray-100 px-4 py-3 text-left last:border-b-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-black"
    >
      <span className="min-w-0">
        <span className={`block text-sm font-bold ${danger ? 'text-red-700' : ''}`}>{title}</span>
        {description && <span className="mt-1 block text-xs leading-relaxed text-gray-500">{description}</span>}
      </span>
      <span className={`shrink-0 text-sm ${value ? 'font-semibold text-gray-500' : 'text-gray-400'}`}>
        {value ?? '›'}
      </span>
    </button>
  )
}

export default function SettingsScreen({
  isPro,
  isSample,
  itemCount,
  onBack,
  onOpenData,
  onOpenPrivacy,
  onOpenTerms,
  onOpenLicenses,
  onEntitlementChange,
  onDismissSamples,
  onResetData,
}) {
  const [theme, setThemeState] = useState(() => getTheme())
  const [notificationState, setNotificationState] = useState('checking')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [restoreBusy, setRestoreBusy] = useState(false)
  const [restoreMessage, setRestoreMessage] = useState('')
  const [resetPending, setResetPending] = useState(false)
  const [dataMessage, setDataMessage] = useState('')

  const refreshNotificationPermission = async ({ request = false } = {}) => {
    setNotificationState('checking')
    setNotificationMessage('')
    try {
      const permission = request
        ? await requestNotificationPermission()
        : await getNotificationPermission()
      if (!permission.supported) {
        setNotificationState('web')
        setNotificationMessage('알림 권한은 Android 앱에서 설정할 수 있어요.')
      } else {
        setNotificationState(permission.display)
        if (permission.display !== 'granted') {
          setNotificationMessage('권한을 계속 거부한 경우 Android 설정 > 앱 > 미리꼭 > 알림에서 직접 허용해 주세요.')
        }
      }
    } catch {
      setNotificationState('error')
      setNotificationMessage('알림 권한 상태를 확인하지 못했어요.')
    }
  }

  useEffect(() => {
    refreshNotificationPermission()
  }, [])

  const chooseTheme = (value) => {
    setThemeState(selectTheme(value))
  }

  const handleRestorePurchases = async () => {
    setRestoreBusy(true)
    setRestoreMessage('')
    const result = await restorePurchases(purchaseService)
    if (result.success) onEntitlementChange?.(getProStatus())
    setRestoreMessage(result.message ?? (result.success ? '구매 내역을 복원했어요.' : '복원할 구매 내역이 없어요.'))
    setRestoreBusy(false)
  }

  const handleDismissSamples = () => {
    onDismissSamples?.()
    setDataMessage('샘플을 지웠어요. 이제 빈 화면에서 시작할 수 있어요.')
  }

  const handleResetData = () => {
    onResetData?.()
    setResetPending(false)
    setDataMessage('모든 일정과 앱 설정을 초기화했어요.')
  }

  const notificationLabel = {
    checking: '확인 중',
    granted: '허용됨',
    denied: '허용 안 됨',
    prompt: '확인 필요',
    'prompt-with-rationale': '확인 필요',
    web: 'Android 전용',
    error: '확인 실패',
  }[notificationState]

  return (
    <div className="pt-5">
      <ScreenHeader
        eyebrow="앱과 데이터 관리"
        title="설정"
        description="권한, 로컬 데이터와 앱 정보를 확인해요."
        onBack={onBack}
      />

      <section className="rounded-2xl border border-gray-200 bg-white p-5" aria-labelledby="notification-settings-heading">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="notification-settings-heading" className="text-base font-bold">알림 설정</h2>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">각 일정의 알림 시점은 항목 추가·수정 화면에서 선택해요.</p>
          </div>
          <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">{notificationLabel}</span>
        </div>
        <button
          type="button"
          onClick={() => refreshNotificationPermission({ request: true })}
          disabled={notificationState === 'checking' || notificationState === 'web'}
          className="mt-4 min-h-11 w-full rounded-xl border border-gray-300 px-4 text-sm font-bold disabled:text-gray-400"
        >
          {notificationState === 'granted' ? '알림 권한 다시 확인' : '알림 권한 요청'}
        </button>
        {notificationMessage && <p className="mt-3 text-xs leading-relaxed text-[#8A6517]" role="status">{notificationMessage}</p>}
      </section>

      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5" aria-labelledby="theme-settings-heading">
        <h2 id="theme-settings-heading" className="text-base font-bold">테마</h2>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          고르면 바로 적용돼요. 다음에 열 때도 그대로 유지됩니다.
        </p>
        <div className="mt-3 grid gap-2" role="radiogroup" aria-labelledby="theme-settings-heading">
          {THEME_OPTIONS.map((option) => {
            const selected = theme === option.value
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => chooseTheme(option.value)}
                className={`theme-option ${selected ? 'theme-option-selected' : ''}`}
              >
                <span className="theme-swatch" aria-hidden="true">
                  {option.swatch.map((color, index) => (
                    <span key={index} style={{ background: color }} />
                  ))}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">
                    {option.label}
                    {option.ground === 'dark' && (
                      <span className="ml-1.5 align-middle text-[0.625rem] font-semibold text-gray-500">어두운 바탕</span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">{option.description}</span>
                </span>
                <span className="theme-check" aria-hidden="true">{selected ? '✓' : ''}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white" aria-label="데이터 설정">
        {isSample && (
          <SettingButton
            title="샘플 지우고 새로 시작"
            description="예시 일정 없이 빈 화면에서 시작"
            value="시작"
            onClick={handleDismissSamples}
          />
        )}
        <SettingButton title="데이터 백업" description="전체 일정과 설정을 JSON으로 저장" onClick={onOpenData} />
        <SettingButton title="데이터 복원" description="백업 JSON을 병합하거나 교체" onClick={onOpenData} />
        <SettingButton
          title="모든 데이터 초기화"
          description={`${itemCount}개 일정과 앱 설정을 2단계 확인 후 삭제`}
          onClick={() => { setResetPending(true); setDataMessage('') }}
          danger
        />
      </section>

      {resetPending && (
        <section className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4" role="alert" aria-labelledby="settings-reset-heading">
          <h2 id="settings-reset-heading" className="text-sm font-bold text-red-800">정말 전부 지우고 다시 시작할까요?</h2>
          <p className="mt-1 text-xs leading-relaxed text-red-700">일정과 메모는 복구할 수 없습니다. 필요한 경우 먼저 백업해 주세요.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setResetPending(false)} className="min-h-11 rounded-xl border border-red-200 bg-white text-sm font-bold text-red-700">취소</button>
            <button type="button" onClick={handleResetData} className="min-h-11 rounded-xl bg-red-600 text-sm font-bold text-white">2단계 · 모두 삭제</button>
          </div>
        </section>
      )}

      {dataMessage && <p className="mt-3 rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-600" role="status">{dataMessage}</p>}

      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5" aria-labelledby="pro-settings-heading">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 id="pro-settings-heading" className="text-base font-bold">Pro 상태</h2>
            <p className="mt-1 text-xs text-gray-500">미리꼭 Pro 평생 이용권</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${isPro ? 'bg-[#E8F8F0] text-[#287A4D]' : 'bg-gray-100 text-gray-500'}`}>
            {isPro ? '활성화됨' : 'Free'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleRestorePurchases}
          disabled={restoreBusy}
          aria-busy={restoreBusy}
          className="mt-4 min-h-12 w-full rounded-xl border border-gray-300 px-4 text-sm font-bold disabled:text-gray-400"
        >
          {restoreBusy ? '구매 내역 확인 중…' : '구매 복원'}
        </button>
        <p className="mt-2 text-xs leading-relaxed text-gray-400">현재 Google Play Billing 연결 전이라 실제 구매 복원은 아직 제공되지 않아요.</p>
        {restoreMessage && <p className="mt-3 text-sm font-medium text-gray-600" role="status">{restoreMessage}</p>}
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white" aria-label="정책과 라이선스">
        <SettingButton title="개인정보처리방침" onClick={onOpenPrivacy} />
        <SettingButton title="이용약관" onClick={onOpenTerms} />
        <SettingButton title="오픈소스 라이선스" onClick={onOpenLicenses} />
      </section>

      <section className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-4" aria-label="앱 버전">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-bold">앱 버전</span>
          <span className="text-sm font-semibold text-gray-500">{packageInfo.version}</span>
        </div>
      </section>
    </div>
  )
}
