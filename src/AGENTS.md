<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# src

## Purpose
Electron 3-process 아키텍처(main, preload, renderer)의 모든 소스 코드를 담는 루트 디렉토리. 각 프로세스는 독립된 빌드 타겟이며 electron-vite가 별도로 컴파일한다.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `main/` | Node.js 메인 프로세스 — 파일 I/O, IPC 서버, 시스템 API (see `main/AGENTS.md`) |
| `preload/` | Preload 스크립트 — contextBridge로 renderer에 안전한 API 노출 (see `preload/AGENTS.md`) |
| `renderer/` | React renderer 프로세스 — 모든 UI 컴포넌트, 스토어, 훅 (see `renderer/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- 각 프로세스는 완전히 격리된 빌드 단위이므로 cross-process import 금지
- main↔renderer 통신은 반드시 preload의 contextBridge + IPC 채널을 경유해야 함
- main/과 preload/ 아래의 `.ts`/`.js` 쌍 파일은 반드시 동시에 수정

### Common Patterns
- IPC 채널명은 `main/ipc/` 핸들러와 `preload/index.ts` exposeAPI 이름이 일치해야 함
- 타입 정의 공유: `preload/index.d.ts`가 renderer에서 사용하는 `window.api` 타입을 선언

<!-- MANUAL: -->
