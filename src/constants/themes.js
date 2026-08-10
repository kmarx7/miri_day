/**
 * 앱 테마 목록. 실제 색은 index.css의 [data-theme="..."] 블록이 들고 있고,
 * 여기서는 고를 수 있는 항목과 화면에 보여줄 설명만 관리합니다.
 */
export const THEMES = Object.freeze({
  SOFT: 'soft',
  PAPER: 'paper',
  HANJI: 'hanji',
  GRID: 'grid',
  CIVIC: 'civic',
  MIDNIGHT: 'midnight',
})

export const THEME_VALUES = Object.freeze(Object.values(THEMES))

export const DEFAULT_THEME = THEMES.SOFT

/** 어두운 바탕을 쓰는 테마. 상태 표시줄 색과 안내 문구에 씁니다. */
export const DARK_THEMES = Object.freeze([THEMES.MIDNIGHT])

/**
 * @typedef {Object} ThemeOption
 * @property {string} value
 * @property {string} label
 * @property {string} description
 * @property {'light' | 'dark'} ground
 * @property {string} chrome 상태 표시줄(theme-color)에 쓰는 배경색
 * @property {string[]} swatch 설정 화면 미리보기 색 띠
 */

/** @type {readonly ThemeOption[]} */
export const THEME_OPTIONS = Object.freeze([
  {
    value: THEMES.SOFT,
    label: '소프트 팝',
    description: '흰 바탕에 파스텔 카드. 기본 테마',
    ground: 'light',
    chrome: '#F4F5F7',
    swatch: ['#F4F5F7', '#E4EEFF', '#FFEEDF', '#DDF7EC', '#FFC53D'],
  },
  {
    value: THEMES.PAPER,
    label: '페이퍼 잉크',
    description: '색면 없이 실선과 글자만. 항목이 많을 때 유리',
    ground: 'light',
    chrome: '#FFFFFF',
    swatch: ['#FFFFFF', '#DEDEDF', '#1F5FD0', '#C9430D', '#0B0B0C'],
  },
  {
    value: THEMES.HANJI,
    label: '한지',
    description: '미색 바탕에 먹빛 글자. 눈이 편한 쪽',
    ground: 'light',
    chrome: '#F2ECE0',
    swatch: ['#F2ECE0', '#E4EAF2', '#F6E3D5', '#E3EDE2', '#B58A2B'],
  },
  {
    value: THEMES.GRID,
    label: '그리드 랩',
    description: '격자선이 비치는 회색 바탕. 주황 하나로 강조',
    ground: 'light',
    chrome: '#ECEDED',
    swatch: ['#ECEDED', '#FFFFFF', '#D4D4D4', '#2B6CB0', '#F26522'],
  },
  {
    value: THEMES.CIVIC,
    label: '시빅 블록',
    description: '검정 실선 격자에 담긴 색면. 표처럼 읽히는 화면',
    ground: 'light',
    chrome: '#FFFFFF',
    swatch: ['#FFFFFF', '#6EC1E4', '#E8B4A0', '#A8CF8E', '#F5C518'],
  },
  {
    value: THEMES.MIDNIGHT,
    label: '미드나잇',
    description: '어두운 바탕. 밤에 보기 좋고 배터리를 아껴요',
    ground: 'dark',
    chrome: '#0E0F13',
    swatch: ['#0E0F13', '#16233B', '#331F0F', '#0F2B21', '#FFCE5C'],
  },
])

export function isTheme(value) {
  return THEME_VALUES.includes(value)
}

export function normalizeTheme(value) {
  return isTheme(value) ? value : DEFAULT_THEME
}

/** @returns {ThemeOption} */
export function getThemeOption(value) {
  return THEME_OPTIONS.find((option) => option.value === normalizeTheme(value))
}

export function isDarkTheme(value) {
  return DARK_THEMES.includes(normalizeTheme(value))
}
