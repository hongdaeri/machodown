# Markflow — 개발 로드맵

> 기준 문서: `PRD.md` (2026-05-22)  
> 총 예상 기간: ~7.5주 | 총 예상 공수: ~130h

---

## 진행 상태 범례

| 상태 | 의미 |
|---|---|
| `[ ]` | 미시작 |
| `[→]` | 진행 중 |
| `[x]` | 완료 |
| `[!]` | 블로커 |

---

## Phase 0 — 프로젝트 셋업 (2일 / ~12h)

> 모든 Phase의 공통 기반. 이 Phase가 완료되어야 Phase 1 착수 가능.

| ID | 작업 | 예상 | 의존 | 상태 |
|---|---|---|---|---|
| P0-01 | electron-vite + React + TypeScript 보일러플레이트 생성 | 2h | – | `[x]` |
| P0-02 | contextBridge preload 골격 구현 (`src/preload/index.ts`) | 1h | P0-01 | `[x]` |
| P0-03 | BrowserWindow 보안 설정 (`contextIsolation`, `sandbox`) | 0.5h | P0-01 | `[x]` |
| P0-04 | `design/styles.css` 디자인 토큰 Renderer로 이식 | 2h | P0-01 | `[x]` |
| P0-05 | electron-log 셋업 (파일 레벨, 로테이션 10MB × 5) | 1h | P0-01 | `[x]` |
| P0-06 | ESLint + Prettier + husky + lint-staged 커밋 훅 | 1h | P0-01 | `[x]` |
| P0-07 | Vitest 설정 (`jsdom`, `coverage >= 80%`) | 1h | P0-01 | `[x]` |
| P0-08 | TypeScript `strict: true` 전 파일 적용 확인 | 0.5h | P0-01 | `[x]` |
| P0-09 | `npm run dev / build / package` 스크립트 검증 | 1h | P0-01 ~ P0-08 | `[x]` |
| P0-10 | 디렉터리 구조 스캐폴딩 (`src/main`, `src/preload`, `src/renderer`) | 1h | P0-01 | `[x]` |

---

## Phase 1 — MVP (P0 필수 기능) (~2.5주 / ~80h)

> 출시 불가 차단 기능 모음. P0-09 완료 후 병렬 착수 가능한 작업 표기.

### 1-A. 기반 레이어 (병렬 착수 가능)

| ID | 작업 | 예상 | 의존 | 상태 |
|---|---|---|---|---|
| P1-01 | Zustand 4종 Store 타입 정의 (`Tab`, `Folder`, `AppSettings`, `Toast`, `ModalState`) | 1h | P0-09 | `[ ]` |
| P1-02 | `useEditorStore` 구현 (`openTab`, `closeTab`, `updateContent`, `saveTab`, `saveAllDirty`) | 3h | P1-01 | `[ ]` |
| P1-03 | `useWorkspaceStore` 구현 (`addFolder`, `removeFolder`, `pushRecent`) | 2h | P1-01 | `[ ]` |
| P1-04 | `useSettingsStore` 구현 (persist 미들웨어 + IPC storage) | 2h | P1-01 | `[ ]` |
| P1-05 | `useUiStore` 구현 (`pushToast`, `openModal`, `setEditorWidth`, `setSidebarWidth`) | 1h | P1-01 | `[ ]` |
| P1-06 | IPC 핸들러 골격 (`src/main/ipc/`) — 채널 stub 전체 등록 | 2h | P0-02 | `[ ]` |
| P1-07 | 단축키 레지스트리 (`src/renderer/src/shortcuts/registry.ts`) + `useShortcuts` 훅 | 4h | P1-02 | `[ ]` |

### 1-B. 파일 시스템 IPC

