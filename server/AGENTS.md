## Module Context

Bun으로 실행되는 API 서버. 프론트엔드로부터 프롬프트를 받아 Anthropic/Google API를 호출하고, 응답을 `react-live`가 실행 가능한 코드로 정규화해 반환한다.

## Tech Stack & Constraints

- 런타임: Bun (`Bun.serve`, `server/index.ts:138`), Node.js 서버 프레임워크(Express 등) 사용하지 않는다.
- 외부 API 호출은 `fetch`만 사용한다 (`callAnthropic`, `callGoogleModel`). axios 등 HTTP 클라이언트 라이브러리는 의존성에 없다.
- 포트 3002 고정. Vite 프록시(`vite.config.ts:8-14`)가 이 포트를 하드코딩하고 있으므로 포트를 바꾸면 `vite.config.ts`도 함께 수정해야 한다.

## Implementation Patterns

- 프로바이더 추가/수정: `Provider` 타입(`index.ts:57`)에 추가 → `ENV_KEYS`에 env 변수 매핑 → `call<Provider>` 함수 구현 → `/api/generate` 핸들러의 분기(`index.ts:183-186`)에 연결.
- AI 응답 후처리 로직(코드펜스 제거, render 주입 등)은 `generator.ts`에 순수 함수로 추가한다. `index.ts`에 직접 문자열 처리 로직을 넣지 않는다.
- 여러 모델을 순차 시도해야 하는 프로바이더는 `withModelFallback`(`fallback.ts`)을 재사용한다.

## Testing Strategy

- 테스트 명령: `bun test` (repo 루트에서 실행, `vite.config.ts:20`이 `server/**/*.test.ts`를 포함하도록 설정됨).
- `generator.ts`, `fallback.ts`처럼 부수효과 없는 순수 함수만 단위 테스트 대상이다. `index.ts`의 `Bun.serve` 핸들러는 직접 테스트하지 않는다 — 새 로직은 먼저 순수 함수로 추출하고 그 함수를 테스트한다.

## Local Golden Rules

- `SYSTEM_PROMPT`(`index.ts:7-49`)는 "import 금지, TypeScript 문법 금지, render() 호출 필수"를 강제하는 하드 제약이다. 이 프롬프트를 수정해 새 규칙을 추가하면, `generator.ts`의 정규화 함수도 그 규칙 위반을 보정하도록 함께 업데이트한다.
- `resolveApiKey`(`index.ts:64-66`)는 `clientKey || ENV_KEYS[provider] || null` 순서로 클라이언트 입력을 서버 env보다 우선한다. 이 순서를 바꾸면 사용자가 UI에서 입력한 키로 서버 env 키를 덮어쓰는 기존 동작(README.md의 "직접 입력으로 덮어쓰기" 기능)이 깨진다.
- `/api/config`(`index.ts:147-157`)는 키 존재 여부(boolean)만 반환한다. 이 핸들러나 유사 엔드포인트에 `ENV_KEYS` 값 자체를 담아 응답하지 않는다.
