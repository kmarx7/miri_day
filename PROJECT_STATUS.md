# 미리꼭 프로젝트 상태 및 다음 세션 인수인계

마지막 갱신: 2026-08-07 (Asia/Seoul)

이 문서는 다음 개발 세션을 시작할 때 가장 먼저 읽습니다. 실제 코드·Play Console·기기 상태가 바뀌었다면 먼저 이 문서와 체크리스트를 갱신합니다.

## 다음 세션에서 먼저 알려줄 내용

미리꼭의 웹·PWA 기반과 주요 로컬 기능은 구현되어 있습니다. Android 프로젝트와 알림 계산 기반도 있지만, Google Play 유료 출시 준비가 모두 끝난 것은 아닙니다.

아이폰 장기 사용 테스트용 PWA는 `https://mirikkok-iphone-test.vercel.app`에 최신 브랜치 기준으로 배포되어 있습니다. 테스트 배포에서는 `VITE_IPHONE_TEST_PRO=true`로 현재 구현된 Pro 기능을 사용할 수 있습니다. 다음 세션에서는 먼저 실제 사용 중 발견한 문제와 JSON 백업 여부를 확인합니다.

가장 먼저 결정할 사항은 다음 둘 중 하나입니다.

1. Pro 평생 이용권을 포함해 처음부터 유료 기능을 출시할지
2. 사업자등록 전에는 결제를 제거·비활성화한 무료 버전만 먼저 출시할지

현재 제품 기획을 유지한다면 **개인사업자 등록과 통신판매업 신고 준비를 먼저 시작한 뒤 Google Play Billing을 구현**하는 순서가 권장됩니다. 법인 설립이 반드시 필요한 것은 아니며, 정확한 세무·신고 의무는 관할 세무서·지자체 또는 세무 전문가에게 최종 확인합니다.

## 현재 Git 상태

- 원격 저장소: `git@github.com:kmarx7/miri_day.git`
- 현재 작업 브랜치: `feat/category-quick-add-ux`
- 최신 커밋: `cbbc9b2 feat: show category indicators in calendar`
- 아이폰 PWA 최신 배포: Vercel production `READY`, 고정 주소 alias 유지
- Vercel production branch: `release/iphone-pwa-test`
- Google Play AAB 준비 커밋: `d6f2bff chore: prepare google play release bundle`
- 기준 버전: `1.0.0`, versionCode `1`
- package name: `com.mirikkok.app`

현재 작업 브랜치는 `origin/feat/category-quick-add-ux`와 동기화되어 있습니다. `main`과 `release/iphone-pwa-test`에는 최신 UI 변경이 아직 병합되지 않았습니다. 정식 출시 전에는 Pull Request 또는 명시적인 병합 절차로 반영해야 합니다.

## 마지막 검증 결과

- `npm test`: 81개 통과
- `npm run build`: 성공
- `npx cap sync android`: 이전 실행 성공(최신 웹 변경 후 Android 작업 전에 다시 실행 필요)
- Android Gradle debug/release: 현재 Mac에 Java Runtime이 없어 실행 불가
- Android `lintRelease`/`bundleRelease`: 이전 단계 성공 기록은 있으나 최신 브랜치 기준 재검증 필요
- R8 코드 축소와 리소스 축소: 설정 활성화
- AAB 서명 상태: 실제 업로드 키가 없어 미서명
- 실제 Android 기기 release 검증: 미완료
- Vercel production 배포: `READY`
- 배포 HTTPS 응답: 200
- 배포 manifest: 정상
- 배포 service worker: `activated`
- 배포 홈·캘린더 브라우저 검증: 성공, 콘솔 오류 없음

`dist/`, Android 빌드 결과와 실제 서명 파일은 Git에 포함하지 않습니다. 다음 세션에서는 작업을 시작하기 전에 현재 작업 트리와 AAB 존재 여부를 다시 확인합니다.

## 아이폰 장기 테스트 배포

- 고정 주소: `https://mirikkok-iphone-test.vercel.app`
- Vercel 프로젝트: `mirikkok-iphone-test`
- 테스트 권한: Vercel의 `VITE_IPHONE_TEST_PRO=true` 설정으로 현재 구현된 Pro 기능 활성화
- 적용 범위: 아이폰 테스트 배포만 해당하며 Google Play용 정식 구매 권한과 분리
- GitHub 연결 저장소: `kmarx7/miri_day`
- 자동 production 배포 브랜치: `release/iphone-pwa-test`
- 데이터 저장: 해당 아이폰과 HTTPS origin의 `localStorage`

아이폰 Safari에서 주소를 연 뒤 `공유 > 홈 화면에 추가 > 웹 앱으로 열기`를 사용합니다. 테스트 중에는 같은 고정 주소만 사용하고 앱 삭제, Safari 사이트 데이터 삭제와 개인정보 보호 모드를 피합니다. 중요한 일정은 앱의 JSON 백업 기능으로 정기적으로 보관합니다.

