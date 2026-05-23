<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# machodown

## Purpose
Electron 28 + React 18 + TypeScript 5 기반의 macOS/Linux 마크다운 데스크톱 에디터. Monaco Editor(VS Code 엔진)를 사용하며 실시간 프리뷰, 멀티탭, 자동저장, KaTeX 수식, TOC 패널, 워크스페이스, 자동 업데이트 기능을 제공한다. electron-vite 2로 빌드되며 Vitest로 단위 테스트를 실행한다.

## Key Files

| File | Description |
|------|-------------|
| `package.json` | 의존성, npm scripts, electron-builder 패키징 설정 |
| `electron.vite.config.ts` | main/preload/renderer 각 vite 설정 |
| `tsconfig.json` | 루트 TypeScript 설정 (references 기반) |
| `tsconfig.node.json` | main/preload 전용 TS 설정 |
| `tsconfig.web.json` | renderer 전용 TS 설정 |
| `vitest.config.ts` | 단위 테스트 설정 |
| `.eslintrc.cjs` | ESLint 규칙 |
| `.prettierrc` | Prettier 코드 포맷 설정 |
| `README.md` | 영문 README (프로젝트 공개 문서) |
| `README.ko.md` | 한국어 README |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | 앱 소스코드 전체 — main/preload/renderer 3-process 구조 (see `src/AGENTS.md`) |
| `.github/` | CI/CD 워크플로우, 이슈/PR 템플릿 (see `.github/AGENTS.md`) |
| `docs/` | PRD, 로드맵, 릴리즈 문서 (see `docs/AGENTS.md`) |
| `e2e/` | Playwright E2E 테스트 스펙 (see `e2e/AGENTS.md`) |
| `scripts/` | 개발 유틸리티 스크립트 (see `scripts/AGENTS.md`) |
| `brand/` | 앱 아이콘 에셋 (see `brand/AGENTS.md`) |
| `design/` | UI 프로토타입 참고용 파일 (see `design/AGENTS.md`) |
| `resources/` | Electron 패키징용 리소스 (현재 비어 있음) |

## For AI Agents

### Working In This Directory
- 빌드: `npm run build` (main + renderer 모두 컴파일)
- 개발: `npm run dev` (HMR 포함 Electron 실행)
- 타입체크: `npm run typecheck`
- 린트: `npm run lint`
- 테스트: `npm test`
- 패키징: `npm run package`
- **중요**: `src/main/`과 `src/preload/` 아래에는 `.ts`와 `.js` 파일이 동시에 존재한다. electron-vite는 `.js`를 우선 컴파일 소스로 사용하므로 반드시 두 파일을 함께 수정해야 한다.
- master 브랜치는 PR 필수 + "test" CI 통과 후에만 merge 가능하다.

### Testing Requirements
- 단위 테스트: `npm test` (Vitest, `src/renderer/src/__tests__/` 아래)
- E2E 테스트: `e2e/` 폴더 내 Playwright 스펙 (`npm run test:e2e`)
- CI는 `.github/workflows/ci.yml` 에서 test 잡을 실행함

### Common Patterns
- Electron IPC: main↔renderer 통신은 `src/main/ipc/` 채널로만 수행
- 상태 관리: renderer에서 Zustand 스토어 사용 (`src/renderer/src/stores/`)
- 설정: `SettingsService`가 JSON 파일로 유저 설정 persist
- 스타일: Tailwind CSS (globals.css 기반)

## Dependencies

### External
- `electron` 28.x — 데스크톱 앱 런타임
- `electron-vite` 2.x — 빌드 도구
- `react` 18.x, `react-dom` — UI 프레임워크
- `typescript` 5.x — 타입 시스템 (strict mode)
- `@monaco-editor/react` — 에디터 엔진
- `markdown-it` — 마크다운 파싱
- `katex` — LaTeX 수식 렌더링
- `zustand` — 상태 관리
- `vitest` — 단위 테스트
- `electron-updater` — 자동 업데이트

<!-- MANUAL: -->
