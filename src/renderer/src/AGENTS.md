<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# src (renderer)

## Purpose
React 앱의 실질적인 소스 루트. 컴포넌트, 훅, 스토어, 타입, 스타일, 워커 등 renderer 프로세스의 모든 UI 로직을 포함한다.

## Key Files

| File | Description |
|------|-------------|
| `main.tsx` | React 앱 진입점 — ReactDOM.createRoot, 전역 스타일 import |
| `App.tsx` | 루트 컴포넌트 — 레이아웃 조합, 라우팅(없음), 전역 훅 초기화 |
| `env.d.ts` | Vite 환경 타입 선언 + `preload/index.d.ts` 참조 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `components/` | UI 컴포넌트 (editor, layout, modals, ui) (see `components/AGENTS.md`) |
| `hooks/` | 커스텀 React 훅 (see `hooks/AGENTS.md`) |
| `stores/` | Zustand 전역 상태 스토어 (see `stores/AGENTS.md`) |
| `lib/` | 순수 유틸리티 함수 및 헬퍼 (see `lib/AGENTS.md`) |
| `shortcuts/` | 키보드 단축키 레지스트리 (see `shortcuts/AGENTS.md`) |
| `styles/` | 전역 CSS (see `styles/AGENTS.md`) |
| `types/` | 공유 TypeScript 타입 선언 (see `types/AGENTS.md`) |
| `workers/` | Web Worker (마크다운 파싱 오프로드) (see `workers/AGENTS.md`) |
| `__tests__/` | Vitest 단위 테스트 (see `__tests__/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `window.api.*`를 통해 메인 프로세스와 통신 — `env.d.ts`에서 타입 확인
- 새 컴포넌트/훅 추가 시 해당 서브디렉토리에 배치하고 배럴 export(`index.ts`) 업데이트
- 스타일은 Tailwind CSS 클래스 우선 사용 — `globals.css`에는 CSS 변수 및 기본 리셋만

### Testing Requirements
- `__tests__/` 에 Vitest 단위 테스트 추가
- `npm test`로 실행

<!-- MANUAL: -->
