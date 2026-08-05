# 미리꼭

> 다음 작업을 시작하기 전에 [PROJECT_STATUS.md](./PROJECT_STATUS.md)에서 현재 상태와 우선순위를 확인하세요.

## 프로젝트 소개

미리꼭은 개인 일정, 할 일, 지출 메모와 기념일을 한곳에서 관리하는 로컬 우선 모바일 앱입니다. 웹에서는 PWA로, Android에서는 Capacitor WebView 앱으로 실행됩니다. 일정과 메모는 기본적으로 서버가 아닌 사용자 기기에 저장됩니다.

현재 버전은 React 앱, Android 로컬 알림, JSON 백업·복원과 Google Play 제출용 Android 빌드 기반을 포함합니다. Google Play Billing 실제 어댑터와 배포용 서명은 아직 완료되지 않았습니다.

## 주요 기능

- 할 것(`todo`), 낼 것(`payment`), 살 것(`shopping`), 생각할 것(`thought`), 기억할 것(`memory`) 관리
- 아이템 추가·수정·완료·복원·삭제와 3초 삭제 실행취소
- 카테고리 목록의 터치·마우스 스와이프와 접근성 버튼 메뉴
- 월간 캘린더, 날짜별 일정, 매월·매년 반복 일정 계산
- 음력·윤달 입력, 양력 변환, 기억할 것 D-Day 계산
- 낼 것과 살 것의 월간·연간 금액 요약 및 Pro 상세 리포트
- JSON 백업·검증·병합·교체·2단계 초기화
- Android 로컬 알림과 하드웨어 뒤로 가기 처리
- PWA 앱 셸 오프라인 캐시, safe-area 및 모바일 바텀시트
- 앱 내부 개인정보처리방침·이용약관·오픈소스 라이선스 화면
- Free 사용량 제한과 Pro 페이월

## 기술 스택

- React 18, React DOM 18
- Vite 5
- Tailwind CSS 3, PostCSS, Autoprefixer
- Capacitor 8 (`@capacitor/core`, `@capacitor/android`, `@capacitor/app`)
- Capacitor Local Notifications 8
- `lunar-javascript`
- 브라우저 `localStorage`
- Node 내장 test runner(`node --test`)
- Android Gradle 프로젝트, JDK 21, SDK 36

React Router나 원격 API, 데이터베이스, 분석·광고·원격 오류수집 SDK는 사용하지 않습니다. 화면 이동은 `App.jsx`의 상태와 History API로 관리합니다.

## 폴더 구조

```text
.
├── android/                         Capacitor Android Studio 프로젝트
│   ├── app/build.gradle             앱 ID, 버전, R8, 선택적 release 서명
│   ├── app/src/main/                Manifest, MainActivity, 아이콘·스플래시
│   ├── key.properties.example       서명 설정 예시(실제 비밀값 없음)
│   └── variables.gradle             min/compile/target SDK와 Android 의존성 버전
├── public/
│   ├── icons/                       PWA 아이콘
│   └── manifest.webmanifest         PWA 메타데이터
├── src/
│   ├── components/                  캘린더, 입력, 목록, 레이아웃, 피드백 UI
│   ├── constants/                   카테고리, 알림, 법률 문구, Pro 가격
│   ├── data/sampleItems.js          저장되지 않는 읽기 전용 예시 데이터
│   ├── hooks/useItems.js            저장소 CRUD와 React 상태 연결
│   ├── models/item.js               아이템 모델과 정규화
│   ├── screens/                     홈, 목록, 캘린더, 리포트, 설정, Pro 화면
│   ├── services/                    저장소, 백업, 알림, 권한, 구매 인터페이스
│   ├── utils/                       날짜, 음력, 반복, 알림, 금액 계산
│   ├── App.jsx                      화면 상태, 내비게이션과 기능 조합
│   ├── main.jsx                     React 진입점과 service worker 등록
│   └── index.css                    Tailwind와 모바일 공통 스타일
├── test/                            Node 단위 테스트
├── capacitor.config.ts              Capacitor 앱 설정
├── vite.config.js                   Vite 및 오프라인 앱 셸 생성
└── package.json                     실행·테스트·Android 스크립트
```

`Mirikkok-Dev-Handoff-v1.html`은 디자인과 동작 참고용 독립 번들입니다. 개발 소스로 유지보수하거나 직접 수정하지 않습니다.

## 개발 환경

- Node.js 22 이상
- npm
- JDK 21
- Android Studio 2025.2.1 이상
- Android SDK Platform 36과 Build Tools 36

