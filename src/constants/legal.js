export const LEGAL_DOCUMENT_TYPES = Object.freeze({
  PRIVACY: 'privacy',
  TERMS: 'terms',
  LICENSES: 'licenses',
})

export const LEGAL_EFFECTIVE_DATE = '2026년 8월 5일'

export const PRIVACY_POLICY_SECTIONS = Object.freeze([
  {
    title: '1. 저장되는 정보',
    paragraphs: [
      '일정과 메모 데이터는 기본적으로 사용자 기기에 저장됩니다.',
      '개발자는 일정과 메모 내용을 직접 수집하지 않습니다. 테마와 Pro 상태 같은 앱 설정도 기기의 로컬 저장소에 보관됩니다.',
    ],
  },
  {
    title: '2. 알림 권한과 기기 기능',
    paragraphs: [
      '사용자가 일정 알림을 선택하면 앱은 Android 알림 권한을 요청하고 기기 안에서 로컬 알림을 예약합니다. 알림 예약 복원을 위해 기기 재부팅 완료 신호를 사용할 수 있습니다.',
      '앱에는 광고, 사용자 행동 분석 또는 원격 오류 수집 SDK가 포함되어 있지 않습니다.',
    ],
  },
  {
    title: '3. 결제 정보',
    paragraphs: [
      '결제는 Google Play에서 처리합니다.',
      '앱은 카드번호를 직접 수집하거나 저장하지 않습니다. 구매 여부 확인에는 Google Play가 제공하는 구매 상태만 사용합니다.',
    ],
  },
  {
    title: '4. 데이터 삭제와 보관',
    paragraphs: [
      '사용자가 앱 데이터 또는 앱을 삭제하면 로컬 데이터가 삭제될 수 있습니다.',
      '사용자는 백업 기능으로 데이터를 직접 보관할 수 있습니다. 백업 JSON 파일의 보관과 관리는 사용자 책임이며 결제 토큰이나 카드정보는 백업에 포함하지 않습니다.',
    ],
  },
  {
    title: '5. 정책 변경',
    paragraphs: [
      '앱의 데이터 처리 방식이나 사용하는 SDK가 변경되면 이 방침과 외부 공개본을 함께 갱신합니다.',
    ],
  },
])

export const TERMS_SECTIONS = Object.freeze([
  {
    title: '1. 서비스 이용',
    paragraphs: [
      '미리꼭은 개인 일정, 할 일, 지출 메모와 기념일을 기기에서 관리하도록 돕는 앱입니다. 사용자는 관련 법령과 Google Play 정책을 준수해 앱을 이용해야 합니다.',
    ],
  },
  {
    title: '2. 데이터 관리',
    paragraphs: [
      '앱 데이터는 기본적으로 사용자 기기에 저장됩니다. 기기 분실, 앱 삭제 또는 데이터 초기화에 대비해 필요한 데이터는 사용자가 백업해야 합니다.',
    ],
  },
  {
    title: '3. 알림',
    paragraphs: [
      '알림 전달 시각은 Android의 배터리 및 알림 정책, 기기 설정에 따라 달라질 수 있습니다. 중요한 납부나 일정은 원본 정보도 함께 확인해야 합니다.',
    ],
  },
  {
    title: '4. Pro 평생 이용권',
    paragraphs: [
      '미리꼭 Pro는 구독이 아닌 일회성 비소모성 상품으로 설계됩니다. 실제 구매와 복원은 Google Play 결제 시스템 및 해당 계정의 구매 기록을 따릅니다.',
    ],
  },
  {
    title: '5. 변경과 중단',
    paragraphs: [
      '안전성, 호환성 또는 법적 요구사항을 위해 앱 기능과 약관이 변경될 수 있으며 중요한 변경은 앱 또는 외부 정책 페이지를 통해 안내합니다.',
    ],
  },
])

export const OPEN_SOURCE_PACKAGES = Object.freeze([
  { name: 'Capacitor Android', version: '8.5.0', license: 'MIT', url: 'https://github.com/ionic-team/capacitor' },
  { name: 'Capacitor Core', version: '8.5.0', license: 'MIT', url: 'https://github.com/ionic-team/capacitor' },
  { name: 'Capacitor App', version: '8.1.1', license: 'MIT', url: 'https://github.com/ionic-team/capacitor-plugins' },
  { name: 'Capacitor Local Notifications', version: '8.2.1', license: 'MIT', url: 'https://github.com/ionic-team/capacitor-plugins' },
  { name: 'lunar-javascript', version: '1.7.7', license: 'MIT', url: 'https://github.com/6tail/lunar-javascript' },
  { name: 'React', version: '18.3.1', license: 'MIT', url: 'https://github.com/facebook/react' },
  { name: 'React DOM', version: '18.3.1', license: 'MIT', url: 'https://github.com/facebook/react' },
])

export const LEGAL_DOCUMENT_META = Object.freeze({
  [LEGAL_DOCUMENT_TYPES.PRIVACY]: {
    eyebrow: `시행일 ${LEGAL_EFFECTIVE_DATE}`,
    title: '개인정보처리방침',
    description: '미리꼭이 기기 데이터와 권한을 다루는 방식을 안내합니다.',
    sections: PRIVACY_POLICY_SECTIONS,
  },
  [LEGAL_DOCUMENT_TYPES.TERMS]: {
    eyebrow: `시행일 ${LEGAL_EFFECTIVE_DATE}`,
    title: '이용약관',
    description: '미리꼭을 이용할 때 적용되는 기본 조건입니다.',
    sections: TERMS_SECTIONS,
  },
  [LEGAL_DOCUMENT_TYPES.LICENSES]: {
    eyebrow: '오픈소스 고지',
    title: '오픈소스 라이선스',
    description: '앱에 직접 포함된 주요 오픈소스 구성요소입니다.',
    packages: OPEN_SOURCE_PACKAGES,
  },
})