| ID | 작업 | 예상 | 의존 | 상태 |
|---|---|---|---|---|
| P1-08 | `fs:readFile` — BOM 검사 + chardet 인코딩 감지 + EOL 감지 | 3h | P1-06 | `[ ]` |
| P1-09 | `fs:writeFile` — atomic write (임시파일 → rename) + mtime 반환 | 2h | P1-06 | `[ ]` |
| P1-10 | `fs:createFile`, `fs:rename`, `fs:trash` (OS 휴지통) | 2h | P1-06 | `[ ]` |
| P1-11 | `dialog:openFile`, `dialog:openDirectory`, `dialog:saveFile` | 1h | P1-06 | `[ ]` |
| P1-12 | `fs:readDirectory`, `fs:stat` | 1h | P1-06 | `[ ]` |

### 1-C. 파일 열기 & 탭 관리 (7.2.1)

| ID | 작업 | 예상 | 의존 | 상태 |
|---|---|---|---|---|
| P1-13 | 파일 열기 플로우 연결 (메뉴 · `⌘O` → IPC → `editorStore.openTab`) | 2h | P1-02, P1-08, P1-11 | `[ ]` |
| P1-14 | 중복 파일 열기 시 탭 활성화만 처리 | 0.5h | P1-13 | `[ ]` |
| P1-15 | 파일 열기 에러 처리 (ENOENT / EACCES → 토스트, 디코딩 실패 → EncodingPicker 모달) | 1h | P1-13 | `[ ]` |
| P1-16 | **테스트**: 파일 열기 단위 + 인코딩(UTF-8/UTF-16/EUC-KR) 통합 | 2h | P1-13 | `[ ]` |

### 1-D. 자동 저장 (7.2.2)

| ID | 작업 | 예상 | 의존 | 상태 |
|---|---|---|---|---|
| P1-17 | Monaco `onDidChangeModelContent` → `updateContent` → debounce(500ms) → `fs:writeFile` | 2h | P1-02, P1-09 | `[ ]` |
| P1-18 | `⌘S` force 저장 (debounce 무시) | 0.5h | P1-17, P1-07 | `[ ]` |
| P1-19 | 저장 상태 표시 (`●` dirty 토글) | 0.5h | P1-17 | `[ ]` |
| P1-20 | 자동 저장 에러 처리 (EACCES / ENOSPC → 토스트 + 액션) | 1h | P1-17 | `[ ]` |
| P1-21 | **테스트**: 자동 저장 debounce / force save / 에러 분기 | 1h | P1-17 | `[ ]` |

### 1-E. 파일 생성 / 이름 변경 / 삭제 (7.2.3)

| ID | 작업 | 예상 | 의존 | 상태 |
|---|---|---|---|---|
| P1-22 | `NewFileModal` 구현 + `fs:createFile` 연결 | 1.5h | P1-10, P1-05 | `[ ]` |
| P1-23 | `RenameModal` 구현 + `fs:rename` 연결 + 열린 탭 경로 갱신 | 1.5h | P1-10, P1-02 | `[ ]` |
| P1-24 | `ConfirmDeleteModal` 구현 + `fs:trash` 연결 | 1h | P1-10 | `[ ]` |
| P1-25 | 에러 처리 (EEXIST inline / ENOENT 트리 새로고침) | 1h | P1-22, P1-23 | `[ ]` |

### 1-F. Monaco 에디터 통합 (7.2.4)

| ID | 작업 | 예상 | 의존 | 상태 |
|---|---|---|---|---|
| P1-26 | `@monaco-editor/react` 설치 + `EditorPane` 컴포넌트 골격 | 1h | P0-04 | `[ ]` |
| P1-27 | `markflow-light` / `markflow-dark` 커스텀 테마 등록 (styles.css 토큰 기반) | 2h | P1-26 | `[ ]` |
| P1-28 | 에디터 옵션 연결 (fontFamily, fontSize, wordWrap, minimap, `largeFileOptimizations`) | 1h | P1-26, P1-04 | `[ ]` |
| P1-29 | 탭 전환 시 Monaco `ICodeEditorViewState` 복원 | 1h | P1-26, P1-02 | `[ ]` |
| P1-30 | `markdown.worker.ts` Web Worker (markdown-it + anchor + task-lists + hljs) | 2h | – | `[ ]` |
| P1-31 | **테스트**: 테마 토큰 일치 + 1MB 파일 입력 지연 < 100ms | 1h | P1-27 | `[ ]` |

