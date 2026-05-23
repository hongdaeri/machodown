# Markflow — Product Requirements Document

> 기준 문서: `PRD_META.md` v2  
> 작성일: 2026-05-22  
> 플랫폼: macOS / Windows / Linux (Electron 데스크톱 앱)

---

## 1. 제품 개요

### 1.1 한 줄 설명

데스크톱에서 동작하는 개인용 마크다운 에디터/뷰어. 좌측 Monaco 에디터 ⇄ 우측 markdown-it 프리뷰 분할, 워크스페이스(폴더) 관리, 자동 저장.

### 1.2 핵심 가치

- 단축키 중심 UI (모든 P0 기능이 단축키 1회로 도달 가능)
- 라이트/다크 테마 완벽 지원
- 한글 인코딩(EUC-KR, UTF-16) 친화적
- 크로스 플랫폼 동작 (macOS · Windows · Linux)

### 1.3 성공 기준

| 기준 | 목표값 |
|---|---|
| 연속 사용 | 30분 무중단 |
| P0 기능 접근 | 단축키 1회 |
| 10 MB 파일 열기 | < 2초 |
| 기본 RAM | < 200 MB |
| idle CPU | < 5% |

---

## 2. 기술 스택

### 2.1 런타임 의존성

```jsonc
{
  "electron": "^28",
  "react": "^18",
  "react-dom": "^18",
  "zustand": "^4",
  "@monaco-editor/react": "^4",
  "monaco-editor": "^0.45",
  "markdown-it": "^14",
  "markdown-it-anchor": "^9",
  "markdown-it-task-lists": "^2",
  "markdown-it-emoji": "^3",
  "highlight.js": "^11",
  "katex": "^0.16",
  "chokidar": "^3",
  "chardet": "^2",
  "uuid": "^9",
  "electron-log": "^5",
  "electron-updater": "^6",
  "dompurify": "^3"
}
```

### 2.2 개발 의존성

```jsonc
{
  "electron-builder": "^24",
  "electron-vite": "^2",
  "vite": "^5",
  "typescript": "^5",
  "vitest": "^1",
  "@playwright/test": "^1",
  "eslint": "^8",
  "prettier": "^3"
}
```

### 2.3 개발 환경

- Node.js 18+
- TypeScript `strict: true`
- ESLint + Prettier (husky + lint-staged 커밋 훅)
- `npm run dev` — electron-vite dev 서버 + Electron
- `npm run build` — Renderer Vite 빌드 + Main esbuild
- `npm run package` — electron-builder 패키지 생성

### 2.4 배포 타겟

| OS | 형식 |
|---|---|
| macOS | `.dmg`, `.zip` |
| Windows | NSIS, Portable |
| Linux | `.AppImage`, `.deb` |

---

## 3. 시스템 아키텍처

### 3.1 프로세스 분리

| 책임 | Main | Renderer |
|---|---|---|
| 파일 시스템 (`fs`) | ✓ | ✗ |
| chokidar 감시 | ✓ | ✗ |
| OS 다이얼로그 | ✓ | ✗ |
| 자동 업데이트 | ✓ | ✗ |
| Monaco / 렌더링 | ✗ | ✓ |
| Zustand 상태 관리 | ✗ | ✓ |
| 마크다운 파싱 (Worker) | ✗ | ✓ (Worker) |

### 3.2 보안 설정

```ts
// src/main/index.ts
new BrowserWindow({
  webPreferences: {
    contextIsolation: true,     // 필수
    nodeIntegration: false,     // 필수
    sandbox: true,
    preload: path.join(__dirname, 'preload.js'),
  },
});
```

### 3.3 Preload (contextBridge)

```ts
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // Renderer → Main
  invoke: (channel: string, ...args: unknown[]) =>
    ipcRenderer.invoke(channel, ...args),

  // Main → Renderer (이벤트 수신)
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const handler = (_event: unknown, ...args: unknown[]) => callback(...args);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  },
});
```

### 3.4 디렉터리 구조

```
src/
  main/
    index.ts          # BrowserWindow, app lifecycle
    ipc/              # IPC 핸들러 (fs, dialog, backup, settings...)
    services/         # FileService, BackupService, WatcherService
    migrations/       # 설정 마이그레이션
    menu.ts           # 네이티브 메뉴 정의
  preload/
    index.ts          # contextBridge
  renderer/
    src/
      components/     # UI 컴포넌트
        layout/       # TitleBar, MenuBar, Sidebar, StatusBar
        editor/       # EditorPane, TabBar
        preview/      # PreviewPane, TocPane
        ui/           # Modal, Toast, Palette, EmptyState
      stores/         # Zustand stores
      hooks/          # useShortcuts, useResize, useTheme
      shortcuts/      # registry.ts
      lib/            # markdown.worker.ts, encoding.ts, paths.ts
      styles/         # design/styles.css 이식
```

---

## 4. 상태 관리 (Zustand)

### 4.1 Store 구성

