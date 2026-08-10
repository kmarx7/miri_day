import { getThemeOption, normalizeTheme } from '../constants/themes.js'
import { getTheme, setTheme } from './storageService.js'

/**
 * 문서 루트에 테마를 표시합니다. 실제 색은 index.css의
 * [data-theme="..."] 블록이 들고 있어서, 여기서는 값만 바꿔 끼웁니다.
 *
 * @param {string} theme
 * @returns {string} 실제로 적용된 테마
 */
export function applyTheme(theme) {
  const nextTheme = normalizeTheme(theme)
  const root = globalThis.document?.documentElement
  if (!root) return nextTheme

  root.dataset.theme = nextTheme

  // 상태 표시줄·주소창 색을 배경과 맞춥니다.
  const meta = globalThis.document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', getThemeOption(nextTheme).chrome)

  return nextTheme
}

/** 앱 시작 시 저장된 테마를 화면에 반영합니다. */
export function initTheme() {
  return applyTheme(getTheme())
}

/** 사용자가 고른 테마를 저장하고 곧바로 적용합니다. */
export function selectTheme(theme) {
  return applyTheme(setTheme(theme))
}
