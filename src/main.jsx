import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AppErrorBoundary from './components/feedback/AppErrorBoundary.jsx'
import { initTheme } from './services/themeService.js'
import './index.css'

// 첫 화면이 그려지기 전에 테마를 붙여 깜빡임을 막습니다.
initTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // 오프라인 캐시는 보조 기능이며 등록 실패가 로컬 앱 사용을 막지 않습니다.
    })
  })
}
