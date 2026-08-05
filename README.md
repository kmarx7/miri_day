# 미리꼭

개인 일정, 할 일, 지출, 기념일을 한곳에서 관리하는 Vite + React + Tailwind 앱입니다.

현재 저장소는 편집 가능한 React 앱과 Capacitor Android 프로젝트를 포함합니다. Android 로컬 알림은 연결되어 있으며 Google Play Billing은 아직 연결 전입니다.

## 개발 환경

- Node.js 22 이상
- npm
- JDK 21
- Android Studio 2025.2.1 이상
- Android SDK Platform 36과 Build Tools 36

## 설치 및 실행

```bash
npm install
npm run dev
```

개발 서버가 출력한 로컬 URL을 브라우저에서 엽니다.

## 프로덕션 빌드

```bash
npm run build
npm run preview
```

빌드 결과는 `dist/`에 생성됩니다.

## Android 실행

웹 빌드와 Android 동기화를 한 번에 실행합니다.

```bash
npm run android:sync
```

Android Studio에서 프로젝트를 열거나 연결 기기·에뮬레이터에서 실행합니다.

```bash
npm run android
npm run android:run
```

Android Studio가 기본 경로에 없다면 `CAPACITOR_ANDROID_STUDIO_PATH`에 실행 파일 경로를 지정합니다. 로컬 JDK와 SDK 경로는 Android Studio 또는 셸 환경에서 설정하며 저장소에 커밋하지 않습니다.

## Google Play 릴리스 서명과 AAB

