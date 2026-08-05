# 변경 이력

이 문서는 사용자에게 영향을 주는 주요 변경사항을 기록합니다. 현재 `1.0.0`은 Google Play에 공개 출시되지 않았으므로 모든 항목은 Unreleased 상태입니다.

## [Unreleased] - 2026-08-05

### 추가

- Vite + React + Tailwind 기반의 편집 가능한 앱 구조
- 다섯 카테고리의 아이템 모델과 localStorage CRUD
- 모바일 홈, 카테고리 목록, 캘린더, Pro, 설정 화면
- 바텀시트 아이템 추가·수정과 금액·날짜·음력 입력
- 완료·삭제 스와이프, 접근성 메뉴와 3초 실행취소
- `lunar-javascript` 기반 음력·윤달 변환과 D-Day
- 필요한 기간만 계산하는 매월·매년 반복 발생 일정
- Free·Pro 권한 판정과 일회성 평생 이용권 페이월
- 월별·연간 돈 리포트와 JSON 백업·복원·초기화
- PWA manifest, 오프라인 앱 셸과 오류 경계
- Capacitor Android 프로젝트와 하드웨어 뒤로 가기 처리
- Android 로컬 알림 권한·채널·예약 동기화
- 설정, 개인정보처리방침, 이용약관과 오픈소스 고지
- release R8 설정, 선택적 업로드 키 서명과 AAB 빌드 문서
- 출시·개인정보·테스트 체크리스트와 최종 인수인계 문서

### 변경

- Pro 가격과 상품 ID를 `src/constants/pricing.js`의 `PRO_PRICING`으로 통합
- 프로덕션 Capacitor 로그를 비활성화
- 앱 셸을 완전 로컬로 제공하기 위해 외부 폰트 요청과 불필요한 `INTERNET` 권한 제거
- Android versionName을 `1.0.0`으로 정리하고 targetSdk/compileSdk 36 유지
- release 빌드에서 R8 코드 축소와 리소스 축소 활성화

### 제거

- Lemon Squeezy 관련 결제·라이선스 구조와 문자열
- 개발용 Pro 활성화 목업 UI와 서비스

### 알려진 미완료

- Google Play Billing 실제 구매·복원 어댑터
- 업로드 키로 서명된 AAB와 Play 내부 테스트
- 외부 공개 개인정보처리방침 URL
- 추가 Pro 테마, 생체인증 잠금과 위젯
- 반복 일정의 단일·이후 일정 수정
