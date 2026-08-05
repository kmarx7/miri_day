import { useState } from 'react'
import AppShell from './components/layout/AppShell.jsx'
import BottomNavigation from './components/layout/BottomNavigation.jsx'
import QuickAddSheet from './components/input/QuickAddSheet.jsx'
import { CATEGORIES } from './constants/categories.js'
import { SAMPLE_ITEMS } from './data/sampleItems.js'
import { useItems } from './hooks/useItems.js'
import CalendarScreen from './screens/CalendarScreen.jsx'
import CategoryListScreen from './screens/CategoryListScreen.jsx'
import HomeScreen from './screens/HomeScreen.jsx'
import ProScreen from './screens/ProScreen.jsx'

const SCREENS = Object.freeze({
  HOME: 'home',
  CATEGORY: 'category',
  CALENDAR: 'calendar',
  PRO: 'pro',
})

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME)
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES.TODO)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const { items, sampleItems, createItem } = useItems({ sampleItems: SAMPLE_ITEMS })

  const isSample = items.length === 0
  const displayItems = isSample ? sampleItems : items
  const activeTab = screen === SCREENS.CATEGORY ? SCREENS.HOME : screen

  const selectCategory = (category) => {
    setSelectedCategory(category)
    setScreen(SCREENS.CATEGORY)
  }

  const navigate = (nextScreen) => {
    setScreen(nextScreen)
  }

  let content
  if (screen === SCREENS.CATEGORY) {
    content = (
      <CategoryListScreen
        category={selectedCategory}
        items={displayItems}
        isSample={isSample}
        onBack={() => setScreen(SCREENS.HOME)}
      />
    )
  } else if (screen === SCREENS.CALENDAR) {
    content = <CalendarScreen items={displayItems} isSample={isSample} />
  } else if (screen === SCREENS.PRO) {
    content = <ProScreen />
  } else {
    content = <HomeScreen items={displayItems} isSample={isSample} onSelectCategory={selectCategory} />
  }

  const navigation = (
    <BottomNavigation activeTab={activeTab} onChange={navigate} />
  )

  const fab = screen === SCREENS.HOME ? (
    <button
      type="button"
      onClick={() => setQuickAddOpen(true)}
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
        open={quickAddOpen}
        initialCategory={selectedCategory}
        onClose={() => setQuickAddOpen(false)}
        onCreate={createItem}
      />
    </>
  )
}