현재 Android 설정은 `minSdk 24`, `compileSdk 36`, `targetSdk 36`입니다.

## 설치

```bash
npm install
```

의존성 잠금 파일은 `package-lock.json`입니다. 설치 버전 재현을 우선할 때는 `npm ci`를 사용할 수 있습니다.

## 웹 실행

개발 서버:

```bash
npm run dev
```

프로덕션 웹 빌드와 로컬 미리보기:

```bash
npm run build
npm run preview
```

빌드 결과는 `dist/`에 생성됩니다. 프로덕션 빌드에서는 `sw.js`가 생성되고 앱 셸과 정적 자산을 캐시합니다. 최초 로드에 성공한 뒤에는 네트워크 없이도 앱 셸과 로컬 기능을 사용할 수 있습니다.

## Android 실행

웹 빌드 후 Capacitor 자산과 플러그인을 Android 프로젝트에 동기화합니다.

```bash
npm run android:sync
```

Android Studio에서 열기:

```bash
npm run android
```

연결된 기기 또는 에뮬레이터에서 실행:

```bash
npm run android:run
```

Android Studio가 기본 경로에 없다면 `CAPACITOR_ANDROID_STUDIO_PATH`에 실행 파일 경로를 지정합니다. 프로덕션 설정에는 개발 서버 URL이 없으며 `dist/` 자산을 앱 안에서 실행합니다.

## Capacitor 동기화

`npm run android:sync`는 내부적으로 다음 순서로 실행됩니다.

```bash
npm run build
npx cap sync android
```

웹 코드, 플러그인 또는 `capacitor.config.ts`를 변경하면 Android 빌드 전에 다시 동기화해야 합니다. 네이티브 폴더만 수정한 경우에는 필요 여부를 변경 내용에 따라 판단합니다.

## 환경별 설정

| 환경 | 설정 |
| --- | --- |
| 웹 개발 | `npm run dev`; Vite가 출력하는 로컬 URL 사용 |
| 웹 프로덕션 | `npm run build`; service worker 등록, 정적 `dist/` 사용 |
| Android 개발 | JDK 21, SDK 36, `local.properties` 또는 Android Studio SDK 설정 |
| Android 프로덕션 | `loggingBehavior: none`, 혼합 콘텐츠 비허용, 로컬 `dist/` 사용 |
| 서명 | `android/key.properties`와 외부 업로드 키 사용 |
| 결제 | 현재 환경변수 없음; 실제 Google Play Billing 어댑터 미연결 |

앱은 현재 `.env` 변수를 읽지 않습니다. `.env`, `.env.*`, `local.properties`, `key.properties`, `*.jks`, `*.keystore`는 Git에서 제외됩니다. 테스트 API 주소나 프로덕션 서버 URL도 설정되어 있지 않습니다.

## 데이터 모델

`src/models/item.js`의 스키마 버전은 `1`입니다.

```js
{
  id: string,
  category: 'todo' | 'payment' | 'shopping' | 'thought' | 'memory',
  title: string,
  amount: number | null,
  dueDate: string | null,          // YYYY-MM-DD
  memo: string,
  completed: boolean,
  completedAt: string | null,      // ISO timestamp
  isLunar: boolean,
  lunarYear: number | null,
  lunarMonth: number | null,
  lunarDay: number | null,
  isLeapMonth: boolean,
  repeatType: 'none' | 'yearly' | 'monthly',
  notificationOffsets: number[],
  createdAt: string,               // ISO timestamp
  updatedAt: string                // ISO timestamp
}
```

금액은 문자열이 아닌 숫자로 저장되며 `payment`와 `shopping`에서만 유지됩니다. 잘못된 카테고리나 빈 제목은 모델 생성 시 거부합니다. 저장·가져오기 시 사용할 수 없는 레코드는 정규화하거나 거부합니다.

## localStorage와 저장소 구조

`src/services/storageService.js`가 브라우저 저장 접근을 한곳에서 관리합니다.

| 키 | 내용 |
| --- | --- |
| `mirikkok_items` | 정규화된 사용자 아이템 JSON 배열 |
| `mirikkok_pro` | 현재 로컬 Pro 상태 문자열 (`true`/`false`) |
| `mirikkok_theme` | 테마 ID, 기본값 `soft` |
| `mirikkok_schema_version` | 현재 아이템 스키마 버전 |

잘못된 JSON이나 접근 예외가 앱을 중단하지 않도록 방어하며, `localStorage`를 사용할 수 없으면 현재 실행 중에만 유지되는 메모리 Map으로 대체합니다. 이 메모리 대체 데이터는 새로고침 후 보존되지 않습니다.

