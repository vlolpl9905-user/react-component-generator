## Operational Commands

- Package manager: `bun` 고정. `bun.lock`이 유일한 락파일이며 npm/yarn/pnpm 명령을 섞어 쓰지 않는다.
- `bun install` — 의존성 설치
- `bun run dev` — API 서버(port 3002) + Vite(port 5173) 동시 실행 (concurrently)
- `bun run server` — API 서버만 실행 (`bun --watch run server/index.ts`)
- `bun run build` — `tsc -b && vite build`
- `bun run lint` — `eslint .`
- `bun test` — `vitest run` (server/*.test.ts, src/**/*.test.tsx 모두 포함)
- `bun run test:watch` — vitest watch 모드

## Golden Rules

### Immutable

- 서버는 `ANTHROPIC_API_KEY` / `GOOGLE_API_KEY`의 실제 값을 절대 클라이언트로 반환하지 않는다. `GET /api/config`는 `!!ENV_KEYS[provider]` boolean만 노출한다 (`server/index.ts:147-157`). 새 엔드포인트를 추가하더라도 이 경계를 유지한다.
- AI가 생성하는 컴포넌트 코드는 `react-live`의 `noInline` 모드로 실행된다 (`src/components/LivePreview.tsx:14`). 이 코드는 브라우저에서 문자열째로 평가되므로 `import` 구문이나 TypeScript 타입 구문이 섞이면 즉시 렌더링이 깨진다 (`server/index.ts:9-20` SYSTEM_PROMPT 참고).

### Do's & Don'ts

- SYSTEM_PROMPT(`server/index.ts:7-49`)를 수정할 때는 `server/generator.ts`의 `stripCodeFences`/`ensureRenderCall`도 함께 검토한다. 이 둘은 AI가 프롬프트 규칙(코드펜스 금지, render 호출 필수)을 어겼을 때를 대비한 이중 방어 장치이며, 한쪽만 고치면 프롬프트와 후처리가 어긋난다.
- 새 AI 프로바이더를 추가할 때 Google 프로바이더의 비대칭 구조를 참고한다: `GOOGLE_MODELS` 배열 + `withModelFallback`(`server/index.ts:5`, `server/fallback.ts`)으로 순차 폴백하는 반면, Anthropic은 단일 모델을 직접 호출한다(`callAnthropic`, `server/index.ts:68-96`). 두 프로바이더의 처리 방식이 다른 것은 의도된 설계이지, 통일해야 할 누락이 아니다.
- `server/generator.ts`, `server/fallback.ts`처럼 부수효과 없는 순수 함수는 반드시 대응하는 `*.test.ts`를 유지한다. `server/index.ts`(Bun.serve)처럼 런타임 서버 자체는 테스트 대상이 아니다 — 로직을 서버 파일에 직접 추가하지 말고 순수 함수로 분리해 테스트 가능하게 유지한다.

## Project Context

React 19 + TypeScript 프론트엔드에서 프롬프트를 입력하면 Bun 서버가 Anthropic Claude 또는 Google Gemini API를 호출해 React 컴포넌트를 생성하고, `react-live`로 즉시 미리보기를 렌더링한다.

Tech Stack: React 19, TypeScript, Vite, Bun (API 서버), react-live, Vitest, Testing Library, ESLint.

## Standards & References

- 프로젝트 소개, 실행 방법, 주요 기능은 `README.md` 참고.
- Vite 개발 서버는 `/api/*` 요청을 `http://localhost:3002`(Bun 서버)로 프록시한다 (`vite.config.ts:8-14`).
- Maintenance Policy: 코드 변경으로 위 Golden Rules 중 하나가 더 이상 사실이 아니게 되면, 이 파일의 해당 항목을 갱신하도록 제안한다.

## Context Map

- **[서버/API 로직 수정 (Bun)](./server/AGENTS.md)** — AI 프로바이더 연동, 프롬프트, API 라우팅 작업 시.
- **[프론트엔드 컴포넌트/훅 수정 (React)](./src/AGENTS.md)** — UI, react-live 렌더링, 상태 관리 작업 시.