현재 아이폰 PWA에서는 Android Capacitor 로컬 알림, Google Play Billing과 Android 뒤로 가기를 테스트할 수 없습니다. 웹 푸시는 별도로 구현되어 있지 않아 아이폰 알림도 제공되지 않습니다.

아이폰 테스트 배포에서 가능한 범위:

- 일정·할 일·지출·기념일 CRUD
- 음력·윤달 변환과 D-Day
- 반복 일정 계산
- 캘린더와 카테고리별 색상 점
- 돈 리포트
- JSON 백업·복원·초기화
- 테스트 Pro로 제한 해제된 UI 확인

아이폰 테스트 배포에서 불가능한 범위:

- Google Play Billing 실제 구매·복원
- Android Capacitor 로컬 알림과 재부팅 후 예약 유지
- Android 하드웨어 뒤로 가기
- Android release 서명·AAB 설치 검증

## 구현 완료 범위

- Vite + React + Tailwind 모바일 우선 UI
- 홈, 카테고리 목록, 캘린더, Pro, 설정과 정책 화면
- 다섯 카테고리 아이템 CRUD와 localStorage 저장
- 바텀시트 추가·수정, 금액·날짜·메모·음력 입력
- 완료·삭제 스와이프, 접근성 메뉴와 3초 실행취소
- 음력·윤달 변환과 Asia/Seoul 기준 D-Day
- 매월·매년 반복 발생 일정 계산
- Free 제한과 Pro 페이월 구조
- 월별·연간 돈 리포트
- JSON 백업·검증·병합·교체·초기화
- PWA manifest와 오프라인 앱 셸
- Capacitor Android 프로젝트와 뒤로 가기 처리
- Android 로컬 알림 계산·권한·채널·예약 동기화
- 앱 내부 개인정보처리방침·이용약관·오픈소스 고지
- release R8·선택적 서명 설정과 인수인계 체크리스트
- 카테고리별 빠른 입력(제목·금액·날짜·시간·메모)
- 입력·목록의 예정 시간과 등록 시간 구분
- 목록 메모 아이콘·인라인 펼침·수정 버튼
- 홈의 간결한 기억할 것 요약과 오늘 하이라이트
- PRO 화면의 돈 리포트 바로가기, 설정의 백업·복원 유지
- 캘린더 날짜별 카테고리 색상 점(중복 카테고리는 한 점)
- 모바일 320px·390px 레이아웃, 키보드·safe-area·실행취소 위치 보완

자세한 구현 구조는 `README.md`, 변경 이력은 `CHANGELOG.md`를 확인합니다.

## 출시 차단 항목

### 1. Google Play Billing 미구현

- `src/services/purchaseService.js`는 인터페이스만 제공
- 구매와 복원은 현재 `NOT_CONFIGURED` 반환
- Billing 라이브러리 또는 Capacitor 플러그인 미설치
- Android Billing 권한 없음
- Play 구매 결과와 `mirikkok_pro` entitlement 동기화 없음
- 승인·취소·거절·보류·구매 복원 테스트 불가능

상품 정책:

- 상품 ID: `mirikkok_pro_lifetime`
- 미리꼭 Pro 평생 이용권
- 정가 9,900원
- 출시 기념 한정 할인가 5,900원
- 40% 할인
- 일회성 비소모성 평생 이용권
- 할인 종료 시 Google Play Console 가격과 앱 설정을 함께 변경해야 함

가격과 상품 ID의 코드 단일 소스는 `src/constants/pricing.js`의 `PRO_PRICING`입니다.

### 2. Android release 서명 미완료

- 실제 업로드 키 생성 필요
- 로컬 `android/key.properties` 설정 필요
- 서명된 AAB 재생성 및 서명 검증 필요
- Play App Signing 등록 필요
- 키·비밀번호·`key.properties`는 절대 Git에 포함하지 않음

### 3. 외부 개인정보처리방침 URL 미정

- 앱 내부 정책 화면은 구현됨
- 공개 HTTPS 페이지는 아직 게시되지 않음
- 게시 전에 개발자 표시 이름, 문의 이메일과 공개 방식 결정 필요
- 실제 Billing 구현 후 구매 데이터 처리 문구 재검토 필요

### 4. 실제 기기 검증 미완료

- release 앱 설치·실행
- 앱 전면·백그라운드·종료 상태 알림
- 기기 재부팅 후 예약 복원
- 알림 권한 거부와 설정 안내
- Android 뒤로 가기, 키보드, safe-area, 화면 회전과 글자 확대
- 앱 재실행 후 localStorage 데이터 유지

### 5. Play Console 제출 정보 미작성

- 데이터 보안
- 콘텐츠 등급
- 대상 연령
- 앱 제목·짧은 설명·상세 설명
- 휴대전화·태블릿 스크린샷
- 개발자 공개 연락처
- 앱 아이콘·스플래시 최종 브랜드 승인
- 내부 테스트 트랙과 라이선스 테스터

