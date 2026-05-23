<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# renderer

## Purpose
React 18 + TypeScript 기반의 renderer 프로세스. 에디터 UI 전체(Monaco Editor, 프리뷰, 탭, 사이드바, 모달 등)를 담당한다. Vite HMR로 개발되며 Vitest로 단위 테스트된다.

## Key Files

| File | Description |
|------|-------------|
| `index.html` | Vite 진입점 HTML (renderer 루트) |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | React 앱 소스 전체 (see `src/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Node.js API(`fs`, `path`) 사용 불가 — 파일 작업은 `window.api.*` 호출로 메인에 위임
- `index.html`은 Vite가 처리하므로 스크립트/스타일 직접 추가 대신 `src/main.tsx` 또는 vite 설정 수정

<!-- MANUAL: -->
