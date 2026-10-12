# trackareer-cms — Cloud Run 이미지 (Next standalone)
# 빌드: docker build -t trackareer-cms .
# 실행: docker run -p 8080:8080 -e ADMIN_API_URL=https://app-api.trackareer.com trackareer-cms

FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 서버 액션 암호화 키: 인스턴스가 여럿이거나 배포가 겹칠 때 같은 키를 써야 한다 (선택, base64 32바이트)
ARG NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
ENV NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=${NEXT_SERVER_ACTIONS_ENCRYPTION_KEY}
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Cloud Run이 PORT를 넣는다 (기본 8080). ADMIN_API_URL은 실행 환경변수로 (서버 전용, 빌드에 넣지 않는다)
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
USER node
EXPOSE 8080
CMD ["node", "server.js"]
