# Google Play 출시 체크리스트

체크 표시는 현재 저장소에서 자동으로 확인된 상태만 반영합니다. Play Console이나 실제 기기가 필요한 항목은 담당자가 완료 후 직접 표시합니다.

## 버전과 앱 정보

- [x] 앱 이름이 `미리꼭`인지 확인
- [x] package name이 `com.mirikkok.app`인지 확인
- [x] versionName이 `1.0.0`인지 확인
- [x] versionCode가 `1`인지 확인
- [x] minSdk 24, compileSdk 36, targetSdk 36 확인
- [ ] 이번 업로드가 두 번째 이상이면 versionCode 증가
- [ ] 앱 아이콘과 스플래시 최종 브랜드 승인

## 코드와 빌드

- [x] 개발용 Pro 활성화 UI·서비스 제거
- [x] 프로덕션 Capacitor 로그 비활성화
- [x] 테스트 API·개발 서버 URL 미포함 확인
- [x] 불필요한 `INTERNET` 및 정확 알람 권한 미요청 확인
- [x] release R8 코드 축소와 리소스 축소 활성화
- [x] `npm test` 통과
- [x] `npm run build` 통과
- [x] `npx cap sync android` 통과
- [x] Android `lintRelease` 통과
- [x] 미서명 `bundleRelease` 생성 검증
- [ ] 업로드 키로 서명된 `bundleRelease` 생성
- [ ] `jarsigner` 또는 Android Studio로 최종 AAB 서명 검증
- [ ] 실제 release 앱 설치와 시작 확인

## 서명과 보안

- [x] `key.properties`, `*.jks`, `*.keystore` Git 제외 확인
- [x] 비밀값이 없는 `android/key.properties.example` 제공
- [ ] Play App Signing 등록
- [ ] 업로드 키를 저장소 밖에 생성
- [ ] 업로드 키의 암호화 백업과 접근 담당자 지정
- [ ] Git 기록과 배포 로그에 키·비밀번호가 없는지 재확인

## Google Play Billing

- [ ] 실제 Google Play Billing 어댑터 구현
- [ ] 상품 ID `mirikkok_pro_lifetime` 생성
- [ ] 상품을 일회성 비소모성 평생 이용권으로 활성화
- [ ] 정가 9,900원 설정
- [ ] 출시 기념 한정 할인가 5,900원과 40% 할인 표시 확인
- [ ] 승인·취소·거절·보류·복원 흐름 처리
- [ ] 구매 확인(acknowledge) 처리
- [ ] 앱 재설치 후 구매 복원 확인
- [ ] 라이선스 테스터 계정에서 release 앱 결제 확인

현재 Billing은 `NOT_CONFIGURED`이므로 이 섹션을 완료하기 전에는 출시할 수 없습니다.

## 개인정보와 Play Console

- [x] 앱 내부 개인정보처리방침·이용약관 제공
- [x] 분석·광고·원격 오류수집 SDK가 없음을 코드 기준으로 확인
- [ ] 공개 HTTPS 개인정보처리방침 URL 게시
- [ ] 앱 내부 정책과 외부 정책 내용 일치 확인
- [ ] Play Console 데이터 보안 양식 작성
- [ ] 앱 액세스와 광고 여부 작성
- [ ] 대상 연령과 콘텐츠 등급 작성
- [ ] 스토어 설명, 스크린샷, 아이콘과 연락처 등록
- [ ] 사용하는 권한의 목적을 Play Console 답변과 일치시킴

세부 항목은 `PRIVACY_CHECKLIST.md`를 사용합니다.

## 내부 테스트

- [ ] 서명된 AAB 업로드
- [ ] 출시 노트 작성
- [ ] 내부 테스터·라이선스 테스터 등록
- [ ] Play 스토어 참여 링크로 설치
- [ ] 기존 버전에서 업데이트 및 데이터 유지 확인
- [ ] 오프라인 실행 확인
- [ ] 알림 권한 승인·거부와 재부팅 후 예약 확인
- [ ] 결제와 구매 복원 확인
- [ ] 비정상 종료와 ANR 확인
- [ ] 내부 테스트 결과를 `TEST_CHECKLIST.md`에 기록

## 출시 판정

- [ ] 출시 차단 오류 0개
- [ ] 높은 우선순위 오류 0개
- [ ] 미완료 항목의 담당자와 일정 기록
- [ ] 최종 AAB의 versionCode, SHA-256과 보관 위치 기록
- [ ] 릴리스 승인자 확인
