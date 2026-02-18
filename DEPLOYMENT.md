# 배포 가이드

## Vercel 배포 (권장)

Vercel은 Next.js의 제작사로, 가장 쉽고 빠른 배포 방법을 제공합니다.

### 1. GitHub 연동 배포

1. GitHub에 프로젝트 푸시:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/what-should-i-eat.git
git push -u origin main
```

2. [Vercel](https://vercel.com) 접속 및 로그인

3. "New Project" 클릭

4. GitHub 저장소 import

5. 프로젝트 설정:
   - Framework Preset: Next.js (자동 감지)
   - Build Command: `npm run build` (기본값)
   - Output Directory: `.next` (기본값)

6. "Deploy" 클릭

7. 배포 완료 후 자동으로 URL 생성 (예: `https://what-should-i-eat.vercel.app`)

### 2. Vercel CLI 배포

```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 디렉토리에서 실행
cd what-should-i-eat
vercel

# 프로덕션 배포
vercel --prod
```

## Netlify 배포

### 1. GitHub 연동 배포

1. GitHub에 프로젝트 푸시

2. [Netlify](https://netlify.com) 접속 및 로그인

3. "New site from Git" 클릭

4. GitHub 저장소 선택

5. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `.next`

6. "Deploy site" 클릭

### 2. Netlify CLI 배포

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 로그인
netlify login

# 배포
netlify deploy --prod
```

## AWS Amplify 배포

1. [AWS Amplify Console](https://console.aws.amazon.com/amplify/) 접속

2. "New app" → "Host web app" 클릭

3. GitHub 저장소 연결

4. 빌드 설정 (자동 감지):
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

5. "Save and deploy" 클릭

## Docker 배포

### Dockerfile 작성

프로젝트 루트에 `Dockerfile` 생성:

```dockerfile
FROM node:22-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### next.config.ts 수정

Docker 배포를 위해 `next.config.ts` 파일 수정:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

### Docker 빌드 및 실행

```bash
# 이미지 빌드
docker build -t what-should-i-eat .

# 컨테이너 실행
docker run -p 3000:3000 what-should-i-eat
```

### Docker Compose

`docker-compose.yml` 작성:

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

실행:
```bash
docker-compose up -d
```

## 환경 변수 설정

프로덕션 환경에서 환경 변수가 필요한 경우 (예: Stripe 통합):

### Vercel
1. 프로젝트 설정 → Environment Variables
2. 변수 추가:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`

### Netlify
1. Site settings → Build & deploy → Environment
2. 변수 추가

### Docker
`.env.production` 파일 생성 또는 `docker run` 시 `-e` 플래그 사용:
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_... \
  -e STRIPE_SECRET_KEY=sk_... \
  what-should-i-eat
```

## 커스텀 도메인 설정

### Vercel
1. 프로젝트 설정 → Domains
2. 도메인 추가 및 DNS 설정 안내 따르기

### Netlify
1. Site settings → Domain management
2. 커스텀 도메인 추가

### AWS Amplify
1. App settings → Domain management
2. 도메인 추가 및 Route 53 연동

## 성능 최적화

### 1. 이미지 최적화
Next.js의 `Image` 컴포넌트 사용 (이미 적용됨)

### 2. 번들 크기 분석
```bash
npm install @next/bundle-analyzer

# next.config.ts에 추가
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# 분석 실행
ANALYZE=true npm run build
```

### 3. 캐싱 전략
Vercel/Netlify는 자동으로 정적 자산 캐싱 처리

## 모니터링

### Vercel Analytics
```bash
npm install @vercel/analytics

# app/layout.tsx에 추가
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

## 문제 해결

### 빌드 실패
- `npm install` 재실행
- Node.js 버전 확인 (22.x 권장)
- `package-lock.json` 삭제 후 재설치

### 런타임 오류
- 브라우저 콘솔 확인
- Vercel/Netlify 로그 확인
- 환경 변수 설정 확인

### 성능 문제
- Lighthouse 스코어 확인
- 번들 크기 분석
- 불필요한 의존성 제거
