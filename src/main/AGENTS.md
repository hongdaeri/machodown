<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# main

## Purpose
Electron 메인 프로세스. Node.js 환경에서 실행되며 파일 시스템 접근, 시스템 다이얼로그, 앱 메뉴, 자동 업데이트, IPC 핸들러 등 OS 레벨 기능을 모두 담당한다.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` / `index.js` | 메인 프로세스 진입점 — BrowserWindow 생성, 앱 라이프사이클 관리 |
| `menu.ts` / `menu.js` | 앱 네이티브 메뉴 정의 (macOS 메뉴바, 윈도우 타이틀바) |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `ipc/` | IPC 핸들러 채널 모음 — renderer 요청 처리 (see `ipc/AGENTS.md`) |
| `migrations/` | 설정/데이터 마이그레이션 로직 (see `migrations/AGENTS.md`) |
| `services/` | 백그라운드 서비스 (파일 감시, 자동저장, 설정 등) (see `services/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- **`.ts`와 `.js` 파일 쌍이 존재함** — 반드시 두 파일을 동시에 수정 (electron-vite는 `.js` 우선)
- Node.js API 사용 가능 (`fs`, `path`, `os` 등) — renderer에서는 직접 사용 불가
- 새 IPC 채널 추가 시: (1) `ipc/` 에 핸들러 추가 → (2) `ipc/index.ts`에 등록 → (3) `preload/index.ts`에 expose → (4) `preload/index.d.ts`에 타입 추가

### Testing Requirements
- 메인 프로세스 로직은 직접 단위 테스트하기 어려움 — E2E 테스트(`e2e/`)로 검증

### Common Patterns
- IPC 핸들러: `ipcMain.handle('channel-name', async (event, ...args) => { ... })`
- 서비스는 `services/` 에 클래스로 분리되어 `index.ts`에서 인스턴스화됨

## Dependencies

### Internal
- `src/preload/` — IPC 채널명이 preload의 expose 이름과 일치해야 함

### External
- `electron` — BrowserWindow, ipcMain, app, dialog, shell
- `electron-updater` — 자동 업데이트

<!-- MANUAL: -->
