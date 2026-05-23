<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# services

## Purpose
메인 프로세스의 백그라운드 서비스 클래스들. 복잡한 비즈니스 로직을 IPC 핸들러에서 분리해 캡슐화한다.

## Key Files

| File | Description |
|------|-------------|
| `BackupService.ts` / `BackupService.js` | 자동저장 및 비정상 종료 복구용 백업 관리 |
| `RecentFilesService.ts` / `RecentFilesService.js` | 최근 파일 목록 persistence |
| `SettingsService.ts` / `SettingsService.js` | 사용자 설정 JSON 파일 읽기/쓰기 및 기본값 관리 |
| `WatcherService.ts` / `WatcherService.js` | 파일 시스템 감시 (chokidar 기반) — 외부 변경 감지 |
| `WorkspaceService.ts` / `WorkspaceService.js` | 워크스페이스(폴더) 목록 및 트리 탐색 관리 |

## For AI Agents

### Working In This Directory
- **`.ts`와 `.js` 쌍이 존재** — 반드시 동시에 수정
- 서비스는 `src/main/index.ts`에서 싱글톤으로 인스턴스화되어 IPC 핸들러에 주입됨
- `SettingsService`는 설정 스키마 변경 시 `migrations/`에 마이그레이션 스텝 추가 필요

### Common Patterns
- 각 서비스는 클래스로 정의되며 public 메서드를 IPC 핸들러가 호출
- 파일 경로는 `app.getPath('userData')`를 기준으로 결정됨

## Dependencies

### External
- `chokidar` — 파일 시스템 감시 (`WatcherService`)
- `electron` — `app.getPath()` for 설정 파일 경로

<!-- MANUAL: -->
