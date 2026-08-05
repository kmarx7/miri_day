import { useState } from 'react'
import AppShell from './components/layout/AppShell.jsx'
import BottomNavigation from './components/layout/BottomNavigation.jsx'
import QuickAddSheet from './components/input/QuickAddSheet.jsx'
import UndoSnackbar from './components/feedback/UndoSnackbar.jsx'
import { CATEGORIES } from './constants/categories.js'
import { SAMPLE_ITEMS } from './data/sampleItems.js'
import { useItems } from './hooks/useItems.js'
import { evaluateItemCreation, FEATURES, requirePro } from './services/entitlementService.js'
import { getProStatus } from './services/storageService.js'
import CalendarScreen from './screens/CalendarScreen.jsx'
import CategoryListScreen from './screens/CategoryListScreen.jsx'
import DataManagementScreen from './screens/DataManagementScreen.jsx'
import HomeScreen from './screens/HomeScreen.jsx'
import MoneyReportScreen from './screens/MoneyReportScreen.jsx'
import ProScreen from './screens/ProScreen.jsx'

const SCREENS = Object.freeze({
  HOME: 'home',
  CATEGORY: 'category',
  CALENDAR: 'calendar',
  REPORT: 'report',
  DATA: 'data',
  PRO: 'pro',
})

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME)
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES.TODO)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [swipeHintAvailable, setSwipeHintAvailable] = useState(true)
  const [isPro, setIsPro] = useState(() => getProStatus())
  const [paywallReason, setPaywallReason] = useState(null)
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
  const activeTab = [SCREENS.CATEGORY, SCREENS.REPORT, SCREENS.DATA].includes(screen)
    ? SCREENS.HOME
    : screen

  const selectCategory = (category) => {
    setSelectedCategory(category)
    setScreen(SCREENS.CATEGORY)
  }

  const navigate = (nextScreen) => {
    if (nextScreen !== SCREENS.PRO) setPaywallReason(null)
    setScreen(nextScreen)
  }

  const openPaywall = (decision) => {
    setPaywallReason(decision)
    setScreen(SCREENS.PRO)
  }

  const requestPro = (feature) => requirePro(feature, { isPro }, openPaywall)

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

  let content
  if (screen === SCREENS.CATEGORY) {
    content = (
      <CategoryListScreen
        category={selectedCategory}
        items={displayItems}
        isSample={isSample}
        onBack={() => setScreen(SCREENS.HOME)}
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
        onBack={() => navigate(SCREENS.HOME)}
        onRequirePro={() => requestPro(FEATURES.MONEY_REPORT_DETAIL)}
      />
    )
  } else if (screen === SCREENS.DATA) {
    content = (
      <DataManagementScreen
        itemCount={items.length}
        onBack={() => navigate(SCREENS.HOME)}
        onDataChanged={refresh}
      />
    )
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
      <AppShell navigation={navigation} fab={fab}>{content}</AppShell>
      <QuickAddSheet
        open={editorOpen}
        initialCategory={selectedCategory}
        item={editingItem}
        isPro={isPro}
        onClose={closeItemEditor}
        onSave={saveItem}
        onRequirePro={() => requestPro(FEATURES.RECURRING_SCHEDULES)}
      />
      <UndoSnackbar deletion={pendingDeletion} onUndo={undoDelete} />
    </>
  )
}