사용자 아이템이 없을 때 표시되는 `src/data/sampleItems.js`의 예시 데이터는 `localStorage`에 저장되지 않습니다. 실제 CRUD가 발생하면 사용자 데이터와 예시 데이터를 분리해서 표시합니다.

## 음력과 반복 일정 계산

- `src/utils/lunar.js`가 `lunar-javascript`를 이용해 음력·윤달을 양력으로 변환합니다.
- 입력값은 변환 후 원래 음력 날짜로 다시 대조해 존재하지 않는 날짜와 잘못된 윤달을 거부합니다.
- 날짜 문자열을 먼저 계산해 JavaScript `Date`의 UTC 변환으로 날짜가 밀리는 문제를 피합니다.
- `src/utils/dates.js`가 Asia/Seoul 기준 날짜와 D-Day 계산을 담당합니다.
- Free는 사용자가 변환해 저장한 양력 날짜를 사용하고, Pro의 음력 매년 반복은 해당 연도의 양력 발생일을 다시 계산합니다.
- `src/utils/recurrence.js`는 요청한 화면 기간의 발생 일정만 계산합니다. 발생 일정은 `sourceItemId`와 `occurrenceId`를 가지며 `localStorage`에 별도 아이템으로 미리 생성하지 않습니다.
- 반복 수정은 MVP에서 원본을 수정하는 “전체 반복 일정”만 지원합니다. “이 일정만”과 “이후 일정”은 구현되어 있지 않습니다.

## 알림 구조

- UI·앱 상태 연결: `src/App.jsx`
- 네이티브 권한·채널·예약 동기화: `src/services/notificationService.js`
- 알림 시각·ID·발생 일정 계산: `src/utils/notifications.js`
- 채널·허용 오프셋: `src/constants/notifications.js`

알림은 Asia/Seoul 오전 9시 기준입니다. Free는 당일(`0`) 알림만, Pro는 D-7·D-3·하루 전·당일(`[7, 3, 1, 0]`)을 사용할 수 있습니다. 일정은 최대 400일 범위에서 계산합니다.

아이템이나 Pro 상태가 변경되면 미리꼭이 관리하는 기존 예약을 취소하고 현재 데이터로 다시 예약합니다. 해시 기반 키와 충돌 회피 로직으로 Android 정수 알림 ID를 생성하며, 다른 주체가 만든 예약 ID는 보존합니다. 완료되었거나 날짜가 지났거나 권한이 거부된 일정은 예약하지 않습니다.

Android 13 이상에서는 알림 권한이 필요합니다. 앱은 알림 채널, 재부팅 후 예약 복원에 필요한 `RECEIVE_BOOT_COMPLETED`, 예약 동작을 위한 `WAKE_LOCK`을 사용하며 정확 알람 특수 권한은 요청하지 않습니다. 웹 환경에서는 네이티브 호출 대신 오류 없는 미지원 결과를 반환합니다.

## Free·Pro entitlement 구조

`src/services/entitlementService.js`에 제한과 기능 판정을 모았습니다.

Free 제한:

- 전체 아이템 최대 50개
- 기억할 것 최대 5개
- 기본 테마 1종
- 음력 수동 변환, 기본 백업, 기본 D-Day
- 당일 알림
- 돈 리포트 합계 요약

Pro로 판정될 때 허용되는 구현 기능:

- 아이템과 기억할 것 개수 제한 해제
- 매월·매년 반복 일정
- 음력 반복 기념일의 연도별 자동 계산
- D-7·D-3·하루 전·당일 알림
- 월별·연간 돈 리포트 상세

`canUseFeature`가 단순 권한을 판정하고 `requirePro`가 페이월 트리거와 안내 문구를 반환합니다. 현재 `mirikkok_pro`는 로컬 상태지만 개발용 활성화 UI는 제거되었습니다. 실제 출시에서는 Google Play 구매 조회 결과를 검증한 뒤 이 상태를 갱신하는 Billing 어댑터가 필요합니다.

추가 테마, 생체인증 잠금과 위젯은 entitlement 이름만 준비되어 있고 실제 기능은 구현되어 있지 않습니다.

## Google Play Billing 구조

`src/services/purchaseService.js`는 다음 경계를 정의합니다.

```js
createPurchaseService({
  purchase,
  restorePurchases,
})
```

