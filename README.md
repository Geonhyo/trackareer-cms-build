# trackareer-cms

트래커리어 운영 도구. 구 `trackareer-admin`(Vite · Refine · AntD)을 대체한다.

| 메뉴               | 내용                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| 대시보드           | 현황(북극성 · 문의 · 가입 · 활성 · DAU/MAU) · 성장(주별 가입 · WAU · 북극성 · 퍼널 · 코호트 · 탈퇴) · 공고 순위 |
| 회원 · 문의        | 회원 목록 · 상세(접속 · 공고 진행 상태 · 동의), 대화형 문의 답변                                                |
| 공지 · 푸시        | 공지 작성 · 내리기, 공지 · 광고 푸시와 한 명 테스트                                                             |
| 앱 버전            | 강제 · 권장 업데이트, 점검, 스토어 주소, 약관 버전, 빌드 분포                                                   |
| 테스트 · 심사 계정 | 만들기 · 기존 회원 전환 · 비밀번호 · 목업 공고 다시 채우기                                                      |
| 상태 · 공고 추출   | 서버 · DB · 외부 감시 · 배치 · 인프라 비용(GCP), 추출 지표 · 사이트 · 차단 도메인 · 다시 받기, 이상 징후       |

결정 기록: 모노레포 `V2__PLAN.md` 26 · 27장. 서버 API: `trackareer-server/docs/api-spec.md` 9장.

## 스택

`trackareer-web`과 같다 — Next.js 16 (App Router) · React 19 · TypeScript · CSS Modules · ESLint · Prettier · pnpm. 디자인 토큰(`src/app/globals.css`) · Pretendard. 표는 TanStack Table, 차트는 Recharts.

## 구조

```
src/
├── proxy.ts               # 로그인 확인 · 접근 토큰 갱신 · 비밀번호 변경 강제
├── app/
│   ├── login · password-change
│   └── (cms)/             # 사이드바 레이아웃 아래 화면들
├── features/<화면>/       # 화면별 컴포넌트 · 서버 액션
├── components/ui · layout # 공통 부품
└── shared/
    ├── api/               # admin-api.ts(서버 전용 호출), openapi.d.ts(생성), errors.ts
    ├── auth/              # 쿠키 · 갱신 · 서버 액션
    └── lib/               # 날짜 · 라벨 · 주소
```

## 인증

- 이메일 + 비밀번호(서버 `/admin/auth`). 토큰은 **httpOnly 쿠키**(`cms_at` 30분 · `cms_rt` 7일 · `cms_admin`)라 브라우저 JS가 읽지 못한다.
- 브라우저는 서버 API를 직접 부르지 않는다. 서버 컴포넌트 · 서버 액션이 `ADMIN_API_URL`로 부른다 → CORS 필요 없음.
- `proxy.ts`가 요청마다 접근 토큰이 2분 안에 끝나면 갱신한다. 서버가 갱신 토큰을 회전시키므로 같은 토큰의 동시 갱신은 한 번만 하고 결과를 나눠 쓴다(인스턴스 메모리).
- 권한(최고관리자 전용 화면 · 버튼)은 서버 API가 막고, 화면은 안내만 한다.

## 실행

```bash
pnpm install
cp .env.example .env.local   # ADMIN_API_URL — 로컬 서버는 보통 http://localhost:8000
pnpm dev                     # http://localhost:3002
pnpm lint && pnpm typecheck
pnpm gen:api                 # 서버 openapi.json → src/shared/api/openapi.d.ts (서버를 띄운 채로)
```

## 배포 (Cloud Run)

```bash
docker build -t trackareer-cms .
# Cloud Run 환경변수: ADMIN_API_URL=https://app-api.trackareer.com (서버 전용)
```

- Next `output: 'standalone'` 이미지, `PORT`(Cloud Run 8080)로 뜬다.
- **최대 인스턴스 1을 권장**: 토큰 갱신 공유와 서버 액션 암호화 키가 인스턴스 메모리 · 빌드마다라서. 여럿으로 늘리면 빌드 ARG `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`(base64 32바이트)를 고정한다.
- 쿠키는 운영(`NODE_ENV=production`)에서 `Secure`라 https 주소로만 로그인된다.
- 구 trackareer-admin Cloud Run 서비스는 이 서비스를 올린 뒤 내린다.