신규 Play 앱은 [Play App Signing](https://developer.android.com/studio/publish/app-signing)을 사용합니다. 업로드 키는 저장소 밖의 안전한 위치에서 다음과 같이 한 번만 생성합니다.

```bash
keytool -genkeypair -v \
  -keystore /안전한/절대경로/mirikkok-upload-key.jks \
  -alias mirikkok-upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

`android/key.properties.example`을 `android/key.properties`로 복사하고 실제 경로와 비밀번호를 로컬에서 입력합니다. `key.properties`, `*.jks`, `*.keystore`는 Git에서 제외되며 실제 값은 문서나 이슈에도 기록하지 않습니다.

```bash
cp android/key.properties.example android/key.properties
```

서명 설정 후 Google Play용 릴리스 AAB를 만듭니다.

```bash
npm run android:bundle
```

결과는 `android/app/build/outputs/bundle/release/app-release.aab`에 생성됩니다. `android/key.properties`가 없으면 로컬 검증용 미서명 AAB만 생성되므로 Play Console에는 업로드하지 않습니다. 각 새 업로드 전에는 `android/app/build.gradle`의 `versionCode`를 반드시 증가시킵니다.

현재 Android 릴리스 값은 다음과 같습니다.

- package name: `com.mirikkok.app`
- versionName: `1.0.0`
- versionCode: `1`
- minSdk: 24
- compileSdk / targetSdk: 36
- R8 코드 축소 및 리소스 축소: release 빌드에서 활성화

## Google Play 내부 테스트 트랙

1. Play Console에서 앱을 생성하고 package name을 `com.mirikkok.app`으로 확인합니다.
2. 앱 액세스, 광고 여부, 콘텐츠 등급, 대상 연령, 데이터 보안, 스토어 등록정보와 공개 개인정보처리방침 URL을 작성합니다.
3. Play App Signing에 등록하고 로컬 업로드 키로 서명한 `app-release.aab`를 준비합니다.
4. `테스트 및 출시 > 테스트 > 내부 테스트`에서 새 릴리스를 만들고 AAB를 업로드합니다.
5. 출시 노트를 입력하고 오류·경고를 검토한 뒤 내부 테스트 릴리스를 시작합니다.
6. 이메일 목록 또는 Google 그룹으로 테스터를 추가하고 참여 링크를 전달합니다. 내부 테스트는 앱당 최대 100명을 지원합니다.
7. Play 스토어에서 설치해 앱 실행, 업데이트, 오프라인 실행, 로컬 알림과 결제·복원을 테스트합니다.

Google Play의 [내부 테스트 안내](https://support.google.com/googleplay/android-developer/answer/9845334)와 [AAB 업로드 안내](https://developer.android.com/studio/publish/upload-bundle)를 기준으로 진행합니다. 신규 개인 개발자 계정은 프로덕션 공개 전에 별도의 비공개 테스트 요건이 적용될 수 있습니다.

## Google Play Pro 상품

Play Console의 `수익 창출 > 제품 > 일회성 제품`에서 다음 상품을 생성합니다.

- 상품 ID: `mirikkok_pro_lifetime`
- 상품명: `미리꼭 Pro 평생 이용권`
- 유형: 일회성 제품의 `구매(Buy)` 옵션
- 정가: 9,900원
- 출시 기념 한정 할인가: 5,900원
- 수량: 1개, 비소모성 평생 권한

상품과 구매 옵션을 활성화한 뒤 라이선스 테스터 계정으로 승인·거절·보류·복원 흐름을 확인해야 합니다. 현재 앱의 `purchaseService`는 `NOT_CONFIGURED` 상태이므로 실제 결제 및 구매 복원 테스트는 Google Play Billing 어댑터 구현 전에는 통과할 수 없습니다.

## Android 로컬 알림

- 알림은 오전 9시(Asia/Seoul)에 예약됩니다.
- Free는 당일 알림, Pro는 D-7·D-3·하루 전·당일 및 반복·음력 자동 일정을 지원합니다.
- Android 13 이상에서는 처음 알림을 저장할 때 시스템 알림 권한을 요청합니다.
- 권한을 거부했다면 Android 설정의 `앱 > 미리꼭 > 알림`에서 다시 허용합니다.
- 정확 알람 특수 권한은 요청하지 않습니다. 일정 알림은 배터리 정책에 따라 지정 시각 부근에 표시될 수 있습니다.
- 예약은 기기에만 저장되며, Capacitor 복원 리시버가 기기 재부팅 후 남은 예약을 복원합니다.

실제 기기에서는 `scheduleFiveMinuteTestNotification()` 인터페이스와 일정 날짜를 이용해 다음 항목을 확인합니다.

- 앱 전면·백그라운드·종료 상태
- 일정 수정·삭제·완료 후 기존 알림 제거
- 반복 일정과 음력 기념일의 다음 발생일
- 알림 권한 거부 후 설정 안내

## Google Play 개인정보처리방침 공개

앱 안의 `설정 > 개인정보처리방침`에서 현재 데이터 처리 내용을 확인할 수 있습니다. Google Play 제출 전에는 다음 조건을 만족하는 외부 개인정보처리방침 페이지를 별도로 공개해야 합니다.

- 로그인 없이 열리는 공개 HTTPS URL
- 앱 내부 개인정보처리방침과 동일한 내용
- 일정·메모의 기기 저장, 로컬 알림 권한, Google Play 결제 처리와 백업·삭제 동작을 실제 구현과 일치하게 설명
- Play Console과 스토어 등록정보에 동일한 URL 입력
- SDK 또는 데이터 처리 방식이 바뀌면 앱 내부 화면과 외부 페이지를 함께 갱신

현재는 분석·광고·원격 오류수집 SDK를 사용하지 않으므로 해당 SDK를 정책에 임의로 기재하지 않습니다. 외부 정책 URL은 아직 정해지지 않았으며 배포 전에 반드시 준비해야 합니다.

## 주요 파일

```text
src/main.jsx          React 진입점
src/App.jsx           현재 UI 프로토타입
src/index.css         Tailwind CSS 진입점과 기본 폰트
src/utils/lunar.js    음력 변환과 D-Day 유틸리티
src/services/entitlementService.js  Free·Pro 권한 정책
src/services/purchaseService.js     Google Play Billing 연결 인터페이스
src/services/notificationService.js Android 로컬 알림 권한과 예약 동기화
src/utils/notifications.js          알림 ID, 시각, 반복 발생 일정 계산
capacitor.config.ts                 Capacitor 앱 ID와 웹 자산 설정
android/                            Android Studio 프로젝트
```

`Mirikkok-Dev-Handoff-v1.html`은 디자인과 동작을 참고하기 위한 독립형 번들입니다. 직접 수정하지 않습니다.

## 개발 원칙

- 기능 명세에 있는 기능만 단계적으로 구현합니다.
- 실제 편집은 `src/` 소스코드를 기준으로 진행합니다.
- 기능 단위 브랜치와 커밋을 사용합니다.
- 각 단계가 끝날 때 `npm run build`를 실행합니다.
- Android Pro 상품은 Google Play Billing의 일회성 비소모성 평생 이용권으로 구현합니다.
- Pretendard를 불러오지 못하면 시스템 `sans-serif` 폰트로 표시됩니다.
