# Development Guidelines — Markflow

## 1. Project Overview

- **제품**: Electron 28 데스크톱 마크다운 에디터/뷰어 (macOS · Windows · Linux)
- **스택**: Electron 28 + React 18 + TypeScript strict + Zustand 4 + Monaco Editor + markdown-it + electron-vite
- **현재 상태**: `design/` 폴더에 HTML 프로토타입 존재. `src/` 미구현. PRD.md + ROADMAP.md 기준으로 구현.
- **진실의 원천 우선순위**: `PRD.md` > `design/` 프로토타입. 충돌 시 PRD 우선.

---

## 2. Directory Structure

```
src/
  main/
    index.ts              # BrowserWindow, app lifecycle
    ipc/                  # IPC 핸들러 파일들 (fs.ts, dialog.ts, backup.ts 등)
    services/             # FileService, BackupService, WatcherService
    migrations/           # 설정 마이그레이션 함수
    menu.ts               # 네이티브 메뉴 정의
  preload/
    index.ts              # contextBridge (window.api 노출)
  renderer/
    src/
      components/
        layout/           # TitleBar, MenuBar, Sidebar, StatusBar
        editor/           # EditorPane, TabBar
        preview/          # PreviewPane, TocPane
        ui/               # Modal, Toast, Palette, EmptyState
      stores/             # editorStore.ts, workspaceStore.ts, settingsStore.ts, uiStore.ts
      hooks/              # useShortcuts.ts, useResize.ts, useTheme.ts
      shortcuts/          # registry.ts
      lib/                # markdown.worker.ts, encoding.ts, paths.ts
      styles/             # design/styles.css 이식본
design/                   # HTML 프로토타입 (참조용 — 직접 수정 금지)
```

---

## 3. Process Boundary Rules (CRITICAL)

### Main 프로세스 전용
- `fs`, `path`, `chokidar`, `electron-log`, `electron-updater`, OS 다이얼로그
- 모든 파일 I/O, 백업, 설정 파일 읽기/쓰기

### Renderer 프로세스 전용
- React 컴포넌트, Monaco Editor, Zustand store, DOMPurify
- 마크다운 파싱 (Web Worker: `markdown.worker.ts`)

### 금지
- **Renderer에서 `fs`, `path`, `electron` 모듈 직접 import 절대 금지**
- **Main에서 React, Zustand import 금지**
- 모든 Main ↔ Renderer 통신은 `window.api.invoke()` / `window.api.on()` 로만

---

## 4. IPC Channel Conventions

### 채널 명명 패턴: `domain:action`

| 도메인 | 예시 채널 |
|---|---|
| `fs` | `fs:readFile`, `fs:writeFile`, `fs:createFile`, `fs:rename`, `fs:trash`, `fs:readDirectory`, `fs:stat` |
| `dialog` | `dialog:openFile`, `dialog:openDirectory`, `dialog:saveFile` |
| `watch` | `watch:add`, `watch:remove` |
| `settings` | `settings:get`, `settings:set` |
| `backup` | `backup:list`, `backup:recover`, `backup:delete`, `backup:clearAll`, `backup:createManual` |
| `app` | `app:launchType`, `app:getVersion`, `app:reportError` |
| `shell` | `shell:openExternal` |

### IPC 핸들러 패턴 (Main)

```typescript
ipcMain.handle('fs:writeFile', async (_, args) => {
  try {
    await fs.writeFile(args.path, args.content, args.encoding);
    return { ok: true, mtime: Date.now() };
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    log.error('fs:writeFile failed', { path: args.path, code });
    return { ok: false, code, message: (err as Error).message };
  }
});
```

### IPC 채널 추가 시 동시 수정 필수 파일
1. `src/main/ipc/<domain>.ts` — 핸들러 구현
2. `src/preload/index.ts` — contextBridge에 채널 허용 목록 추가
3. `PRD.md §5` — 채널 명세 업데이트

---

## 5. Zustand Store Rules

### Store 목록 및 위치

| Store | 파일 | 영속화 방식 |
|---|---|---|
| `useEditorStore` | `src/renderer/src/stores/editorStore.ts` | `session.json` (종료 시 스냅샷) |
| `useWorkspaceStore` | `src/renderer/src/stores/workspaceStore.ts` | `workspaces.json`, `recent-files.json` |
| `useSettingsStore` | `src/renderer/src/stores/settingsStore.ts` | `config.json` (IPC persist 미들웨어) |
| `useUiStore` | `src/renderer/src/stores/uiStore.ts` | `editorWidth`, `sidebarWidth` 일부만 |

