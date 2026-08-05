# 미리꼭

개인 일정, 할 일, 지출, 기념일을 한곳에서 관리하는 Vite + React + Tailwind 앱입니다.

현재 저장소는 편집 가능한 React 앱과 Capacitor Android 프로젝트를 포함합니다. Android 결제와 알림은 아직 연결하지 않았습니다.

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

Google Play용 릴리스 AAB 기반 파일은 다음 명령으로 만듭니다.

```bash
npm run android:bundle
```

결과는 `android/app/build/outputs/bundle/release/app-release.aab`에 생성됩니다. Play 배포 전에는 별도의 업로드 키와 릴리스 서명 설정이 필요합니다.

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
- 실제 결제 연결 전에는 개발 모드의 명시적인 목업 버튼으로만 Pro 권한을 테스트합니다.
- Pretendard를 불러오지 못하면 시스템 `sans-serif` 폰트로 표시됩니다.