```ts
// src/renderer/src/stores/editorStore.ts
import { create } from 'zustand';

interface EditorStore {
  openTabs: Tab[];
  activeTabId: string | null;
  splitMode: 'split' | 'editor-only' | 'preview-only';
  showSidebar: boolean;
  showToc: boolean;

  openTab: (file: { path: string; content: string; encoding: Encoding; eol: EOL; mtime: number }) => void;
  closeTab: (id: string, opts?: { force?: boolean }) => Promise<boolean>;
  activateTab: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  saveTab: (id: string, opts?: { force?: boolean }) => Promise<void>;
  saveAllDirty: () => Promise<void>;
  reloadFromDisk: (id: string) => Promise<void>;
}

export const useEditorStore = create<EditorStore>()((set, get) => ({
  // ...구현
}));
```

```ts
// src/renderer/src/stores/settingsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// persist 미들웨어로 IPC를 통해 디스크에 영속화
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      hydrate: async () => { /* IPC settings:get */ },
      update: async (patch) => { /* IPC settings:set */ },
    }),
    {
      name: 'markflow-settings',
      storage: createJSONStorage(() => ({
        // 커스텀 storage: IPC를 통해 config.json 읽기/쓰기
        getItem: async (name) => window.api.invoke('settings:get'),
        setItem: async (name, value) => window.api.invoke('settings:set', value),
        removeItem: async (name) => {},
      })),
    }
  )
);
```

### 4.2 Store 목록

| Store | 파일 | 영속화 |
|---|---|---|
| `useEditorStore` | `editorStore.ts` | 종료 시 스냅샷 (`session.json`) |
| `useWorkspaceStore` | `workspaceStore.ts` | `workspaces.json`, `recent-files.json` |
| `useSettingsStore` | `settingsStore.ts` | `config.json` (IPC) |
| `useUiStore` | `uiStore.ts` | 일부 (`editorWidth`, `sidebarWidth`) |

### 4.3 핵심 액션

```ts
// editorStore
openTab(file)              // 중복 방지: 이미 열린 경로면 활성화만
closeTab(id, {force})      // dirty 시 확인 다이얼로그
activateTab(id)
updateContent(id, content) // isDirty=true + debounce(500ms) 저장
saveTab(id, {force})       // force=true 이면 debounce 무시
saveAllDirty()
reloadFromDisk(id)

// workspaceStore
addFolder(path)            // chokidar watcher 등록
removeFolder(path)
refreshNode(path)
pushRecent(path)           // 최대 30개
search(query, opts)        // AsyncIterable<SearchHit>

// uiStore
pushToast(toast)           // 3초 자동 dismiss
dismissToast(id)
openModal(key, payload)
closeModal()
setEditorWidth(px)
setSidebarWidth(px)
```

---

## 5. IPC 채널 명세

### 5.1 Renderer → Main (ipcRenderer.invoke)

| 채널 | 입력 | 출력 |
|---|---|---|
| `dialog:openFile` | `{ filters?: Filter[] }` | `string[] \| null` |
| `dialog:openDirectory` | – | `string \| null` |
| `dialog:saveFile` | `{ defaultPath?: string }` | `string \| null` |
| `fs:readFile` | `{ path: string }` | `{ content, encoding, eol, mtime }` |
| `fs:writeFile` | `{ path, content, encoding }` | `{ mtime }` |
| `fs:createFile` | `{ path }` | `{ mtime }` |
| `fs:rename` | `{ oldPath, newPath }` | `void` |
| `fs:trash` | `{ path }` | `void` |
| `fs:readDirectory` | `{ path }` | `FileNode[]` |
| `fs:stat` | `{ path }` | `{ mtime, size }` |
| `watch:add` | `{ path }` | `void` |
| `watch:remove` | `{ path }` | `void` |
| `settings:get` | – | `AppSettings` |
| `settings:set` | `Partial<AppSettings>` | `AppSettings` |
| `shell:openExternal` | `{ url }` | `void` |
| `app:launchType` | – | `LaunchType` |
| `app:getVersion` | – | `string` |
| `app:reportError` | `{ message, stack? }` | `void` |
| `diagnostics:collect` | – | `Diagnostics` |
| `logs:openFolder` | – | `void` |
| `crash:list` | – | `CrashReport[]` |
| `crash:clear` | – | `void` |
| `backup:list` | – | `BackupMetadata[]` |
| `backup:recover` | `{ id }` | `{ content, encoding }` |
| `backup:delete` | `{ id }` | `void` |
| `backup:clearAll` | – | `void` |
| `backup:createManual` | `{ path }` | `BackupMetadata` |
| `releaseNotes:get` | `{ version }` | `ReleaseNote \| null` |

### 5.2 Main → Renderer (ipcRenderer.on)

| 채널 | 페이로드 |
|---|---|
| `fs:externalChange` | `{ path, type: 'add'\|'change'\|'unlink', mtime }` |
| `theme:nativeChanged` | `{ shouldUseDark: boolean }` |
| `app:beforeQuit` | `void` |
| `backup:recoveryAvailable` | `{ backups: BackupMetadata[] }` |
| `migration:completed` | `{ from, to, count }` |
| `update:available` | `{ version }` |
| `update:downloaded` | `{ version }` |

---

## 6. 데이터 모델