현재 기본 구현은 구매와 복원 모두 `NOT_CONFIGURED`를 반환합니다. Google Play Billing 라이브러리 또는 Capacitor Billing 플러그인은 아직 설치되지 않았고 Android Manifest에도 Billing 권한이 없습니다. 따라서 결제 버튼은 실제 결제를 시작하지 않으며, 내부 테스트 전에 다음 구현이 필요합니다.

1. Play Billing 클라이언트 연결과 상품 조회
2. 구매 흐름 시작 및 결과 처리
3. 미소비 구매 조회를 통한 구매 복원
4. 구매 확인(acknowledge)과 오류·취소·보류 처리
5. 검증된 구매 결과를 entitlement 상태에 반영
6. 라이선스 테스터와 release 서명 앱에서 실제 검증

## 상품과 가격 정책

가격의 단일 소스는 `src/constants/pricing.js`의 `PRO_PRICING`입니다.

- 상품 ID: `mirikkok_pro_lifetime`
- 미리꼭 Pro 평생 이용권
- 정가 9,900원
- 출시 기념 한정 할인가 5,900원
- 40% 할인
- 일회성 비소모성 평생 이용권
- 할인 종료 시 Google Play Console 가격과 앱 설정을 함께 변경해야 함

임의 종료일이나 가짜 카운트다운은 표시하지 않습니다. 가격을 다른 코드에 숫자로 중복 작성하지 말고 반드시 `PRO_PRICING`을 사용합니다.

## 돈 리포트

`src/utils/moneyReport.js`가 UI와 분리해 날짜와 금액이 있는 `payment`, `shopping` 항목만 계산합니다. 월별·연간 합계, 완료·예정 금액, 카테고리별 합계를 제공합니다. Free 화면에는 월·연 합계만 표시되고 상세는 Pro 페이월로 연결됩니다.

## 백업·복원

백업 JSON에는 다음만 포함됩니다.

```js
{
  schemaVersion,
  exportedAt,
  appName: '미리꼭',
  items,
  settings: { theme }
}
```

Pro 상태, 결제 토큰, 인증정보와 카드정보는 포함하지 않습니다. 가져오기 전에 헤더, 스키마 버전, 아이템 필드와 날짜를 모두 검증하며 검증 실패 시 기존 데이터를 변경하지 않습니다.

- 병합: 기존 ID와 중복되면 가져온 아이템으로 갱신
- 교체: 확인 UI를 거친 뒤 기존 아이템을 백업 내용으로 대체
- 초기화: 두 단계 확인 후 아이템과 테마를 삭제하고 스키마 버전을 유지
- Pro 로컬 상태: 백업·가져오기·데이터 초기화 대상이 아님

Android의 `android:allowBackup`은 `false`입니다. 앱 자체 JSON 백업 파일은 사용자가 안전한 위치에 직접 보관해야 합니다.

## 테스트 방법

전체 Node 단위 테스트:

```bash
npm test
```

프로덕션 웹 빌드:

```bash
npm run build
```

Android 동기화와 정적 검사:

```bash
npx cap sync android
cd android
./gradlew lintRelease
```

Android release bundle:

```bash
npm run android:bundle
```

세부 자동·수동 회귀 항목은 `TEST_CHECKLIST.md`, 출시 판정 항목은 `RELEASE_CHECKLIST.md`를 확인합니다.

## AAB 빌드와 버전

현재 값:

- package name: `com.mirikkok.app`
- versionName: `1.0.0`
- versionCode: `1`
- R8 코드 축소와 리소스 축소: release 빌드에서 활성화

서명 설정 후 다음 명령을 실행합니다.

```bash
npm run android:bundle
```

결과 위치:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

`android/key.properties`가 없으면 로컬 검증용 미서명 AAB가 생성되며 Play Console에 업로드하면 안 됩니다. 새 AAB를 Play Console에 업로드할 때마다 `android/app/build.gradle`의 `versionCode`를 증가시킵니다.

## 서명키 관리

Play App Signing을 사용하고 업로드 키는 저장소 밖의 안전한 위치에 보관합니다.