### Store 액션 추가 시 규칙
- Store 인터페이스 타입 → 액션 구현 → 컴포넌트 연결 순서로 작성
- Store 직접 mutation 금지 — 항상 `set()` 또는 `produce()` 사용
- `editorStore.openTab()` 호출 전 중복 경로 체크 필수 (중복 시 활성화만)

### 핵심 액션 시그니처 (변경 금지)
```typescript
openTab(file: { path: string; content: string; encoding: Encoding; eol: EOL; mtime: number }): void
closeTab(id: string, opts?: { force?: boolean }): Promise<boolean>
updateContent(id: string, content: string): void        // isDirty=true + debounce(500ms)
saveTab(id: string, opts?: { force?: boolean }): Promise<void>
```

---

## 6. CSS & Design Token Rules (CRITICAL)

### 반드시 따를 규칙
- `design/styles.css` 의 CSS 변수(`--bg-base`, `--fg-primary`, `--accent` 등)와 클래스를 **그대로** `src/renderer/src/styles/` 로 이식
- **임의 색상값(hex, rgb) 직접 사용 절대 금지** — 반드시 CSS 변수 참조
- 새 컴포넌트 작성 시 기존 클래스 재사용 우선, 신규 클래스 최소화

### 테마 적용 방식
- `theme-light` / `theme-dark` 클래스를 `.window` 루트에 토글
- Monaco 커스텀 테마: `markflow-light` / `markflow-dark` — `--syn-*` CSS 변수 기반
- 시스템 테마: `nativeTheme.shouldUseDarkColors` → `theme:nativeChanged` IPC

### 리사이즈 핸들
- 5px 히트 영역, hover 시 `var(--accent)` 색상
- `useResize` 훅 (`src/renderer/src/hooks/useResize.ts`) 사용 — 직접 구현 금지

---

## 7. Shortcut System Rules

### 단축키 추가 시 동시 수정 필수 파일
1. `src/renderer/src/shortcuts/registry.ts` — `SHORTCUTS` 배열에 `ShortcutDefinition` 추가
2. `src/main/menu.ts` — 네이티브 메뉴 accelerator 동기화

### 절대 금지
- `window.addEventListener('keydown', ...)` 직접 사용 — 반드시 `useShortcuts` 훅 통해 레지스트리 등록
- 단축키 scope 무시 (`global` > `editor` > Monaco 기본 순위 준수)

### ShortcutDefinition 필수 필드
```typescript
{ id, category, label, keys: { mac, win, linux }, scope, preventDefault, action }
```

---

## 8. Data Persistence Rules

### 영속화 파일 위치 (OS별 `app.getPath('userData')` 기준)

| 파일 | 내용 | $schema 필드 |
|---|---|---|
| `config.json` | `AppSettings` | 필수 |
| `workspaces.json` | `Folder[]` | 필수 |
| `recent-files.json` | `RecentFile[]` (최대 30개 LIFO) | 필수 |
| `session.json` | 마지막 탭/창 상태 | 필수 |
| `.backup/metadata.json` | 백업 인덱스 | 필수 |

### VersionedConfig 패턴 (모든 영속화 파일 적용)
```typescript
interface VersionedConfig<T> {
  $schema: number;       // 마이그레이션 버전
  $appVersion: string;
  $updatedAt: number;
  data: T;
}
```

### 마이그레이션 추가 시
- `src/main/migrations/` 에 Migration 함수 추가
- `SETTINGS_MIGRATIONS` 배열에 `{ fromVersion, toVersion, migrate }` 등록
- 마이그레이션 대상: `config.json`, `workspaces.json`, `recent-files.json`, `session.json`, `.backup/metadata.json` 모두 처리

---

## 9. Security Rules (CRITICAL)

### BrowserWindow 필수 설정 (변경 금지)
```typescript
webPreferences: {
  contextIsolation: true,    // 절대 false로 변경 금지
  nodeIntegration: false,    // 절대 true로 변경 금지
  sandbox: true,
  preload: path.join(__dirname, 'preload.js'),
}
```

### 마크다운 렌더링 필수 처리
- `markdown-it` HTML 출력 → **반드시 DOMPurify.sanitize() 통과 후** DOM 주입
- `innerHTML` 직접 할당 시 DOMPurify 생략 절대 금지

### 파일 시스템 보안
- 워크스페이스 외부 경로 쓰기 → 명시적 사용자 액션(다이얼로그)으로만 허용
- Symlink 추적 금지 (`resolveSymlinks: false`)
- 설정 파일 권한 `0600` (macOS/Linux)

---

## 10. Component Mapping (Design → Implementation)