```ts
// ─── 워크스페이스 ───
export interface Folder {
  path: string;       // 절대 경로
  name: string;       // basename
  expanded: boolean;
  addedAt: number;    // unix ms
}

export interface FileNode {
  path: string;
  name: string;
  type: 'file' | 'folder';
  modifiedAt: number;
  size?: number;
  children?: FileNode[];  // 폴더: lazy-load
}

export interface RecentFile {
  path: string;
  workspace: string;  // 소속 Folder.path, standalone이면 ''
  openedAt: number;
}

// ─── 에디터 ───
export type Encoding = 'utf-8' | 'utf-16le' | 'utf-16be' | 'euc-kr' | 'cp1252';
export type EOL = 'LF' | 'CRLF';

export interface Tab {
  id: string;               // uuid
  filePath: string;
  fileName: string;
  content: string;
  encoding: Encoding;
  eol: EOL;
  isDirty: boolean;
  lastSavedAt: number;
  lastDiskMtime: number;    // chokidar 비교용
  cursorPosition: { line: number; column: number };
  scrollPosition: number;
  viewState?: unknown;      // Monaco ICodeEditorViewState
}

// ─── 설정 ───
export interface AppSettings {
  general: {
    theme: 'light' | 'dark' | 'system';
    checkForUpdates: boolean;
    startupView: 'empty' | 'lastSession';
  };
  editor: {
    fontFamily: string;
    fontSize: number;         // 11~24
    tabSize: 2 | 4;
    wordWrap: boolean;
    minimap: boolean;
    autoSave: { enabled: boolean; debounceMs: number };
  };
  markdown: {
    enableGFM: boolean;
    enableKaTeX: boolean;
    codeHighlightTheme: string;
  };
  ui: {
    sidebarWidth: number;
    editorWidth: number;
  };
}

// ─── UI (transient) ───
export interface Toast {
  id: string;
  kind: 'success' | 'warning' | 'error' | 'info';
  title: string;
  body?: string;
  actions?: { label: string; action: string }[];
  ttlMs?: number;  // 기본 3000
}

export interface ModalState {
  newFile?: { workspacePath: string };
  rename?: { path: string };
  confirmDelete?: { path: string };
  encodingPicker?: { path: string };
  mergeConflict?: { path: string };
  recovery?: { backups: BackupMetadata[] };
  shortcuts?: void;
  releaseNotes?: { version: string };
}

// ─── 온보딩 ───
export type LaunchType = 'first-launch' | 'after-update' | 'normal';

// ─── 백업 ───
export type BackupType = 'auto' | 'pre-save' | 'manual';

export interface BackupMetadata {
  id: string;
  type: BackupType;
  originalPath: string;
  backupPath: string;
  fileHash: string;    // SHA-1 of originalPath
  timestamp: number;
  size: number;
  encoding: Encoding;
  isDirty: boolean;
}

// ─── 마이그레이션 ───
export interface VersionedConfig<T> {
  $schema: number;
  $appVersion: string;
  $updatedAt: number;
  data: T;
}

// ─── 진단 ───
export interface Diagnostics {
  appVersion: string;
  electronVersion: string;
  nodeVersion: string;
  osVersion: string;
  arch: string;
  totalMemory: number;
  freeMemory: number;
  workspaceCount: number;
  openTabCount: number;
  recentCrashes: number;
}
```

---

## 7. 기능 명세

### 7.1 우선순위 기준

| 등급 | 의미 |
|---|---|
| P0 | MVP 필수 — 이 없으면 출시 불가 |
| P1 | 1차 출시 포함 |
| P2 | 2차 출시 |
| P3 | 선택적 향후 기능 |

---

### 7.2 P0 — MVP 필수 기능

#### 7.2.1 파일 열기 (P0 / 6h)

**트리거**: 메뉴 `File › 파일 열기…` · `⌘O` · 사이드바 더블클릭 · `⌘P` 팔레트

**처리 흐름**:
1. Renderer → `fs:readFile { path }`
2. Main: BOM 검사 → chardet → fallback UTF-8 인코딩 감지
3. Main → `{ content, encoding, eol, mtime }` 반환
4. `editorStore.openTab(...)` (중복 경로면 해당 탭 활성화만)

**에러 처리**:
- `ENOENT` → "파일을 찾을 수 없습니다" 토스트
- `EACCES` → 동일 메시지 토스트
- 디코딩 실패 → `encodingPicker` 모달

**완료 기준**:
- [ ] UTF-8 / UTF-16 / EUC-KR 파일 정상 표시
- [ ] 동일 파일 재오픈 시 새 탭 생성 안 됨
- [ ] 1 MB 파일 < 500 ms 표시

---

#### 7.2.2 파일 자동 저장 (P0 / 4h)

**트리거**: Monaco `onDidChangeModelContent`

**처리 흐름**:
```
onChange(content)
  → editorStore.updateContent(tabId, content)   // isDirty=true
  → debounce(settings.editor.autoSave.debounceMs)
  → IPC fs:writeFile { path, content, encoding }
  → writeFileAtomic (임시파일 → rename)
  → 'file-saved' { mtime } → isDirty=false
```

**⌘S**: `force: true` 플래그로 debounce 무시하고 즉시 저장

**에러 처리**:
- `EACCES` → "권한 없음. 다른 위치에 저장?" 토스트 + 액션
- `ENOSPC` → "디스크 공간 부족" 토스트