### 1-G. 마크다운 프리뷰 (7.2.5)

| ID | 작업 | 예상 | 의존 | 상태 |
|---|---|---|---|---|
| P1-32 | `PreviewPane` 컴포넌트 — Worker 메시지 수신 + DOMPurify sanitize → `.md-doc` 주입 | 2h | P1-30 | `[ ]` |
| P1-33 | 렌더 디바운스 80ms 구현 | 0.5h | P1-32 | `[ ]` |
| P1-34 | styles.css `.preview` 클래스 그대로 이식 (새 CSS 금지) | 1h | P1-32, P0-04 | `[ ]` |
| P1-35 | 링크 정책: 외부 → `shell:openExternal`, 상대 → 워크스페이스 기준 파일 열기 | 1h | P1-32, P1-13 | `[ ]` |
| P1-36 | 코드블록 언어 라벨 + 콜아웃(`> [!TIP]`) `.callout` 스타일 | 1.5h | P1-34 | `[ ]` |

### 1-H. Split View & 레이아웃 (7.2.6)

| ID | 작업 | 예상 | 의존 | 상태 |
|---|---|---|---|---|
| P1-37 | `useResize` 훅 (5px 핸들, 에디터 최소 320px, 프리뷰 최소 280px) | 1.5h | P0-04 | `[ ]` |
| P1-38 | `split` / `editor-only` / `preview-only` 모드 구현 + `View` 메뉴 토글 | 1.5h | P1-37, P1-07 | `[ ]` |
| P1-39 | `uiStore.editorWidth` / `sidebarWidth` 저장 → `session.json` 영속화 | 1h | P1-05, P1-38 | `[ ]` |

### 1-I. 윈도우 크롬 / 메뉴바 / 상태바 / 토스트 (7.2.7)

| ID | 작업 | 예상 | 의존 | 상태 |
|---|---|---|---|---|
| P1-40 | `TitleBar` (macOS `hiddenInset` / Win·Linux 커스텀) | 1h | P0-04 | `[ ]` |
| P1-41 | `MenuBar` + `MenuDropdown` (hover 자동 전환, ESC/외부클릭 닫힘) | 2h | P0-04, P1-07 | `[ ]` |
| P1-42 | `menu.ts` 네이티브 메뉴 — File / Edit / View / Help 항목 + 단축키 | 1.5h | P1-07 | `[ ]` |
| P1-43 | `StatusBar` (EOL / Encoding / Language 클릭 → 모달 연결) | 1.5h | P1-02, P1-05 | `[ ]` |
| P1-44 | `ToastStack` — `uiStore.toasts` 연결, `slideIn 0.25s`, 3초 auto-dismiss | 1h | P1-05 | `[ ]` |

### 1-J. 온보딩 & Empty State (7.2.8)

| ID | 작업 | 예상 | 의존 | 상태 |
|---|---|---|---|---|
| P1-45 | `detectLaunchType()` 구현 (`config.json` 존재·버전 비교) | 1h | P1-06 | `[ ]` |
| P1-46 | `first-launch` 플로우: 기본 설정 생성 → Welcome 화면 → 시스템 테마 → 선택지 | 3h | P1-45, P1-04 | `[ ]` |
| P1-47 | `after-update` 플로우: 마이그레이션 실행 → 릴리스 노트 모달 → 세션 복원 | 2h | P1-45 | `[ ]` |
| P1-48 | `normal` 플로우: `session.json` 탭 복원 | 1h | P1-45, P1-02 | `[ ]` |
| P1-49 | `EmptyState` 컴포넌트 (최근 파일 목록 포함) | 1h | P1-03 | `[ ]` |
| P1-50 | **테스트**: LaunchType 분기 3종 + 세션 복원 | 2h | P1-45 | `[ ]` |