## 사업자등록 관련 현재 결론

Google Play에는 개인 개발자 계정과 조직 계정이 있으며 개인 계정도 앱을 배포하고 수익화할 수 있습니다. 따라서 무료 앱을 개인 계정으로 배포하는 것 자체에 사업자등록이 항상 필수인 것은 아닙니다.

다만 Google 공식 안내상 한국 개발자가 유료 앱 또는 인앱결제를 제공할 때 Play Console에 다음 정보를 제공해야 합니다.

- 사업자등록번호
- 통신판매업 신고번호
- 통신판매업 신고기관
- 한국 사용자에게 표시될 연락처

따라서 미리꼭의 Pro 평생 이용권을 한국에서 판매하는 현재 계획을 유지한다면 개인사업자 등록과 통신판매업 신고를 준비하는 것이 안전합니다. 조직 Play 계정을 선택하면 D-U-N-S 번호가 추가로 필요할 수 있습니다.

참고할 Google 공식 문서:

- [한국 개발자 추가 연락처·유료 판매 요구사항](https://support.google.com/googleplay/android-developer/answer/3255733)
- [개인·조직 개발자 계정 유형](https://support.google.com/googleplay/android-developer/answer/13634885?hl=ko-kr)
- [Play Console 개발자 계정 필수 정보](https://support.google.com/googleplay/android-developer/answer/13628312)

이 기록은 법률·세무 자문이 아닙니다. 실제 등록 업종, 과세 유형, 통신판매업 신고 면제 여부 등은 사업 형태에 따라 달라질 수 있으므로 관계 기관에 확인합니다.

## 다음 작업 권장 순서

### 유료 Pro로 출시하는 경우

1. 개인사업자·통신판매업 준비와 Play 계정 유형 결정
2. 공개 개발자명, 문의 이메일, 연락처 결정
3. 외부 개인정보처리방침 정적 페이지 작성·HTTPS 배포
4. Play Console 앱 생성과 상품 `mirikkok_pro_lifetime` 등록
5. Google Play Billing 실제 어댑터 구현
6. 구매 확인, 복원과 entitlement 동기화 자동 테스트
7. 업로드 키 생성과 서명된 AAB 빌드
8. Play Console 제출 문구·스크린샷·데이터 보안 작성
9. 실제 기기 release·알림·결제 회귀 테스트
10. 내부 테스트 트랙 배포 후 오류 수정

### 무료 버전을 먼저 출시하는 경우

1. 무료 선출시 범위를 명시적으로 승인
2. Pro 가격·구매·복원 UI를 출시 빌드에서 제거 또는 비활성화
3. 유료 기능을 제공하지 않는 실제 동작에 맞춰 정책·스토어 문구 재검토
4. 외부 개인정보처리방침 게시
5. 서명된 AAB와 실제 기기 테스트
6. Play 내부 테스트와 무료 출시
7. 사업자 준비 후 Billing과 Pro를 별도 업데이트로 추가

무료 선출시는 현재 기능 범위를 바꾸는 결정이므로 사용자 승인 없이 코드에서 Pro 기능을 제거하지 않습니다.

## 다음 세션 시작 절차

1. 이 문서와 `README.md`의 알려진 제한사항을 읽습니다.
2. `git status -sb`와 현재 브랜치 `feat/category-quick-add-ux`를 확인합니다.
3. 아이폰에서 `https://mirikkok-iphone-test.vercel.app`을 열어 최근 변경을 확인합니다.
4. 실제 사용 중 발견한 UI·기능 문제와 최근 JSON 백업 여부를 사용자에게 먼저 묻습니다.
5. 첫 개발 작업은 아이폰 테스트에서 발견된 문제를 기준으로 정합니다. 현재 별도 승인 대기 기능은 없습니다.
6. Android 작업을 시작할 때는 JDK 설치 후 `npm run build && npx cap sync android`와 Gradle debug 빌드를 먼저 수행합니다.
7. 작업 전 수정할 파일과 이유를 먼저 보고합니다.
8. 승인된 한 단계의 최소 범위만 수정합니다.
9. 완료 시 `npm test`, `npm run build`, 기존 기능, 수정 파일과 Git 커밋을 확인합니다.

## 관련 문서

- `README.md`: 전체 기술 인수인계
- `CHANGELOG.md`: 구현 변경 이력
- `RELEASE_CHECKLIST.md`: Google Play 출시 체크리스트
- `PRIVACY_CHECKLIST.md`: 개인정보·데이터 보안 체크리스트
- `TEST_CHECKLIST.md`: 자동·수동 회귀 테스트 체크리스트
- `FEATURE_SPEC.md`: 기능 명세
- `Mirikkok-Dev-Handoff-v1.html`: 참고 번들, 직접 수정 금지