**완료 기준**:
- [ ] 입력 후 500 ms 뒤 디스크 반영
- [ ] 저장 중/후 `●` 상태 정확히 토글
- [ ] 자동 저장 OFF 시 ⌘S만으로 저장 가능

---

#### 7.2.3 파일 생성 / 이름 변경 / 삭제 (P0 / 5h)

| 동작 | IPC | 결과 |
|---|---|---|
| 생성 | `fs:createFile` | 빈 파일 생성 후 새 탭 열기 |
| 이름 변경 | `fs:rename` | 열린 탭이 있으면 경로/이름 갱신 |
| 삭제 | `fs:trash` | OS 휴지통 이동 (복구 가능) |

**UI**: `NewFileModal` / `RenameModal` / `ConfirmDeleteModal` — 프로토타입 패턴 동일

**에러**:
- `EEXIST` (생성) → 모달 내 inline 에러
- `ENOENT` (이름변경/삭제) → 트리 새로고침 + 토스트

---

#### 7.2.4 마크다운 편집 — Monaco (P0 / 8h)

**Monaco 설정**:
```ts
import * as monaco from 'monaco-editor';

// 커스텀 테마 등록 (styles.css의 --syn-* 변수 기반)
monaco.editor.defineTheme('markflow-light', {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'keyword',  foreground: '6366f1' },
    { token: 'string',   foreground: '16a34a' },
    { token: 'comment',  foreground: '94a3b8', fontStyle: 'italic' },
    { token: 'number',   foreground: 'dc2626' },
  ],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#1e293b',
  },
});

monaco.editor.defineTheme('markflow-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [ /* --syn-* dark 토큰 */ ],
  colors: {
    'editor.background': '#0f172a',
    'editor.foreground': '#e2e8f0',
  },
});

// 에디터 생성
const editor = monaco.editor.create(containerRef.current, {
  language: 'markdown',
  theme: isDark ? 'markflow-dark' : 'markflow-light',
  fontFamily: 'var(--font-mono)',
  fontSize: settings.editor.fontSize,      // 기본 13
  lineNumbers: 'on',
  wordWrap: settings.editor.wordWrap ? 'on' : 'off',
  minimap: { enabled: settings.editor.minimap },
  automaticLayout: true,
  largeFileOptimizations: true,            // 10MB+ 파일 대응
});
```

**Web Worker로 파싱 오프로드**:
```ts
// src/renderer/src/lib/markdown.worker.ts
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import taskLists from 'markdown-it-task-lists';
import hljs from 'highlight.js';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(str, { language: lang }).value;
    }
    return '';
  },
}).use(anchor).use(taskLists);

self.onmessage = ({ data }: MessageEvent<{ content: string }>) => {
  const html = md.render(data.content);
  self.postMessage({ html });
};
```

**완료 기준**:
- [ ] 라이트↔다크 토큰 색 정확히 일치
- [ ] 폰트/사이즈 변경 즉시 반영
- [ ] 1 MB 파일 입력 지연 < 100 ms

---

#### 7.2.5 마크다운 프리뷰 (P0 / 6h)

- HTML 출력 → DOMPurify sanitize → `.md-doc` 컨테이너에 주입
- 렌더 디바운스: 80 ms
- `styles.css`의 `.preview h1 / p / pre / table / blockquote.callout / .task-li` 그대로 적용 (새 CSS 금지)

**링크 정책**:
- 외부 `http(s)` → `shell:openExternal`
- 상대 경로 → 워크스페이스 기준 해석 후 해당 파일 열기

**완료 기준**:
- [ ] 헤딩, 강조, 리스트, 코드블록, 테이블, 체크박스, 인용, 링크, 이미지 프로토타입과 동일 렌더
- [ ] 코드블록 우상단 언어 라벨 표시
- [ ] 콜아웃(`> [!TIP]`) `.callout` 스타일 적용

---

#### 7.2.6 Split View (P0 / 4h)

- 레이아웃: 좌(에디터) / 5px 리사이즈 핸들 / 우(프리뷰)
- 프로토타입 `useResize` 훅 그대로 사용
- 최소 폭: 에디터 320 px, 프리뷰 280 px
- 모드: `split` · `editor-only` · `preview-only` (`View › 미리보기 표시` 토글)
- `uiStore.editorWidth` 저장 → 종료 시 `session.json` 영속화

---

#### 7.2.7 윈도우 크롬 / 메뉴바 / 상태바 / 토스트 (P0 / 6h)

**상태바 클릭 동작**:
- `LF` / `CRLF` → 줄바꿈 토글 모달
- `UTF-8` 등 → `encodingPicker` 모달 (저장 시 적용)
- `Markdown` → 언어 모드 변경 (향후 확장 hook)

**토스트**: `uiStore.toasts` 통합 관리, 3초 자동 dismiss + 닫기 버튼, `slideIn 0.25s` 애니메이션

---

#### 7.2.8 초기 설정 & 온보딩 (P0 / 10h)

**실행 타입 감지**:
```ts
async function detectLaunchType(): Promise<LaunchType> {
  const configPath = path.join(app.getPath('userData'), 'config.json');
  const exists = await fs.access(configPath).then(() => true).catch(() => false);
  if (!exists) return 'first-launch';

  const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
  return config.$appVersion !== app.getVersion() ? 'after-update' : 'normal';
}
```