### 1-K. 백업 & 복구 (7.2.11)

| ID | 작업 | 예상 | 의존 | 상태 |
|---|---|---|---|---|
| P1-51 | `BackupService` — auto(30초), pre-save(저장 직전), manual 백업 생성 | 2h | P1-09 | `[ ]` |
| P1-52 | 백업 자동 정리 (7일/10개/30일 규칙) | 1h | P1-51 | `[ ]` |
| P1-53 | `detectAbnormalShutdown()` 플래그 파일 로직 | 0.5h | P1-06 | `[ ]` |
| P1-54 | `RecoveryDialog` — dirty 백업 목록 표시 + 복구/원본/삭제 액션 | 1.5h | P1-51, P1-53 | `[ ]` |
| P1-55 | backup IPC 전체 (`backup:list`, `backup:recover`, `backup:delete`, `backup:clearAll`, `backup:createManual`) | 1h | P1-51 | `[ ]` |

### 1-L. 단축키 가이드 모달

| ID | 작업 | 예상 | 의존 | 상태 |
|---|---|---|---|---|
| P1-56 | `ShortcutsModal` — 레지스트리에서 카테고리별 렌더링 + `⌘?` 트리거 | 3h | P1-07 | `[ ]` |

### 1-M. 로깅 & 진단 (7.2.10)

| ID | 작업 | 예상 | 의존 | 상태 |
|---|---|---|---|---|
| P1-57 | Renderer 글로벌 에러 핸들러 → `app:reportError` IPC | 0.5h | P1-06 | `[ ]` |
| P1-58 | `Help › 로그 폴더 열기`, `Help › 진단 정보 복사` 메뉴 연결 | 1h | P1-42, P1-06 | `[ ]` |
| P1-59 | `diagnostics:collect` IPC 구현 (`Diagnostics` 타입) | 1h | P1-06 | `[ ]` |

---

## Phase 2 — 워크스페이스 (P1.1~1.3) (~1.5주 / ~25h)

> Phase 1 완료 후 착수. P2-01~P2-04 병렬 가능.

| ID | 작업 | 예상 | 의존 | 상태 |
|---|---|---|---|---|
| P2-01 | `workspaces.json` 영속화 (`VersionedConfig<Folder[]>`) | 1h | P1-03 | `[ ]` |
| P2-02 | 사이드바 트리 빌드 — lazy `fs:readDirectory`, `.md/.markdown/.mdown/.mkd` 필터, 폴더 우선 정렬 | 3h | P1-12, P2-01 | `[ ]` |
| P2-03 | 숨김 파일 제외 + >1000 노드 react-arborist 가상화 | 2h | P2-02 | `[ ]` |
| P2-04 | 사이드바 드래그&드롭 폴더 추가 | 1.5h | P2-02 | `[ ]` |
| P2-05 | `watch:add` / `watch:remove` + chokidar `WatcherService` | 2h | P1-06 | `[ ]` |
| P2-06 | `fs:externalChange` IPC → `useWorkspaceStore.refreshNode` | 1h | P2-05, P1-03 | `[ ]` |
| P2-07 | `recent-files.json` 영속화 (최대 30개 LIFO) | 1h | P1-03 | `[ ]` |
| P2-08 | 사이드바 "최근 파일" 섹션 UI | 1h | P2-07 | `[ ]` |
| P2-09 | `CommandPalette` — 명령 + 파일 + 최근 파일 통합 검색 (`⌘P`) | 3h | P1-07, P2-07 | `[ ]` |
| P2-10 | 환경 설정 모달 3탭 (`General / Editor / Markdown`) | 4h | P1-04 | `[ ]` |
| P2-11 | `system` 테마 `nativeTheme.shouldUseDarkColors` 구독 → `theme:nativeChanged` IPC | 1h | P1-06, P2-10 | `[ ]` |
| P2-12 | 데이터 마이그레이션 프레임워크 (`$schema` 버전 관리 + Migration 배열) | 3h | P1-06 | `[ ]` |
| P2-13 | 마이그레이션 대상: `config.json`, `workspaces.json`, `recent-files.json`, `session.json`, `.backup/metadata.json` | 1.5h | P2-12 | `[ ]` |
| P2-14 | **테스트**: 마이그레이션 v1→v2 + 실패 케이스 | 1h | P2-13 | `[ ]` |

