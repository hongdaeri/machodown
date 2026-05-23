<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# ipc

## Purpose
Electron IPC 핸들러 채널 모음. renderer의 `window.api.*` 호출을 받아 Node.js/OS API를 실행하고 결과를 반환한다. 각 파일은 도메인별로 채널을 그룹화한다.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` / `index.js` | 모든 IPC 핸들러를 등록하는 진입점 — 각 모듈의 register 함수를 호출 |
| `fs.ts` / `fs.js` | 파일 읽기/쓰기/삭제 채널 |
| `dialog.ts` / `dialog.js` | 파일 열기/저장 다이얼로그 채널 |
| `settings.ts` / `settings.js` | 사용자 설정 읽기/쓰기 채널 |
| `app.ts` / `app.js` | 앱 버전, 경로 정보 등 앱 메타 채널 |
| `shell.ts` / `shell.js` | OS 쉘 명령 실행 채널 (파일 탐색기에서 열기 등) |
| `backup.ts` / `backup.js` | 자동저장 백업 관리 채널 |
| `diagnostics.ts` / `diagnostics.js` | 앱 진단 정보 수집 채널 |
| `recent.ts` / `recent.js` | 최근 파일 목록 관리 채널 |
| `search.ts` / `search.js` | 파일 내 텍스트 검색 채널 |
| `session.ts` / `session.js` | 세션 상태 저장/복원 채널 |
| `theme.ts` / `theme.js` | 시스템 테마 감지 채널 |
| `updater.ts` / `updater.js` | 자동 업데이트 트리거/상태 채널 |
| `watch.ts` / `watch.js` | 파일 시스템 감시 시작/중지 채널 |
| `workspace.ts` / `workspace.js` | 워크스페이스 폴더 관리 채널 |

## For AI Agents

### Working In This Directory
- **모든 파일에 `.ts`와 `.js` 쌍이 존재** — 반드시 동시에 수정
- 새 채널 추가 순서:
  1. 이 디렉토리에 `<domain>.ts` + `<domain>.js` 생성
  2. `index.ts` + `index.js`에 `register<Domain>()` 호출 추가
  3. `src/preload/index.ts` + `index.js`에 채널 expose 추가
  4. `src/preload/index.d.ts`에 타입 추가
- 채널명 컨벤션: `kebab-case` (예: `fs:read-file`, `dialog:open-file`)

### Common Patterns
```typescript
// 핸들러 등록 패턴
export function registerFsHandlers() {
  ipcMain.handle('fs:read-file', async (_event, filePath: string) => {
    return fs.promises.readFile(filePath, 'utf-8')
  })
}
```

## Dependencies

### Internal
- `src/main/services/` — 서비스 인스턴스를 사용해 복잡한 로직 위임
- `src/preload/index.ts` — 채널명이 일치해야 함

<!-- MANUAL: -->