**처리 흐름**:

| 타입 | 동작 |
|---|---|
| `first-launch` | 기본 설정 생성 → Welcome 화면 → 시스템 테마 자동 감지 → 폴더 추가/새 파일/단축키 가이드 선택 |
| `after-update` | config version 업데이트 → 마이그레이션 실행 → 릴리스 노트 모달 → 세션 복원 |
| `normal` | 세션 복원 → 메인 화면 |

**Empty State** (워크스페이스 0개 + 탭 0개 시):
```tsx
interface EmptyStateProps {
  hasRecentFiles: boolean;
  onOpenFolder: () => void;
  onCreateFile: () => void;
  onShowShortcuts: () => void;
  recentFiles?: RecentFile[];
}
```

---

#### 7.2.9 단축키 시스템 (P0 / 4h)

**중앙 레지스트리** (`src/renderer/src/shortcuts/registry.ts`):

```ts
export interface ShortcutDefinition {
  id: string;
  category: 'file' | 'edit' | 'view' | 'navigation' | 'help';
  label: string;
  keys: { mac: string; win: string; linux: string };
  scope: 'global' | 'editor' | 'palette' | 'modal';
  preventDefault: boolean;
  action: () => void | Promise<void>;
}

export const SHORTCUTS: ShortcutDefinition[] = [
  {
    id: 'file.save',
    category: 'file',
    label: '저장',
    keys: { mac: 'cmd+s', win: 'ctrl+s', linux: 'ctrl+s' },
    scope: 'global',
    preventDefault: true,
    action: () => useEditorStore.getState().saveTab(
      useEditorStore.getState().activeTabId!, { force: true }
    ),
  },
  { id: 'file.new',       keys: { mac:'cmd+n',       win:'ctrl+n',       linux:'ctrl+n' },       scope:'global', ... },
  { id: 'file.open',      keys: { mac:'cmd+o',       win:'ctrl+o',       linux:'ctrl+o' },       scope:'global', ... },
  { id: 'file.openDir',   keys: { mac:'cmd+shift+o', win:'ctrl+shift+o', linux:'ctrl+shift+o' }, scope:'global', ... },
  { id: 'file.close',     keys: { mac:'cmd+w',       win:'ctrl+w',       linux:'ctrl+w' },       scope:'global', ... },
  { id: 'view.sidebar',   keys: { mac:'cmd+b',       win:'ctrl+b',       linux:'ctrl+b' },       scope:'global', ... },
  { id: 'view.preview',   keys: { mac:'cmd+shift+p', win:'ctrl+shift+p', linux:'ctrl+shift+p' }, scope:'global', ... },
  { id: 'view.toc',       keys: { mac:'cmd+shift+t', win:'ctrl+shift+t', linux:'ctrl+shift+t' }, scope:'global', ... },
  { id: 'nav.palette',    keys: { mac:'cmd+p',       win:'ctrl+p',       linux:'ctrl+p' },       scope:'global', ... },
  { id: 'help.shortcuts', keys: { mac:'cmd+?',       win:'ctrl+?',       linux:'ctrl+?' },       scope:'global', ... },
  { id: 'settings.open',  keys: { mac:'cmd+,',       win:'ctrl+,',       linux:'ctrl+,' },       scope:'global', ... },
];
```

**우선순위**: `global` > `editor` > Monaco 기본

**등록 훅**:
```ts
// src/renderer/src/hooks/useShortcuts.ts
export function useShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const matched = matchShortcut(e, SHORTCUTS);
      if (!matched) return;
      if (matched.scope === 'global' || matched.scope === getCurrentScope()) {
        if (matched.preventDefault) e.preventDefault();
        matched.action();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
```

---

#### 7.2.10 로깅 & 디버깅 (P0 / 3h)

```ts
// Main
import log from 'electron-log/main';
log.initialize();
log.transports.file.maxSize = 10 * 1024 * 1024;  // 10 MB 로테이션
// 최대 5개 아카이브 보관

// 로그 레벨
// production: file=info, console=warn
// development: file=debug, console=debug
```