---

## Phase 3 — 고급 렌더링 (P1.4~1.5) (~1주 / ~10h)

> Phase 2 완료 후 착수.

| ID | 작업 | 예상 | 의존 | 상태 |
|---|---|---|---|---|
| P3-01 | `markdown-it-anchor` slug 기반 H1~H3 TOC 추출 | 1h | P1-30 | `[ ]` |
| P3-02 | `TocPane` 컴포넌트 — `IntersectionObserver` 활성 항목 하이라이트 | 2h | P3-01 | `[ ]` |
| P3-03 | TOC 클릭 → 프리뷰 스크롤 + 에디터 커서 이동 | 1.5h | P3-02 | `[ ]` |
| P3-04 | `⌘⇧T` TOC 토글 단축키 연결 | 0.5h | P3-02, P1-07 | `[ ]` |
| P3-05 | KaTeX 통합 (`markdown-it-texmath` 또는 `markdown-it-katex`) | 2h | P1-30 | `[ ]` |
| P3-06 | `$inline$` / `$$block$$` 렌더링 검증 + 설정 옵션 연결 | 1h | P3-05, P2-10 | `[ ]` |
| P3-07 | **테스트**: TOC 생성 + KaTeX 렌더링 | 2h | P3-03, P3-06 | `[ ]` |

---

## Phase 4 — 검색 & 동기화 (P2) (~1주 / ~15h)

> Phase 3 완료 후 착수.

| ID | 작업 | 예상 | 의존 | 상태 |
|---|---|---|---|---|
| P4-01 | Main Worker Thread 전역 검색 (`readdir + readFile + regex`, 일치당 최대 100줄) | 3h | P2-05 | `[ ]` |
| P4-02 | 검색 UI — 사이드바 검색창 + `Edit › 파일에서 찾기…` 진입점 | 2h | P4-01 | `[ ]` |
| P4-03 | 일괄 바꾸기 — dry-run 미리보기 → 확인 모달 → 적용 | 3h | P4-01 | `[ ]` |
| P4-04 | 스크롤 싱크 — 에디터→프리뷰 (현재 가시 영역 첫 줄 기준), 200ms throttle | 2h | P1-32 | `[ ]` |
| P4-05 | 스크롤 싱크 — 프리뷰→에디터 (클릭 헤딩 줄 번호 `revealLine`) | 1h | P4-04 | `[ ]` |
| P4-06 | 외부 파일 변경 감지 — clean 탭: 토스트 [다시 불러오기] [무시] | 1h | P2-06 | `[ ]` |
| P4-07 | 외부 파일 변경 감지 — dirty 탭: 병합 모달 (내 변경 보존 / 디스크 / 사본 저장) | 2h | P4-06 | `[ ]` |
| P4-08 | **테스트**: 전역 검색 결과 + 외부 변경 감지 시나리오 | 1h | P4-03, P4-07 | `[ ]` |

---

## Phase 5 — 폴리싱 & 배포 (~1주 / ~15h)

> Phase 4 완료 후 착수.

