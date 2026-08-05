import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'
import {
  OPEN_SOURCE_PACKAGES,
  PRIVACY_POLICY_SECTIONS,
  TERMS_SECTIONS,
} from '../src/constants/legal.js'

const require = createRequire(import.meta.url)
const privacyText = PRIVACY_POLICY_SECTIONS
  .flatMap((section) => section.paragraphs)
  .join('\n')
const termsText = TERMS_SECTIONS
  .flatMap((section) => section.paragraphs)
  .join('\n')

test('개인정보처리방침에 필수 로컬 저장·결제·삭제·백업 문구가 포함된다', () => {
  assert.match(privacyText, /일정과 메모 데이터는 기본적으로 사용자 기기에 저장됩니다/)
  assert.match(privacyText, /개발자는 일정과 메모 내용을 직접 수집하지 않습니다/)
  assert.match(privacyText, /결제는 Google Play에서 처리합니다/)
  assert.match(privacyText, /앱은 카드번호를 직접 수집하거나 저장하지 않습니다/)
  assert.match(privacyText, /앱 데이터 또는 앱을 삭제하면 로컬 데이터가 삭제될 수 있습니다/)
  assert.match(privacyText, /백업 기능으로 데이터를 직접 보관할 수 있습니다/)
})

test('사용하지 않는 분석·오류수집 SDK 이름을 정책에 표시하지 않는다', () => {
  assert.doesNotMatch(privacyText, /Firebase|Google Analytics|Sentry|Amplitude|Crashlytics/i)
})

test('이용약관은 Pro를 구독이 아닌 일회성 비소모성 상품으로 설명한다', () => {
  assert.match(termsText, /구독이 아닌 일회성 비소모성 상품/)
})

test('오픈소스 화면의 버전과 라이선스가 설치된 직접 런타임 패키지와 일치한다', () => {
  const packageNames = new Map([
    ['Capacitor Android', '@capacitor/android'],
    ['Capacitor Core', '@capacitor/core'],
    ['Capacitor App', '@capacitor/app'],
    ['Capacitor Local Notifications', '@capacitor/local-notifications'],
    ['lunar-javascript', 'lunar-javascript'],
    ['React', 'react'],
    ['React DOM', 'react-dom'],
  ])

  OPEN_SOURCE_PACKAGES.forEach((dependency) => {
    const packageName = packageNames.get(dependency.name)
    assert.ok(packageName, `${dependency.name} 패키지 매핑이 필요합니다.`)
    const installed = require(`../node_modules/${packageName}/package.json`)
    assert.equal(dependency.version, installed.version)
    assert.equal(dependency.license, installed.license)
  })
})
