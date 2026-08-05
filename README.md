# 미리꼭 - Vite + React + Tailwind 스타터

## 실행
```
npm install
npm run dev
```
개발용 라이선스 키: MIRI-TEST-KEY 입력하면 Pro 활성화 (Lemon Squeezy 연동 전)

## 포함된 것
- 홈: 하나만 보이고 화살표로 펼쳐보기 배너 + 2x2 카드 + 오늘 하이라이트 4+더보기
- 리스트: 스와이프 오른쪽 완료 / 왼쪽 삭제 + 실행취소 스낵바
- 입력 모달: 카테고리 칩, 금액 조건부 노출, 음력 토글 + lunar-javascript 변환
- 페이월: 정가 9,900 → 한정 5,900 (-40%) 한정 기간 문구
- utils/lunar.js: 음력→양력, D-Day, 올해 양력 구하기
- utils/license.js: Lemon Squeezy 검증 + 목업

## Lemon Squeezy 연동 방법
1. lemonsqueezy.com 가입 → Store 생성 → Product "미리꼭 Pro" 생성
2. Variants: Default ₩9,900, Discount ₩5,900 (쿠폰 또는 별도 Variant)
3. Settings → API Keys → API Key 생성
4. 프론트 .env에 VITE_LEMON_API_KEY=...
5. 실제 검증은 서버에서 해야 안전하지만 MVP는 클라이언트 검증으로 OK (utils/license.js 참고)

## 다음 할 일 (개발자)
- Capacitor로 iOS/Android 래퍼 (알림 위해)
- 위젯, 생체인증 잠금은 네이티브 플러그인 추가 후
- App Store IAP는 RevenueCat으로 교체