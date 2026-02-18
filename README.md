# 오늘 뭐 먹지? (What Should I Eat Today)

음식 선택 고민을 즉시 해결해주는 결정 엔진 웹 앱입니다. 혼자, 커플, 가족, 친구와 함께 먹을 음식을 빠르게 추천받으세요.

## 주요 기능

### 핵심 기능
- **즉시 결정**: 클릭 한 번으로 음식 추천
- **컨텍스트 기반 추천**: 누가 먹는지, 어떻게 먹을지에 따라 맞춤 추천
- **가족 모드**: 아이들에게 적합한 메뉴 자동 필터링
- **외부 서비스 연동**: Google, YouTube, Toss Shopping, Google Maps

### 결정 플로우
1. **누가 먹나요?** - 나 혼자 / 커플 / 가족 / 친구
2. **어떻게 먹을까요?** - 만들어 먹기 / 배달 / 외식
3. **결과 확인** - 메뉴 추천 + 이유 + 액션 버튼

### 만들어 먹기 모드
- 메뉴 이름 및 추천 이유
- 필요한 재료 목록
- 레시피 보기 (Google 검색)
- 유튜브로 배우기 (YouTube 검색)
- 토스쇼핑에서 재료 구매

### 배달 모드
- 메뉴 추천 및 이유
- 배달 검색하기 (Google Maps)

### 외식 모드
- 근처 간단 외식 / 가까운 시내 / 기분전환 야외
- 식당 찾기 (Google Maps)

## 기술 스택

- **프레임워크**: Next.js 16.1.6 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **빌드 도구**: Turbopack
- **상태 관리**: React Hooks
- **저장소**: LocalStorage

## 프로젝트 구조

```
what-should-i-eat/
├── app/
│   ├── layout.tsx          # 레이아웃 및 메타데이터
│   ├── page.tsx             # 메인 페이지
│   └── globals.css          # 글로벌 스타일
├── components/
│   ├── HomeScreen.tsx       # 홈 화면
│   ├── DecisionFlow.tsx     # 결정 플로우
│   ├── ResultScreen.tsx     # 결과 화면
│   └── UsageLimitModal.tsx  # 사용량 제한 모달
├── lib/
│   ├── menuData.ts          # 메뉴 데이터베이스
│   ├── decisionEngine.ts    # 결정 엔진 로직
│   └── usageLimit.ts        # 사용량 제한 유틸리티
└── public/                  # 정적 파일
```

## 시작하기

### 개발 환경 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 앱을 확인하세요.

### 프로덕션 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm start
```

## 배포

### Vercel 배포 (권장)

1. GitHub에 프로젝트 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 import
3. 자동 배포 완료

```bash
# Vercel CLI 사용
npm install -g vercel
vercel
```

### 기타 플랫폼

- **Netlify**: `npm run build` 후 `.next` 폴더 배포
- **AWS Amplify**: Next.js 프리셋 사용
- **Docker**: Dockerfile 작성 후 컨테이너화

## 사용량 제한 및 수익화

### 무료 플랜
- 하루 3회 무료 추천
- LocalStorage 기반 추적

### 프리미엄 플랜 (준비 중)
- 무제한 결정
- 가족 식단 자동 생성
- 주간 메뉴 추천
- 개인 취향 학습
- 알레르기 필터링

### Stripe 통합 (준비)
`lib/usageLimit.ts`에 Stripe 통합을 위한 placeholder 함수가 구현되어 있습니다. 실제 Stripe 통합을 위해서는 다음 단계를 진행하세요:

1. Stripe 계정 생성 및 API 키 발급
2. `npm install stripe @stripe/stripe-js` 설치
3. `lib/usageLimit.ts`의 `createCheckoutSession` 함수 구현
4. 환경 변수 설정 (`.env.local`):
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
   STRIPE_SECRET_KEY=sk_...
   ```

## 향후 개선 사항

### AI 통합
현재는 규칙 기반 추천 시스템을 사용하고 있습니다. 향후 OpenAI API를 통합하여 더욱 정교한 추천을 제공할 수 있습니다.

```typescript
// lib/decisionEngine.ts 에서 AI 통합 준비 완료
// OpenAI API 키 설정 후 makeDecision 함수 수정
```

### 추가 기능
- 사용자 프로필 및 취향 학습
- 알레르기 및 식이 제한 필터
- 주간 메뉴 자동 생성
- 식단 기록 및 분석
- 소셜 공유 기능

## 라이선스

MIT License

## 문의

프로젝트 관련 문의사항은 이슈를 등록해주세요.
