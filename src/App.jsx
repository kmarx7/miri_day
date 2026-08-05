import { lazy, Suspense, useEffect, useState } from 'react'
import AppShell from './components/layout/AppShell.jsx'
import BottomNavigation from './components/layout/BottomNavigation.jsx'
import StatePanel from './components/feedback/StatePanel.jsx'
import UndoSnackbar from './components/feedback/UndoSnackbar.jsx'
import { CATEGORIES } from './constants/categories.js'
import { LEGAL_DOCUMENT_TYPES } from './constants/legal.js'
import { SAMPLE_ITEMS } from './data/sampleItems.js'
import { useItems } from './hooks/useItems.js'
import { evaluateItemCreation, FEATURES, requirePro } from './services/entitlementService.js'
import { registerAndroidBackButton } from './services/nativeAppService.js'
import { syncAllItemNotifications } from './services/notificationService.js'
import { getProStatus } from './services/storageService.js'
import HomeScreen from './screens/HomeScreen.jsx'
import {
  APP_SCREEN_STATE_KEY,
  createScreenHistoryState,
  getHistoryDepth,
  getScreenFromHistory,
  shouldNavigateBack,
} from './utils/navigation.js'

const CalendarScreen = lazy(() => import('./screens/CalendarScreen.jsx'))
const CategoryListScreen = lazy(() => import('./screens/CategoryListScreen.jsx'))
const DataManagementScreen = lazy(() => import('./screens/DataManagementScreen.jsx'))
const MoneyReportScreen = lazy(() => import('./screens/MoneyReportScreen.jsx'))
const PolicyScreen = lazy(() => import('./screens/PolicyScreen.jsx'))
const ProScreen = lazy(() => import('./screens/ProScreen.jsx'))
const SettingsScreen = lazy(() => import('./screens/SettingsScreen.jsx'))
const QuickAddSheet = lazy(() => import('./components/input/QuickAddSheet.jsx'))
const SCREENS = Object.freeze({
  HOME: 'home',
  CATEGORY: 'category',
  CALENDAR: 'calendar',
  REPORT: 'report',
  DATA: 'data',
  PRO: 'pro',
  SETTINGS: 'settings',
  POLICY: 'policy',
})
const SCREEN_VALUES = Object.freeze(Object.values(SCREENS))

