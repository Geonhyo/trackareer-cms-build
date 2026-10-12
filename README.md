# trackareer-cms

트래커리어 운영 도구. `trackareer-admin`(Vite · Refine · AntD)을 대체하며, 인스타그램 콘텐츠 제작 기능을 함께 둔다. 기획 확정 전이라 지금은 뼈대만 있다.

## 스택

`trackareer-web`과 같다 — Next.js 16 (App Router) · React 19 · TypeScript · CSS Modules · ESLint(eslint-config-next) · Prettier · pnpm. 디자인 토큰(`src/app/globals.css`)과 Pretendard 폰트도 web에서 가져왔다.

## 실행

```bash
pnpm install
pnpm dev        # http://localhost:3002
pnpm build
pnpm lint && pnpm typecheck
```

포트는 **3002** 고정(`dev` · `start` 스크립트).

## 백엔드

`trackareer-server`의 `/admin/*` API(admin 전용 JWT)를 그대로 쓴다.