| design/ 프로토타입 | 구현 컴포넌트 경로 | 특이 사항 |
|---|---|---|
| `TitleBar` | `components/layout/TitleBar.tsx` | macOS: `titleBarStyle:'hiddenInset'` |
| `MenuBar` + `MenuDropdown` | `components/layout/MenuBar.tsx` | 항목/단축키는 `menu.ts` 와 동기화 |
| `Sidebar` + `TreeNode` | `components/layout/Sidebar.tsx` | >1000 노드 → `react-arborist` 가상화 |
| `Editor` (모킹) | `components/editor/EditorPane.tsx` | Monaco 내부, 탭바·브레드크럼 포함 |
| `Preview` | `components/preview/PreviewPane.tsx` | Worker + DOMPurify |
| `TocPane` | `components/preview/TocPane.tsx` | IntersectionObserver |
| `StatusBar` | `components/layout/StatusBar.tsx` | 클릭 → 모달 연결 |
| `NewFileModal` | `components/ui/NewFileModal.tsx` | RenameModal·ConfirmDeleteModal 동일 패턴 |
| `Palette` | `components/ui/CommandPalette.tsx` | 명령 + 파일 통합 검색 |
| `ToastStack` | `components/ui/ToastStack.tsx` | uiStore 연결 |

### UI 인터랙션 필수 보존
- 토스트: `slideIn 0.25s`, 3초 auto-dismiss
- 모달: scrim 클릭/ESC 닫기, `pop 0.2s ease-out`, 첫 입력 필드 자동 포커스
- 메뉴 드롭다운: hover 자동 전환, ESC/외부 클릭 닫힘

---

## 11. Markdown Worker Rules

- 마크다운 파싱은 반드시 `src/renderer/src/lib/markdown.worker.ts` Web Worker에서 실행
- Main Thread에서 직접 `markdown-it` 렌더링 금지
- 렌더 디바운스: **80ms** (변경 금지)
- Worker 플러그인: `markdown-it` + `markdown-it-anchor` + `markdown-it-task-lists` + `highlight.js`

---

## 12. Auto-Save Rules

- `onDidChangeModelContent` → `updateContent()` → `debounce(settings.editor.autoSave.debounceMs)` → `fs:writeFile`
- `⌘S` / `Ctrl+S` → `saveTab(id, { force: true })` → debounce 우회 즉시 저장
- 저장 방식: **atomic write** (임시 파일 → rename) 필수
- 자동 저장 debounce 기본값: **500ms** (범위: 100~2000ms, 설정에서 변경 가능)

---

## 13. Error Handling Rules

### IPC 에러 코드 → 사용자 메시지 매핑 (변경 금지)
| 코드 | 메시지 | 처리 |
|---|---|---|
| `EACCES` | "권한이 없습니다. 다른 위치에 저장하시겠어요?" | 토스트 + 액션 버튼 |
| `ENOENT` | "파일을 찾을 수 없습니다." | 토스트 |
| `ENOSPC` | "디스크 공간이 부족합니다." | 토스트 |
| `EBUSY` | "다른 프로그램이 파일을 사용 중입니다." | 토스트 + 재시도 |
| `EEXIST` | "이미 존재합니다." | 모달 inline 에러 |

### 글로벌 에러 핸들러 필수 등록
- Main: `process.on('uncaughtException')`, `process.on('unhandledRejection')`
- Renderer: `window.addEventListener('error')`, `window.addEventListener('unhandledrejection')` → `app:reportError` IPC

---

## 14. Performance Rules

| 항목 | 목표값 | 구현 방법 |
|---|---|---|
| 100KB 파일 열기 | < 100ms | — |
| 1MB 파일 열기 | < 500ms | — |
| 10MB 파일 열기 | < 2초 | `largeFileOptimizations: true`, 미니맵 자동 비활성 |
| 입력 → 프리뷰 갱신 | < 200ms | 80ms debounce + Worker |
| 기본 RAM | < 200MB | — |
| idle CPU | < 5% | — |

- 비활성 탭 (2시간+): content 메모리 해제, 재활성 시 reload
- 이미지: `loading="lazy"` 필수

---

## 15. Prohibited Actions

- **Renderer에서 `require('fs')`, `require('electron')` 사용**
- **`contextIsolation: false` 또는 `nodeIntegration: true` 설정**
- **DOMPurify 없이 `innerHTML` 에 마크다운 HTML 직접 주입**
- **`design/styles.css` 의 CSS 변수 외 임의 색상 추가**
- **`SHORTCUTS` 레지스트리 우회한 keydown 리스너 직접 등록**
- **`any` 타입 사용 (TypeScript strict 모드)**
- **영속화 파일에서 `$schema` 버전 필드 누락**
- **`design/` 프로토타입 파일 직접 수정**
- **마이그레이션 없는 영속화 파일 구조 변경**
- **`console.log` 프로덕션 코드 사용 (electron-log 사용)**