**로그 파일 위치**:
| OS | 경로 |
|---|---|
| macOS | `~/Library/Logs/markdown-editor/{main,renderer}.log` |
| Windows | `%USERPROFILE%\AppData\Roaming\markdown-editor\logs\` |
| Linux | `~/.config/markdown-editor/logs/` |

**메뉴**:
- `Help › 로그 폴더 열기` → `shell.openPath(logDir)`
- `Help › 진단 정보 복사` → `Diagnostics` JSON → clipboard

---

#### 7.2.11 백업 & 복구 (P0 / 5h)

**백업 종류**:

| 종류 | 주기 | 위치 | 보관 |
|---|---|---|---|
| auto | 30초 | `.backup/auto/` | 7일 |
| pre-save | 저장 직전 | `.backup/versions/` | 10개 / 30일 |
| 설정 파일 | 변경 직전 | 원본 옆 `.backup` 접미사 | 3개월 |

**비정상 종료 감지**:
```ts
// 앱 시작 시 `.running` 플래그 파일 존재 여부 확인
// 정상 종료 시 `before-quit` 이벤트에서 삭제
async function detectAbnormalShutdown(): Promise<boolean> {
  const flagPath = path.join(app.getPath('userData'), '.running');
  if (await fileExists(flagPath)) return true;
  await fs.writeFile(flagPath, String(Date.now()));
  app.on('before-quit', () => fs.unlink(flagPath).catch(() => {}));
  return false;
}
```

**복구 흐름**: 비정상 종료 감지 → `.backup/auto/`에서 dirty 백업 검색 → `RecoveryDialog` 표시 → [복구] / [원본 열기] / [삭제]

---

### 7.3 P1 — 1차 출시

#### 7.3.1 워크스페이스(폴더) 관리

- `workspaces.json`에 `Folder[]` 저장
- 트리 빌드: expand 시 lazy `fs:readDirectory`, `.md/.markdown/.mdown/.mkd` 표시 (숨김 파일 제외)
- 정렬: 폴더 우선, 알파벳 오름차순
- 드래그&드롭: 사이드바에 폴더 드롭 → 워크스페이스 추가
- `watch:add` → chokidar 감시 시작 → `fs:externalChange` 이벤트 발생

#### 7.3.2 최근 파일

- `recent-files.json`에 최대 30개 (중복 방지, LIFO)
- 사이드바 "최근 파일" 섹션 + 명령어 팔레트 우선 노출

#### 7.3.3 환경 설정 (Settings)

- 저장: `<appData>/markdown-editor/config.json` (`VersionedConfig<AppSettings>`)
- 모달 3탭: `General / Editor / Markdown`
- `system` 테마: `nativeTheme.shouldUseDarkColors` 구독
- 변경 즉시 전 화면 반영

#### 7.3.4 자동 생성 TOC

- `markdown-it-anchor` slug 기반, H1~H3
- `IntersectionObserver`로 활성 항목 하이라이트
- 클릭 → 프리뷰 스크롤 + 에디터 커서 이동

#### 7.3.5 KaTeX 수식

- `markdown-it-texmath` 또는 `markdown-it-katex` 통합
- `$inline$`, `$$block$$` 지원

#### 7.3.6 데이터 마이그레이션

```ts
// 모든 설정 파일: $schema 버전 관리
const SETTINGS_MIGRATIONS: Migration<any, any>[] = [
  {
    fromVersion: 1, toVersion: 2,
    description: 'autoSave를 객체로 변경',
    migrate: (old) => ({
      ...old,
      editor: { ...old.editor, autoSave: { enabled: old.editor.autoSave ?? true, debounceMs: 500 } }
    }),
  },
];
```

마이그레이션 대상: `config.json`, `workspaces.json`, `recent-files.json`, `session.json`, `.backup/metadata.json`

---

### 7.4 P2 — 2차 출시

#### 7.4.1 워크스페이스 전역 검색 & 일괄 바꾸기

- 진입점: 사이드바 검색창 + `Edit › 파일에서 찾기…`
- 백엔드: Main Worker Thread에서 `readdir + readFile + regex`
- 일치당 최대 100줄 반환
- 일괄 바꾸기: dry-run 미리보기 → 확인 모달 → 적용

#### 7.4.2 스크롤 싱크

- 에디터 ↔ 프리뷰 양방향, 200ms throttle
- 에디터→프리뷰: 현재 가시 영역 첫 줄 헤딩/블록으로 scrollTo
- 프리뷰→에디터: 클릭 헤딩 줄 번호로 editor.revealLine

#### 7.4.3 외부 파일 변경 감지

- chokidar `change` 이벤트 → `fs:externalChange` IPC
- 탭이 clean → "외부 변경 감지" 토스트 [다시 불러오기] [무시]
- 탭이 dirty → 병합 모달 (내 변경 보존 / 디스크 덮어쓰기 / 사본 저장)

---

### 7.5 P3 — 선택적 기능

- PDF / HTML 내보내기
- Vim 모드 (monaco-vim)
- 플러그인 시스템 (contextBridge 화이트리스트 필요)
- 단축키 커스터마이징 (`userShortcuts.json`)

---

## 8. UI 컴포넌트 매핑

> `design/styles.css` CSS 변수와 클래스를 **그대로** 이식. 임의 색 추가 금지.

| 프로토타입 | 컴포넌트 | 비고 |
|---|---|---|
| `TitleBar` | `<TitleBar />` | macOS: `titleBarStyle:'hiddenInset'` / Win·Linux: 커스텀 |
| `MenuBar` + `MenuDropdown` | `<MenuBar />` | 항목·단축키 → `menu.ts` |
| `Sidebar` + `TreeNode` | `<Sidebar />` | >1000 노드 → `react-arborist` 가상화 고려 |
| `Editor` (모킹) | `<EditorPane />` | Monaco 내부, 탭바·브레드크럼 유지 |
| `Preview` | `<PreviewPane />` | markdown-it HTML + DOMPurify sanitize |
| `TocPane` | `<TocPane />` | IntersectionObserver |
| `StatusBar` | `<StatusBar />` | 클릭 → 모달 |
| `NewFileModal` | `<NewFileModal />` | 동일 패턴으로 Rename·ConfirmDelete 추가 |
| `Palette` | `<CommandPalette />` | 명령 + 파일 통합 검색 |
| `ToastStack` | `<ToastStack />` | uiStore 연결 |
| — | `<EmptyState />` | 워크스페이스 없을 때 |

**인터랙션 반드시 보존**:
- 리사이즈 핸들: 5 px hit, hover 시 accent 색
- 메뉴 드롭다운: 호버 자동 전환, ESC/외부클릭 닫힘
- 토스트: `slideIn 0.25s`, 3초 auto-dismiss
- 모달: scrim + `pop 0.2s ease-out`, ESC 닫기, 첫 입력 필드 자동 포커스

---

## 9. 에러 처리

### 9.1 IPC 핸들러 정책

모든 핸들러는 `try/catch` + 정규화된 에러 반환:
```ts
// Main IPC handler 패턴
ipcMain.handle('fs:writeFile', async (_, args) => {
  try {
    await fs.writeFile(args.path, args.content, args.encoding);
    return { ok: true, mtime: Date.now() };
  } catch (err: any) {
    log.error('fs:writeFile failed', { path: args.path, code: err.code });
    return { ok: false, code: err.code, message: err.message };
  }
});
```

### 9.2 에러 코드 → 사용자 메시지

| 코드 | 메시지 |
|---|---|
| `EACCES` | "권한이 없습니다. 다른 위치에 저장하시겠어요?" + 액션 |
| `ENOENT` | "파일을 찾을 수 없습니다." |
| `ENOSPC` | "디스크 공간이 부족합니다." |
| `EBUSY` | "다른 프로그램이 파일을 사용 중입니다. 재시도?" |
| `EEXIST` | "이미 존재합니다." (모달 inline) |
| `EUNKNOWN` | "오류가 발생했습니다. 다시 시도해주세요." |

### 9.3 글로벌 핸들러

```ts
// Main
process.on('uncaughtException', (err) => { log.error('uncaughtException', err); });
process.on('unhandledRejection', (err) => { log.error('unhandledRejection', err); });