```bash
keytool -genkeypair -v \
  -keystore /안전한/절대경로/mirikkok-upload-key.jks \
  -alias mirikkok-upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

```bash
cp android/key.properties.example android/key.properties
```

복사한 파일에 실제 `storeFile`, `storePassword`, `keyAlias`, `keyPassword`를 입력합니다. 키 저장소, 비밀번호, `key.properties`는 Git·문서·이슈·메신저에 첨부하지 않습니다. 키 백업 위치와 접근 권한은 프로젝트 소유자가 별도로 관리해야 합니다.

## Google Play 내부 테스트

1. Play Console 앱 package name을 `com.mirikkok.app`으로 확인합니다.
2. Play App Signing을 설정하고 업로드 키로 서명한 AAB를 준비합니다.
3. 앱 액세스, 광고, 대상 연령, 콘텐츠 등급, 데이터 보안과 스토어 등록정보를 작성합니다.
4. 공개 HTTPS 개인정보처리방침 URL을 앱 내부 문구와 일치시킵니다.
5. 일회성 상품 `mirikkok_pro_lifetime`과 구매 옵션을 생성·활성화합니다.
6. 내부 테스트 릴리스를 만들고 서명된 AAB와 출시 노트를 업로드합니다.
7. 라이선스 테스터를 등록하고 Play 스토어 참여 링크로 설치합니다.
8. 실행·업데이트·오프라인·알림·구매·복원·취소·보류 흐름을 실제 기기에서 확인합니다.

공식 절차는 [Play App Signing](https://developer.android.com/studio/publish/app-signing), [AAB 업로드](https://developer.android.com/studio/publish/upload-bundle), [내부 테스트](https://support.google.com/googleplay/android-developer/answer/9845334) 문서를 함께 확인합니다.

## 개인정보처리방침

앱 내부 정책은 `src/constants/legal.js`에서 관리하고 설정 화면에서 표시합니다. 일정·메모는 로컬에 저장되고 개발자가 직접 수집하지 않으며, 앱에는 분석·광고·원격 오류수집 SDK가 없습니다.

Google Play 제출 전에는 로그인 없이 열리는 공개 HTTPS 개인정보처리방침 페이지가 필요합니다. SDK, 권한, 결제 또는 데이터 처리 방식이 바뀌면 앱 내부 문구, 공개 페이지, Play Console 데이터 보안 답변을 함께 갱신합니다. 상세 점검은 `PRIVACY_CHECKLIST.md`를 사용합니다.

## 알려진 제한사항

- Google Play Billing 어댑터가 없고 구매·복원은 `NOT_CONFIGURED`입니다.
- 현재 생성된 release AAB는 실제 업로드 키가 없어 미서명 상태입니다.
- 공개 개인정보처리방침 HTTPS URL이 아직 정해지지 않았습니다.
- Google Play 내부 테스트와 실제 기기 release 결제 검증을 완료하지 않았습니다.
- Pro 상태는 로컬 키 구조만 존재하며 Play 구매 상태와 동기화되지 않습니다.
- 반복 일정 수정은 전체 반복 일정만 지원합니다.
- 월간 음력 반복은 지원하지 않고 음력은 매년 반복만 계산합니다.
- 알림은 정확 알람 권한을 사용하지 않아 기기 배터리 정책에 따라 지정 시각 부근에 전달될 수 있습니다.
- 추가 테마, 생체인증 잠금과 위젯은 구현되어 있지 않습니다.
- localStorage가 차단된 환경의 메모리 대체 데이터는 새로고침 후 사라집니다.
- 앱 아이콘과 스플래시는 리소스가 준비되어 있으나 최종 브랜드 승인이 필요합니다.

## 향후 개발 항목

우선순위 순서:

1. Google Play Billing 실제 어댑터와 검증된 entitlement 동기화
2. 서명된 release AAB 생성 및 Play 내부 테스트
3. 공개 개인정보처리방침 URL 게시와 Play Console 데이터 보안 작성
4. 실제 기기에서 알림 재부팅 복원, 권한 거부, 백그라운드 동작 회귀 테스트
5. Pro 추가 테마 구현
6. 생체인증 잠금 구현과 개인정보 문구 재검토
7. Android 위젯 검토 및 구현
8. 반복 일정의 “이 일정만”과 “이후 일정” 수정 모델 설계

새 SDK나 서버 기능을 추가할 때는 기능 명세, 개인정보처리방침과 체크리스트를 먼저 갱신합니다.

## 개발 원칙

- 실제 편집 대상은 `src/` 소스코드이며 기존 프로젝트를 통째로 덮어쓰지 않습니다.
- `Mirikkok-Dev-Handoff-v1.html`의 압축 번들은 직접 수정하지 않습니다.
- 기능 명세 밖의 기능을 임의로 추가하지 않습니다.
- 기능 단위 브랜치와 커밋을 사용하고 각 단계 끝에 `npm run build`를 실행합니다.
- 가격과 상품 ID는 `PRO_PRICING` 한곳에서 관리합니다.
- 오류가 발생하면 우회하기 전에 원인을 기록하고 해결합니다.