| ID | 작업 | 예상 | 의존 | 상태 |
|---|---|---|---|---|
| P5-01 | electron-builder 설정 (macOS `.dmg`/`.zip`, Windows NSIS/Portable, Linux `.AppImage`/`.deb`) | 2h | – | `[ ]` |
| P5-02 | macOS 코드 사이닝 + notarization | 2h | P5-01 | `[ ]` |
| P5-03 | Windows 코드 사이닝 | 1h | P5-01 | `[ ]` |
| P5-04 | `electron-updater` + GitHub Releases 자동 업데이트 | 2h | P5-01 | `[ ]` |
| P5-05 | `update:available` / `update:downloaded` IPC → UI 알림 | 1h | P5-04 | `[ ]` |
| P5-06 | `releaseNotes:get` IPC + `ReleaseNotesModal` | 1h | P5-04 | `[ ]` |
| P5-07 | E2E 테스트 — S1(새 파일 저장), S2(기존 파일 편집), S5(외부 변경 감지) | 3h | P4-07 | `[ ]` |
| P5-08 | 수동 체크리스트 전체 통과 (PRD §12.4) | 2h | P5-07 | `[ ]` |
| P5-09 | README + 단축키 표 작성 | 1h | P5-08 | `[ ]` |
| P5-10 | `CHANGELOG.md` 작성 | 0.5h | P5-08 | `[ ]` |
| P5-11 | 30분 연속 사용 무중단 검증 (RAM < 200MB, idle CPU < 5%) | 1h | P5-08 | `[ ]` |

---

## P3 — 선택적 기능 (백로그)

> Phase 5 완료 이후 검토.

| ID | 작업 | 메모 |
|---|---|---|
| BL-01 | PDF / HTML 내보내기 | electron `printToPDF` 또는 `puppeteer` |
| BL-02 | Vim 모드 | `monaco-vim` 통합 |
| BL-03 | 플러그인 시스템 | contextBridge 화이트리스트 설계 필요 |
| BL-04 | 단축키 커스터마이징 | `userShortcuts.json` + 설정 UI |

---

## 의존성 그래프 (핵심 경로)

```
P0 (Setup)
 └─ P1-A (Store + IPC 골격 + 단축키)
     ├─ P1-B (FS IPC) ─── P1-C (파일 열기) ─ P1-D (자동저장) ─ P1-E (CRUD)
     ├─ P1-F (Monaco) ─── P1-G (프리뷰) ──── P1-H (Split View)
     ├─ P1-I (크롬/메뉴/상태바/토스트)
     ├─ P1-J (온보딩) ──────────────────────────────────────────┐
     └─ P1-K (백업) + P1-L (단축키 모달) + P1-M (로그/진단)    │
                                                               ↓
                                                        Phase 2 (워크스페이스)
                                                               ↓
                                                        Phase 3 (TOC + KaTeX)
                                                               ↓
                                                        Phase 4 (검색 + 동기화)
                                                               ↓
                                                        Phase 5 (배포)
```

---

## 성능 목표 체크포인트

| 시점 | 측정 항목 | 목표 |
|---|---|---|
| Phase 1 완료 | 100KB 파일 열기 | < 100ms |
| Phase 1 완료 | 1MB 파일 열기 | < 500ms |
| Phase 1 완료 | 입력 → 프리뷰 갱신 | < 200ms |
| Phase 1 완료 | 기본 RAM | < 200MB |
| Phase 5 완료 | 10MB 파일 열기 | < 2초 |
| Phase 5 완료 | idle CPU | < 5% |
| Phase 5 완료 | 30분 연속 사용 | 누수 없음 |

---

## 출시 체크리스트

- [ ] 모든 P0 작업 완료 (Phase 1 전체)
- [ ] 테스트 커버리지 ≥ 80%
- [ ] E2E 시나리오 S1, S2, S5 통과
- [ ] OS별 패키지 설치/제거/업데이트 테스트
- [ ] 30분 무중단 검증
- [ ] 수동 체크리스트 (PRD §12.4) 전 항목 통과
- [ ] README + 단축키 표 완성
- [ ] CHANGELOG.md 작성

---

*참조: `PRD.md` (단독 진실의 원천). 충돌 시 PRD 우선.*