export default function App() {
  const [screen, setScreen] = useState(() => (
    getScreenFromHistory(globalThis.history?.state, SCREEN_VALUES, SCREENS.HOME)
  ))
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES.TODO)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [swipeHintAvailable, setSwipeHintAvailable] = useState(true)
  const [isPro, setIsPro] = useState(() => getProStatus())
  const [paywallReason, setPaywallReason] = useState(null)
  const [legalDocumentType, setLegalDocumentType] = useState(LEGAL_DOCUMENT_TYPES.PRIVACY)
  const {
    items,
    sampleItems,
    pendingDeletion,
    createItem,
    updateItem,
    deleteItem,
    completeItem,
    restoreItem,
    undoDelete,
    refresh,
  } = useItems({ sampleItems: SAMPLE_ITEMS })

  const isSample = items.length === 0
  const displayItems = isSample ? sampleItems : items
  const activeTab = [SCREENS.CATEGORY, SCREENS.REPORT, SCREENS.DATA, SCREENS.SETTINGS, SCREENS.POLICY].includes(screen)
    ? SCREENS.HOME
    : screen

  const setAppScreen = (nextScreen, { replace = false } = {}) => {
    if (!SCREEN_VALUES.includes(nextScreen)) return
    if (nextScreen !== SCREENS.PRO) setPaywallReason(null)
    const nextState = createScreenHistoryState(nextScreen, window.history.state, { replace })
    window.history[replace ? 'replaceState' : 'pushState'](nextState, '')
    setScreen(nextScreen)
  }

  const navigate = (nextScreen) => {
    if (nextScreen === screen) return
    if (nextScreen === SCREENS.HOME) {
      const depth = getHistoryDepth(window.history.state)
      if (depth > 0) window.history.go(-depth)
      else setAppScreen(SCREENS.HOME, { replace: true })
      return
    }
    setAppScreen(nextScreen)
  }

  const goBack = () => {
    if (getHistoryDepth(window.history.state) > 0) window.history.back()
    else setAppScreen(SCREENS.HOME, { replace: true })
  }

  const selectCategory = (category) => {
    setSelectedCategory(category)
    setAppScreen(SCREENS.CATEGORY)
  }

  const openPaywall = (decision) => {
    setPaywallReason(decision)
    setAppScreen(SCREENS.PRO, { replace: editorOpen })
  }

  const requestPro = (feature) => requirePro(feature, { isPro }, openPaywall)

  const openLegalDocument = (documentType) => {
    setLegalDocumentType(documentType)
    setAppScreen(SCREENS.POLICY)
  }

  const openNewItem = () => {
    setEditingItem(null)
    setEditorOpen(true)
  }

  const openItemEditor = (item) => {
    setEditingItem(item)
    setEditorOpen(true)
  }

  const closeItemEditor = () => {
    setEditorOpen(false)
    setEditingItem(null)
  }

  const saveItem = (values) => {
    const storedItemExists = editingItem && items.some((item) => item.id === editingItem.id)
    if (storedItemExists) {
      updateItem(editingItem.id, values)
    } else {
      const decision = evaluateItemCreation(items, values, isPro)
      if (!decision.allowed) {
        openPaywall(decision)
        return false
      }
      createItem(values)
    }
    setSelectedCategory(values.category)
    return true
  }

  useEffect(() => {
    if (!window.history.state?.[APP_SCREEN_STATE_KEY]) {
      window.history.replaceState(createScreenHistoryState(SCREENS.HOME, null, { replace: true }), '')
    }

    const handlePopState = (event) => {
      const nextScreen = getScreenFromHistory(event.state, SCREEN_VALUES, SCREENS.HOME)
      setScreen(nextScreen)
      setEditorOpen(false)
      setEditingItem(null)
      if (nextScreen !== SCREENS.PRO) setPaywallReason(null)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    let active = true
    let removeBackButtonListener = () => {}

    registerAndroidBackButton(({ exitApp }) => {
      if (shouldNavigateBack(window.history.state)) window.history.back()
      else exitApp()
    }).then((removeListener) => {
      if (active) removeBackButtonListener = removeListener
      else removeListener()
    }).catch((error) => {
      console.error('Android 뒤로 가기 처리를 등록하지 못했습니다.', error)
    })

    return () => {
      active = false
      removeBackButtonListener()
    }
  }, [])

  useEffect(() => {
    syncAllItemNotifications(items, { isPro }).catch((error) => {
      console.error('Android 로컬 알림을 동기화하지 못했습니다.', error)
    })
  }, [isPro, items])

  let content
  if (screen === SCREENS.CATEGORY) {
    content = (
      <CategoryListScreen
        category={selectedCategory}
        items={displayItems}
        isSample={isSample}
        onBack={goBack}
        onEditItem={openItemEditor}
        onCompleteItem={completeItem}
        onRestoreItem={restoreItem}
        onDeleteItem={deleteItem}
        showSwipeHint={swipeHintAvailable}
        onSwipeHintShown={() => setSwipeHintAvailable(false)}
      />
    )
  } else if (screen === SCREENS.CALENDAR) {
    content = <CalendarScreen items={displayItems} isSample={isSample} isPro={isPro} onEditItem={openItemEditor} />
  } else if (screen === SCREENS.REPORT) {
    content = (
      <MoneyReportScreen
        items={displayItems}
        isPro={isPro}
        isSample={isSample}
        onBack={goBack}
        onRequirePro={() => requestPro(FEATURES.MONEY_REPORT_DETAIL)}
      />
    )
  } else if (screen === SCREENS.DATA) {
    content = (
      <DataManagementScreen
        itemCount={items.length}
        onBack={goBack}
        onDataChanged={refresh}
      />
    )
  } else if (screen === SCREENS.SETTINGS) {
    content = (
      <SettingsScreen
        isPro={isPro}
        onBack={goBack}
        onOpenData={() => navigate(SCREENS.DATA)}
        onOpenPrivacy={() => openLegalDocument(LEGAL_DOCUMENT_TYPES.PRIVACY)}
        onOpenTerms={() => openLegalDocument(LEGAL_DOCUMENT_TYPES.TERMS)}
        onOpenLicenses={() => openLegalDocument(LEGAL_DOCUMENT_TYPES.LICENSES)}
        onEntitlementChange={setIsPro}
      />
    )
  } else if (screen === SCREENS.POLICY) {
    content = <PolicyScreen documentType={legalDocumentType} onBack={goBack} />
  } else if (screen === SCREENS.PRO) {
    content = (
      <ProScreen
        isPro={isPro}
        reason={paywallReason}
        onEntitlementChange={setIsPro}
      />
    )
  } else {
    content = (
      <HomeScreen
        items={displayItems}
        isSample={isSample}
        isPro={isPro}
        onSelectCategory={selectCategory}
        onEditItem={openItemEditor}
        onOpenReport={() => navigate(SCREENS.REPORT)}
        onOpenBackup={() => navigate(SCREENS.DATA)}
        onOpenSettings={() => navigate(SCREENS.SETTINGS)}
      />
    )
  }

  const navigation = (
    <BottomNavigation activeTab={activeTab} onChange={navigate} />
  )

  const fab = screen === SCREENS.HOME ? (
    <button
      type="button"
      onClick={openNewItem}
      aria-label="새 항목 추가"
      className="app-fab grid h-14 w-14 place-items-center rounded-full bg-black text-3xl font-light text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
    >
      <span aria-hidden="true">+</span>
    </button>
  ) : null

  return (
    <>
      <AppShell navigation={navigation} fab={fab}>
        <Suspense fallback={<div className="pt-5"><StatePanel title="화면을 준비하고 있어요." loading /></div>}>
          {content}
        </Suspense>
      </AppShell>
      {editorOpen && (
        <Suspense fallback={(
          <div className="sheet-overlay" role="status" aria-live="polite">
            <section className="bottom-sheet justify-center p-5">
              <StatePanel title="입력 화면을 준비하고 있어요." loading />
            </section>
          </div>
        )}>
          <QuickAddSheet
            open
            initialCategory={selectedCategory}
            item={editingItem}
            isPro={isPro}
            onClose={closeItemEditor}
            onSave={saveItem}
            onRequirePro={requestPro}
          />
        </Suspense>
      )}
      <UndoSnackbar deletion={pendingDeletion} onUndo={undoDelete} />
    </>
  )
}
