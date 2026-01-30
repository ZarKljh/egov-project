# ============================================
# Next.js - Multi-stage, standalone 출력으로 이미지 최소화
# ============================================

# Stage 1: 의존성 설치 + 빌드
FROM node:20-alpine AS builder

WORKDIR /app

# 패키지 파일만 먼저 복사 (캐시 활용)
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: standalone 출력만 복사하여 실행 (용량 최소화)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# standalone 빌드 결과만 복사 (node_modules 제외)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