// Renderer
window.addEventListener('error', (e) => window.api.invoke('app:reportError', { message: e.message, stack: e.error?.stack }));
window.addEventListener('unhandledrejection', (e) => window.api.invoke('app:reportError', { message: String(e.reason) }));
```

---

## 10. 성능 요구사항

| 항목 | 목표 |
|---|---|
| 100 KB 파일 열기 | < 100 ms |
| 1 MB 파일 열기 | < 500 ms |
| 10 MB 파일 열기 | < 2초 + 경고 토스트 |
| 입력 → 프리뷰 갱신 | < 200 ms (80 ms debounce) |
| 자동 저장 debounce | 500 ms (설정 100~2000) |
| 기본 RAM | < 200 MB |
| 최대 RAM (10탭+대형파일) | < 500 MB |
| idle CPU | < 5% |
| 편집 중 CPU | < 15% |

**성능 전략**:
- 마크다운 파싱 → Web Worker (`markdown.worker.ts`)
- 대형 파일 → `largeFileOptimizations: true`, 미니맵 자동 비활성
- 비활성 탭 (2시간+) → content 메모리 해제, 재활성 시 reload
- 이미지 → `loading="lazy"`

---

## 11. 보안 & 데이터 보호

### 11.1 저장 위치

| OS | 경로 |
|---|---|
| macOS | `~/Library/Application Support/markdown-editor/` |
| Windows | `%APPDATA%\markdown-editor\` |
| Linux | `~/.config/markdown-editor/` |

### 11.2 데이터 파일

| 파일 | 내용 | 마이그레이션 |
|---|---|---|
| `config.json` | `AppSettings` (with `$schema`) | ✓ |
| `workspaces.json` | `Folder[]` (with `$schema`) | ✓ |
| `recent-files.json` | `RecentFile[]` (with `$schema`) | ✓ |
| `session.json` | 마지막 탭/창 상태 | ✓ |
| `.backup/metadata.json` | 백업 인덱스 | ✓ |
| `logs/*.log` | electron-log | ✗ |
| `.running` | 종료 감지 플래그 | ✗ |
| `crashes/` | crashReporter | ✗ |

### 11.3 보안 정책

- 비밀번호/토큰 저장 금지
- 설정 파일 권한 `0600` (macOS/Linux)
- 워크스페이스 외부 경로 쓰기 → 명시적 사용자 액션만 허용
- Symlink 추적 안 함 (`resolveSymlinks: false`)
- 마크다운 HTML → DOMPurify sanitize 필수
- HTML 렌더링 → `{ html: true }` + DOMPurify 조합

---

## 12. 테스트 전략

### 12.1 단위 테스트 (Vitest)

- 마크다운 파싱 래퍼 (헤딩 추출, 콜아웃 감지)
- 인코딩 감지 함수 (`chardet` + BOM)
- 핵심 Store 액션 (editorStore, workspaceStore, settingsStore)
- 경로 정규화 / 워크스페이스 외부 쓰기 차단
- 마이그레이션 함수 (v1→v2, 실패 케이스)

### 12.2 통합 테스트 (Vitest + happy-dom)

- IPC 모킹: "파일 열기 → 편집 → 자동 저장 → 외부 변경 감지"
- 탭 닫기 dirty 처리 분기

### 12.3 E2E (Playwright + Electron)

- S1 (새 파일 작성 → 저장), S2 (기존 파일 편집), S5 (외부 변경 감지) 시나리오
- `fixtures/encodings/*.md` — UTF-8, EUC-KR, UTF-16 BOM 픽스처

### 12.4 수동 체크리스트

- [ ] 100 KB / 1 MB / 10 MB 파일 처리
- [ ] EUC-KR, UTF-16 BOM 파일 열기/저장
- [ ] 외부 변경 (touch / 직접 편집) 감지
- [ ] 읽기 전용 폴더 저장 시도
- [ ] 다크 ↔ 라이트 전환 시 Monaco 토큰 색 즉시 반영
- [ ] 30분 연속 사용 — 누수/지연 없음
- [ ] 첫 실행 시 Welcome 화면 표시
- [ ] 업데이트 후 마이그레이션 + 릴리스 노트 표시
- [ ] 강제 종료 후 재시작 시 복구 다이얼로그
- [ ] 단축키 충돌 없음 (충돌 검출 로그 확인)
- [ ] 단축키 가이드 모달 (`⌘?`)
- [ ] `Help › 로그 폴더 열기` 동작
- [ ] 백업 자동 정리 (7일 / 30일)
- [ ] 충돌 시 백업 복구 가능
- [ ] 이전 버전 설정 파일 마이그레이션

---

## 13. 개발 로드맵

| Phase | 기간 | 목표 |
|---|---|---|
| **0. 셋업** | 2일 | electron-vite + React + TS 보일러플레이트, contextBridge preload, `styles.css` 토큰 이식, electron-log 셋업 |
| **1. MVP (P0)** | 2.5주 | 파일 열기/저장/생성/이름변경/삭제, Monaco, 프리뷰, Split View, 자동 저장, 메뉴/토스트/모달/팔레트, 온보딩, 단축키 시스템, 로깅, 백업 |
| **2. 워크스페이스 (P1.1~1.3)** | 1.5주 | 폴더 관리, 트리 lazy 로드, chokidar, 최근 파일, 설정 모달, 마이그레이션 시스템 |
| **3. 고급 렌더링 (P1.4~1.5)** | 1주 | TOC 자동/싱크, KaTeX |
| **4. 검색·동기화 (P2)** | 1주 | 전역 검색, 스크롤 싱크, 외부 변경 감지 |
| **5. 폴리싱·배포** | 1주 | electron-builder, 코드 사이닝, 자동 업데이트, 릴리스 노트 |

### Phase 1 세부 작업 (총 ~80h)

| 작업 | 우선순위 | 예상 | 의존성 |
|---|---|---|---|
| 보일러플레이트 셋업 | P0 | 4h | – |
| 디자인 토큰 이식 | P0 | 4h | – |
| Zustand store 4종 | P0 | 4h | – |
| electron-log 셋업 | P0 | 3h | – |
| preload + IPC 골격 | P0 | 4h | – |
| 단축키 레지스트리 | P0 | 4h | Zustand |
| 파일 열기 (7.2.1) | P0 | 6h | IPC, store |
| 자동 저장 (7.2.2) | P0 | 4h | 단축키, IPC |
| 파일 생성/이름변경/삭제 (7.2.3) | P0 | 5h | IPC, 모달 |
| Monaco 통합 (7.2.4) | P0 | 8h | 단축키, 토큰 |
| 마크다운 프리뷰 (7.2.5) | P0 | 6h | markdown-it |
| Split View (7.2.6) | P0 | 4h | useResize |
| 윈도우 크롬/메뉴/상태바 (7.2.7) | P0 | 6h | store |
| 온보딩 (7.2.8) | P0 | 10h | 위 모두 |
| 백업 & 복구 (7.2.11) | P0 | 5h | 자동 저장 |
| 단축키 가이드 모달 | P0 | 3h | 단축키 |

---

## 14. 호환성

| 항목 | 지원 범위 |
|---|---|
| OS | macOS 11+ (권장 13+), Windows 10+, Ubuntu 20.04+ |
| 마크다운 | CommonMark + GFM, 옵션으로 KaTeX |
| 파일 인코딩 | UTF-8 (기본), UTF-16 LE/BE, EUC-KR, CP1252 (BOM 자동 인식) |
| 파일 확장자 | `.md`, `.markdown`, `.mdown`, `.mkd`, 옵션으로 `.txt` |
| 개행 | LF / CRLF 자동 감지, 저장 시 원본 유지 |

---

## 15. 배포 & 출시

### 15.1 자동 업데이트

- `electron-updater` + GitHub Releases
- 앱 시작 1분 후 update check
- `Help › 업데이트 확인…` 수동 트리거

### 15.2 출시 체크리스트

- [ ] 모든 P0 완료
- [ ] OS별 패키지 설치/제거/업데이트 테스트
- [ ] 30분 사용 무중단 검증
- [ ] README + 단축키 표
- [ ] `CHANGELOG.md`

---

*참조: `PRD_META.md` (단독 진실의 원천) > `design/` 프로토타입. 충돌 시 사용자에게 확인 요청.*
