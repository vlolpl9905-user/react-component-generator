## Module Context

React 19 프론트엔드. 사용자 프롬프트를 서버(`/api/generate`)로 보내고, 받은 코드를 `react-live`로 즉시 렌더링하는 워크벤치 UI.

## Tech Stack & Constraints

- 데이터 페칭은 `fetch`만 사용한다 (`hooks/useComponentGenerator.ts:23`). axios, react-query 등은 의존성에 없다.
- 컴포넌트 미리보기는 `react-live`의 `LiveProvider`/`LivePreview`를 `noInline` 모드로 사용한다 (`components/LivePreview.tsx:14`). 서버가 반환하는 `code`는 컴파일된 JSX가 아니라 브라우저에서 그대로 평가되는 문자열이다.
- 상태 관리는 로컬 훅(`useState`/`useCallback`)만 사용한다. Redux/Zustand 등 전역 상태 라이브러리는 없다 (`hooks/useComponentGenerator.ts`).

## Implementation Patterns

- 생성된 컴포넌트 목록/로딩/에러 상태는 `useComponentGenerator` 훅(`hooks/useComponentGenerator.ts`)에 캡슐화되어 있다. `App.tsx`에 직접 fetch 로직을 추가하지 않는다.
- 새 프로바이더 UI 옵션을 추가할 때는 `App.tsx:8-11`의 `PROVIDER_CONFIG`와 `types/index.ts:1`의 `Provider` 타입을 함께 갱신한다.
- `ComponentCard.tsx`는 `preview`/`code` 탭 전환과 `previewKey`를 이용한 강제 리마운트(새로고침) 패턴을 사용한다 (`ComponentCard.tsx:17,41`). 미리보기를 다시 그려야 하는 새 기능은 이 `key` 증가 패턴을 재사용한다.

## Testing Strategy

- 테스트 명령: `bun test` 또는 `bun run test:watch` (jsdom 환경, `vite.config.ts:16-21`).
- 테스트 유틸: Testing Library + `src/test/setup.ts`.
- 현재 `components/PromptInput.tsx`만 테스트(`PromptInput.test.tsx`)가 있다. `LivePreview`, `ComponentCard`, `CodeView`, `App`은 테스트가 없다 — 사용자 입력 검증(폼 제출, 버튼 disabled 조건) 같은 로직을 다루는 컴포넌트는 `PromptInput` 패턴을 따라 테스트를 추가하고, 순수 렌더링 위주 컴포넌트는 기존 관례상 테스트를 생략해도 무방하다.

## Local Golden Rules

- `LivePreview`에 전달되는 `code`(`components/LivePreview.tsx:7`)는 항상 서버가 정규화한 문자열이어야 한다. 프론트엔드에서 이 문자열을 가공(치환, 삽입 등)하지 않는다 — 가공 로직이 필요하면 `server/generator.ts`에 추가한다.
- `useComponentGenerator.generate`(`hooks/useComponentGenerator.ts:18-49`)는 `apiKey`가 없을 때 `apiKey` 필드 자체를 요청 바디에서 생략한다(`...(apiKey && { apiKey })`, 줄 26). 서버가 `undefined`와 "키 없음"을 구분하지 않도록 하는 의도적 처리이므로, 빈 문자열을 그대로 보내는 방식으로 바꾸지 않는다.
