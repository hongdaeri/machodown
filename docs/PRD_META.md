# Markflow — Claude Code 구현 지시 메타프롬프트 v2

> 본 문서는 Markdown Editor & Viewer (Electron 데스크톱 앱) 의 **단독 구현 지시서**입니다.
> Claude Code 는 본 문서 + 함께 제공된 **디자인 프로토타입 파일들** 을 기반으로 앱을 빌드합니다.
> UI 는 프로토타입을 **그대로 보존**하는 것이 1순위, 기능/데이터/IPC 명세는 본 문서를 1순위 참조하십시오.

## 📌 v2 변경 사항 (v1 → v2)

v1 대비 다음 5개 섹션이 새로 추가되었습니다:

| 섹션 | 내용 | 우선순위 |
|---|---|---|
| **3.5 초기 설정 & 온보딩** | 첫 실행 감지, Empty State, 단축키 가이드, 릴리스 노트 | P0 |
| **3.6 단축키 시스템** | 중앙 단축키 레지스트리, Monaco 충돌 방지, 스코프 관리 | P0 |
| **3.7 로깅 & 디버깅** | electron-log, 진단 정보, 충돌 보고서, 개발자 도구 | P0 |
| **3.8 백업 & 복구** | 자동 백업, 비정상 종료 감지, 복구 다이얼로그 | P0 |
| **3.9 데이터 마이그레이션** | 스키마 버전 관리, 마이그레이션 시스템 | P1 |

**기타 보강**:
- 데이터 모델: 9개 새 인터페이스 추가
- IPC 채널: 11개 새 채널 추가
- 외부 의존성: `dompurify` 추가
- 개발 로드맵: Phase 1 세부 작업 분해표 추가
- 수동 테스트 체크리스트: 8개 항목 추가

---

## 0. 시작 전 필수 확인 사항

### 0.1 함께 제공되는 참조 자산

| 경로 | 용도 | 처리 방침 |
|---|---|---|
| `design/Markflow Editor.html` | 진입점 — 전체 레이아웃 확인 | 구조 참고 |
| `design/styles.css` | **컬러/타이포/스페이싱 토큰의 단일 출처** | 그대로 이식 |
| `design/data.jsx` | 아이콘 SVG 17 종, 워크스페이스 더미, 메뉴 정의 | ICON 객체는 그대로 추출 |
| `design/sidebar.jsx` `editor.jsx` `preview.jsx` `app.jsx` | 컴포넌트 구조·상호작용 패턴 참고 | 구조/네이밍 모방 |

> ⚠️ 프로토타입은 정적 React 데모입니다. 신택스 하이라이팅은 자체 함수, 마크다운 본문은 하드코딩으로 모킹돼 있습니다. **실제 앱에서는** Monaco Editor + markdown-it 으로 대체합니다. 단 **시각적 결과는 동일해야** 합니다.

### 0.2 작업 원칙

1. **디자인을 다시 그리지 마십시오.** `styles.css` 의 CSS 변수, `.window/.menubar/.sidebar/...` 클래스를 그대로 가져옵니다.
2. **임의 색을 추가하지 마십시오.** 모든 컬러는 `var(--bg-*) / var(--fg-*) / var(--accent) / var(--syn-*)` 토큰만 사용합니다.
3. **컴포넌트 경계를 동일하게.** 프로토타입의 `Sidebar / Editor / Preview / TocPane / MenuBar / StatusBar / Palette / ToastStack / NewFileModal` 을 그대로 React 컴포넌트로 매핑하십시오.
4. **인터랙션 디테일을 빠뜨리지 마십시오** — 사이드바·에디터 사이의 드래그 리사이즈, 프리뷰 툴바의 `ResizeObserver` 기반 축약, 토스트의 `slideIn`, 모달의 `pop` 애니메이션, 메뉴 드롭다운의 ESC/외부 클릭 닫힘, ⌘P 키 바인딩 등 모두 보존.
5. **TypeScript 권장** (`strict: true`). 본 문서의 인터페이스는 그대로 사용 가능합니다.

---

## 1. 제품 요약

- **한 줄 설명**: 데스크톱에서 동작하는 개인용 마크다운 에디터/뷰어. 좌측 에디터 ⇄ 우측 프리뷰 분할, 워크스페이스(폴더) 관리, 자동 저장.
- **핵심 가치**: 군더더기 없는 단축키 중심 UI, 라이트/다크 모두 안정적, 한글 인코딩 친화적, 크로스 플랫폼 동작.
- **타겟**: 본인 1인 사용 (단독 개발자). 시장 분석/마케팅 영역 제외.
- **기술 스택**: Electron 28+, React 18, TypeScript(권장), Monaco Editor, markdown-it (+ plugins), highlight.js, KaTeX, Zustand, chokidar, chardet, electron-builder, electron-updater, Vite.
- **배포**: macOS (.dmg, .zip), Windows (NSIS, Portable), Linux (.AppImage, .deb).
- **성공 기준**: (1) 30 분 연속 사용 시 충돌 없음 (2) 모든 P0 기능이 단축키 1 회로 도달 (3) 10 MB 파일 열기 < 2 초.
- **비기능 요구**: 기본 동작 RAM 200 MB 이하, idle CPU < 5 %.

---

## 2. 사용자 시나리오

각 시나리오는 Given–When–Then + 에러 케이스 형식.

### S1. 새 파일 작성 → 저장

- **Given**: 앱이 실행 중이고 워크스페이스 `~/notes` 가 추가된 상태.
- **When**: `File ▸ 새 파일` 또는 ⌘ N → 파일명 입력 모달에서 `idea.md` 입력 후 Enter.
- **Then**: `~/notes/idea.md` 생성, 빈 탭이 활성화되며 에디터가 포커스. 입력 후 500 ms 뒤 자동 저장. 저장 완료 시 탭/타이틀의 `●` 표시가 사라지고 토스트 "저장됨" 표시(설정에 따라 생략 가능).
- **에러**: EEXIST → 모달 내 inline 에러 "이미 존재합니다." / EACCES → 토스트 + 다른 위치 저장 안내.

### S2. 폴더의 기존 파일 편집

- **Given**: 워크스페이스에 `~/notes` 등록됨, 트리에 다수의 `.md` 파일.
- **When**: 사이드바 트리에서 파일 더블클릭(또는 단일 클릭, 설정).
- **Then**: 새 탭으로 열림. 기존에 동일 경로가 열려 있으면 해당 탭으로 활성화 전환. 커서/스크롤 위치는 마지막 세션 복원.
- **에러**: 디스크상 파일 사라짐(ENOENT) → "파일을 찾을 수 없습니다" 토스트 + 트리에서 자동 제거.

### S3. 여러 파일 동시 작업

- **Given**: 3 개 이상 탭이 열려 있고, 일부는 dirty 상태.
- **When**: 다른 탭을 클릭하거나 ⌘ Tab(앱 내부)/Cmd Shift ] 로 이동.
- **Then**: 활성 탭이 즉시 전환, 비활성 탭의 상태(content, cursor, scroll)는 메모리에 유지. dirty 탭은 ● 표시.
- **에러**: 탭 닫기 시 dirty → 확인 다이얼로그("저장 / 저장하지 않음 / 취소").

### S4. 워크스페이스 추가/제거

- **Given**: 사이드바에 워크스페이스 0~N 개.
- **When**: `File ▸ 폴더 열기…` 또는 사이드바 헤더의 `+` 버튼.
- **Then**: OS 폴더 선택 다이얼로그 → 선택 시 `workspaces.json` 에 추가, 트리에 즉시 표시, `chokidar` 로 감시 시작.
- **제거 시**: 확인 모달 → 트리에서만 제거(파일 시스템은 변경 없음), 해당 폴더 하위 파일이 열려있다면 탭은 유지하되 워크스페이스 라벨만 사라짐.

### S5. 외부에서 파일이 수정됨

- **Given**: `editor-spec.md` 가 에디터에 열려 있고 dirty 상태 아님.
- **When**: 외부 에디터/git pull 등으로 파일 mtime 변경.
- **Then**: `chokidar` 가 감지 → 토스트로 "외부 변경 감지 — [다시 불러오기] [무시]" 표시.
- **dirty 상태인데** 외부에서도 변경 → "병합 충돌" 모달 — 옵션: `(1)` 내 변경 보존 `(2)` 디스크 버전으로 덮어쓰기 `(3)` 사본으로 저장 후 디스크 버전 로드.

### S6. 워크스페이스 전역 검색

- **Given**: 워크스페이스 등록됨, 사이드바 검색창에 `function` 입력.
- **When**: 디바운스 200 ms 후 검색 실행.
- **Then**: 파일명 일치 + 본문 일치를 그룹화해 목록 표시(최대 50). 결과 클릭 시 해당 파일을 열고 일치 줄로 점프.
- **에러**: 매칭 0 → "결과 없음" 헬프 텍스트.

---

## 3. 기능 명세

각 기능은 다음 형식을 따릅니다:

```
기능명 / 우선순위 / 예상 시간
설명
트리거 / 입력 / 처리 흐름 / 출력 / 의존성 / 에러 케이스 / 완료 기준
```

### 3.1 P0 (MVP 필수)

#### 3.1.1 파일 열기 (단일/다중)

- **우선순위**: P0 / **예상**: 6h
- **설명**: 사용자가 선택한 `.md` 파일을 새 탭으로 연다. 이미 열려있는 파일이면 해당 탭 활성화.
- **트리거**: ① 메뉴 `File ▸ 파일 열기…` ② ⌘ O ③ 사이드바 트리 더블클릭 ④ ⌘ P 명령어 팔레트의 파일 결과 선택.
- **처리**:
  1. Renderer → IPC `open-file` 송신 (path).
  2. Main: `fs.readFile(path, encoding)` — 인코딩은 ① 파일 BOM 검사 ② 없으면 chardet ③ fallback UTF-8.
  4. `'file-opened'` 이벤트로 `{ path, content, encoding, mtime }` 반환.
  5. Renderer: `editorStore.openTab({ ... })`.
- **의존성**: `chardet`, `editorStore`, IPC.
- **에러 케이스**:
  - ENOENT → "파일을 찾을 수 없습니다" 토스트.
  - EACCES → 동일.
  - 디코딩 실패 → 인코딩 수동 선택 모달.
- **완료 기준**:
  - [ ] UTF-8 / UTF-16 / EUC-KR 파일 모두 정상 표시
  - [ ] 동일 파일 재오픈 시 새 탭이 생기지 않음
  - [ ] 1 MB 파일 < 500 ms 로 표시

#### 3.1.2 파일 자동 저장

- **우선순위**: P0 / **예상**: 4h
- **트리거**: Monaco `onDidChangeModelContent` 발생.
- **처리**:
  ```
  Editor onChange(content)
    → editorStore.updateContent(tabId, content)
    → isDirty = true, UI 의 ● 표시 갱신
    → debounce 500 ms 후 IPC 'save-file' { path, content, encoding }
    → Main fs.writeFile (writeFileAtomic 권장: 임시파일 → rename)
    → 'file-saved' { path, mtime } → isDirty = false
  ```
- **의존성**: `editorStore`, IPC, Main `fs.promises`.
- **에러 케이스**:
  - EACCES → "권한 없음. 다른 위치에 저장하시겠습니까?" 토스트 + 액션.
  - ENOSPC → "디스크 공간 부족." 토스트.
  - 일반 → "저장 실패. 재시도?" 토스트(액션 포함).
- **완료 기준**:
  - [ ] 입력 후 500 ms 뒤 디스크에 반영
  - [ ] 저장 중·후 ● 상태 정확히 토글
  - [ ] 자동 저장 OFF 설정 시 ⌘ S 만으로 저장 가능
  - [ ] 자동 저장 활성 중에도 ⌘ S 즉시 저장(디바운스 무시) 동작

#### 3.1.3 새 파일 생성 / 이름 변경 / 삭제

- **우선순위**: P0 / **예상**: 5h
- **공통 처리**:
  - 생성: `fs.writeFile(path, '')` → 트리 갱신 → 새 탭으로 열기.
  - 이름 변경: `fs.rename(old, new)` → 열린 탭이 있으면 경로/이름 갱신.
  - 삭제: 확인 모달 → `fs.unlink` (또는 OS 휴지통: `electron.shell.trashItem`) → 열린 탭 제거.
- **모달 UI**: 프로토타입의 `NewFileModal` 패턴을 그대로 사용(라벨/버튼/포커스 처리 동일).
- **에러**: EEXIST(생성) → inline 에러. ENOENT(이름변경/삭제) → 트리 새로고침 + 토스트.

#### 3.1.4 마크다운 편집 (Monaco)

- **우선순위**: P0 / **예상**: 8h
- **트리거**: 탭 활성화 시 Monaco 인스턴스 마운트.
- **세팅**:
  - 언어: `markdown` (Monaco 내장 토큰)
  - 폰트: `var(--font-mono)` 와 동일한 스택 (`JetBrains Mono, ui-monospace, Menlo, ...`)
  - 폰트 크기: `settings.editor.fontSize` (기본 13)
  - 줄 번호: on
  - 자동 줄바꿈: `settings.editor.wordWrap`
  - 미니맵: `settings.editor.minimap` (UI Tweak 의 minimap 토글과 양방향 바인딩)
  - 테마: 라이트/다크 토큰에 맞춘 Monaco 커스텀 테마 2 종 (`markflow-light`, `markflow-dark`). 토큰 → 컬러 매핑은 `styles.css` 의 `--syn-*` 변수를 그대로 사용.
- **단축키**: Monaco 기본 + Undo/Redo (⌘ Z / ⌘ ⇧ Z) + 찾기/바꾸기(⌘ F / ⌘ ⌥ F).
- **완료 기준**:
  - [ ] 라이트 ↔ 다크 토큰 색이 정확히 일치
  - [ ] 폰트/사이즈 변경이 즉시 반영
  - [ ] 큰 파일(1 MB) 입력 지연 < 100 ms

#### 3.1.5 마크다운 렌더링 (Preview)

- **우선순위**: P0 / **예상**: 6h
- **파서**: `markdown-it` + 플러그인 `markdown-it-task-lists`, `markdown-it-anchor`, `markdown-it-emoji`, `highlight.js` 코드 하이라이팅.
- **GFM 옵션**(`gfm:true`): 테이블, 자동 링크, 체크박스.
- **렌더 결과는** 프로토타입 `Preview` 컴포넌트의 `.md-doc` 래퍼 + `styles.css` 의 `.preview h1 / p / pre / table / blockquote.callout / .task-li ...` 규칙을 그대로 적용. 새 CSS 작성 금지.
- **링크 클릭 정책**:
  - 외부 `http(s)` → `shell.openExternal` 으로 OS 기본 브라우저.
  - 상대 경로 → 워크스페이스 기준 해석 후 같은 창에서 해당 파일 열기.
- **이미지**: 상대 경로 OK. 큰 이미지는 `loading="lazy"`.
- **렌더 디바운스**: 입력 후 80 ms (스크롤 싱크 매끄럽게).
- **완료 기준**:
  - [ ] 헤딩, 강조, 리스트, 코드블록, 테이블, 체크박스, 인용, HR, 링크, 이미지 모두 프로토타입과 동일하게 렌더
  - [ ] 코드블록 우상단에 언어 라벨 표시
  - [ ] 콜아웃(`> [!TIP]` 등) 지원 시 `.callout` 스타일 적용

#### 3.1.6 Split View (에디터 ⇄ 프리뷰)

- **우선순위**: P0 / **예상**: 4h
- **레이아웃**: 좌(에디터) / 우(프리뷰) 2 분할. 사이에 5 px 리사이즈 핸들. 프로토타입의 `useResize` 훅을 그대로 사용.
- **너비 저장**: `uiStore.editorWidth` 에 보관, 종료 시 디스크 저장.
- **모드**: `split / editor-only / preview-only`. 메뉴 `View ▸ 미리보기 표시` 로 토글.
- **완료 기준**: 드래그 매끄러움, 최소 폭(에디터 320 / 프리뷰 280) 강제.

#### 3.1.7 윈도우 크롬 / 메뉴바 / 상태바 / 토스트

- **우선순위**: P0 / **예상**: 6h
- 모두 프로토타입에 시각/구조가 완성되어 있음. 다음만 추가 구현:
  - **메뉴바 드롭다운**의 항목 클릭 시 실제 액션 디스패치. (View 하위 토글 4 종은 store 와 양방향 바인딩.)
  - **상태바** 우측 항목 클릭 시 동작:
    - `LF` 클릭 → 줄바꿈 토글 모달
    - `UTF-8` 클릭 → 인코딩 변경 모달(저장 시 적용)
    - `Markdown` 클릭 → 언어 모드 변경(향후 확장 hook)
  - **토스트 스택** 은 `uiStore.toasts` 로 통합. 3 초 자동 dismiss + 닫기 버튼.

---

### 3.2 P1 (1차 출시)

#### 3.2.1 워크스페이스(폴더) 관리

- **데이터**: `workspaces.json` 에 `[{ path, name, addedAt }]`.
- **트리 빌드**: 폴더 expand 시 lazy 로드(`fs.readdir`), `.md / .markdown / .mdown / .mkd` 만 표시(설정에 따라 `.txt` 포함). 숨김 파일 제외(.dotfiles).
- **트리 정렬**: 폴더 우선, 그 다음 알파벳 오름차순(케이스 무시).
- **드래그 앤 드롭**: 사이드바에 폴더 드롭 → 워크스페이스 추가.
- **chokidar 감시**: 워크스페이스 등록 시 폴더에 watcher 부착, 파일 변경 → 트리 갱신 이벤트.
- **UI**: 프로토타입의 `TreeNode` 그대로 사용. 폴더 chevron 회전, `.dot-mod` 표시 등.

#### 3.2.2 최근 파일

- `recent-files.json` 에 최대 30 개 보관. 동일 경로 중복 방지, 가장 최근이 위. 사이드바 "최근 파일" 섹션 + 명령어 팔레트의 1순위 결과로 노출.

#### 3.2.3 환경 설정 (Settings)

- **저장 위치**: `<appData>/markdown-editor/config.json`.
- **모달 UI**: 프로토타입의 모달 패턴 재사용, 항목은 3 탭(`General / Editor / Markdown`).
- **항목**:
  - General: 테마(system/light/dark), 시작 화면 종류, 자동 업데이트.
  - Editor: 폰트 패밀리, 폰트 크기(11~24), 탭 사이즈(2/4), word wrap, 자동 저장 ON/OFF + debounce(100~2000 ms), 미니맵 표시.
  - Markdown: GFM ON/OFF, KaTeX ON/OFF, code highlight theme.
- **반영**: store 변경 → 즉시 전 화면에 적용. `system` 테마는 `nativeTheme.shouldUseDarkColors` 구독.

#### 3.2.4 자동 생성 목차(TOC) — 헤딩 추출

- markdown-it-anchor 가 부여한 slug 를 기반으로 TOC 자동 생성. 헤딩 레벨 1~3 까지 노출.
- 프리뷰 스크롤 위치에 따라 활성 항목 하이라이트(IntersectionObserver).
- TOC 클릭 → 프리뷰 부드러운 스크롤 → 에디터 커서도 해당 줄로 이동.

#### 3.2.5 KaTeX 수식

- markdown-it-texmath 또는 markdown-it-katex 통합. `$inline$`, `$$block$$` 모두 지원.

---

### 3.3 P2 (2차 출시)

#### 3.3.1 워크스페이스 전역 검색 & 일괄 바꾸기

- 검색은 사이드바 검색창 + 전용 `Edit ▸ 파일에서 찾기…` 패널 두 진입점.
- 백엔드는 Main 의 worker thread 에서 `fs.readdir + readFile + regex`. 매칭은 한 파일당 최대 100 줄.
- 일괄 바꾸기는 dry-run 미리보기 → 확인 모달 → 적용. 변경 전 자동 백업(`.bak`)을 옵션으로.

#### 3.3.2 스크롤 싱크

- 에디터 ↔ 프리뷰 양방향. 알고리즘:
  - 에디터 → 프리뷰: 현재 가시 영역의 첫 줄에 해당하는 헤딩/블록의 prefix 텍스트로 prose 위치를 찾아 scrollTo.
  - 프리뷰 → 에디터: 마지막 클릭/포커스된 헤딩의 라인 번호로 에디터 reveal.
- 동기화는 200 ms throttling.

#### 3.3.3 외부 파일 변경 감지 (chokidar)

- 시나리오 S5 참조. clean 일 때 자동 reload(설정), dirty 일 때 병합 모달.

---

### 3.4 P3 (선택)

- PDF / HTML 내보내기 (`File ▸ 내보내기` 서브메뉴).
- Vim 모드 (monaco-vim).
- 플러그인 시스템 (보안 검토 필요 — `contextBridge` 화이트리스트).

---

### 3.5 초기 설정 & 온보딩 (First Launch)

#### 3.5.1 첫 실행 감지 & 처리

- **우선순위**: P0 / **예상**: 4h
- **설명**: 앱 최초 실행 시 사용자 친화적인 온보딩 흐름을 제공한다.

**감지 로직**:
```ts
async function detectLaunchType(): Promise<LaunchType> {
  const configPath = path.join(app.getPath('userData'), 'config.json');
  const exists = await fs.access(configPath).then(() => true).catch(() => false);
  
  if (!exists) return 'first-launch';
  
  const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
  const currentVersion = app.getVersion();
  
  if (config.appVersion !== currentVersion) return 'after-update';
  return 'normal';
}

type LaunchType = 'first-launch' | 'after-update' | 'normal';
```

**처리 흐름**:
```
첫 실행 (first-launch)
  ├─ 기본 설정으로 config.json 생성
  ├─ Welcome 화면 표시
  ├─ 시스템 테마 자동 감지 → 적용
  ├─ "시작하기" 옵션 제공:
  │   ├─ 폴더 추가
  │   ├─ 새 파일 만들기
  │   └─ 단축키 가이드 보기
  └─ 첫 워크스페이스 추가 후 → 메인 화면

업데이트 후 (after-update)
  ├─ config.json의 version 업데이트
  ├─ 마이그레이션 실행 (필요 시)
  ├─ 릴리스 노트 모달 표시
  └─ 메인 화면 (기존 세션 복원)

일반 실행 (normal)
  └─ 세션 복원 → 메인 화면
```

#### 3.5.2 Empty State UI

- **우선순위**: P0 / **예상**: 3h
- **표시 조건**: 워크스페이스 0개 + 열린 탭 0개
- **레이아웃**:
  ```
  중앙 정렬, 사이드바는 표시되지 않음
  ├─ 로고 (Markflow 아이콘)
  ├─ 환영 메시지 ("Markflow에 오신 것을 환영합니다")
  ├─ 액션 버튼 (가로 배치):
  │   ├─ 📁 폴더 열기 (⌘ ⇧ O)
  │   ├─ 📄 새 파일 만들기 (⌘ N)
  │   └─ 📖 단축키 가이드 보기
  └─ 최근 파일 (있을 경우, 최대 5개)
  ```

**컴포넌트 매핑**: `<EmptyState />`

```tsx
interface EmptyStateProps {
  hasRecentFiles: boolean;
  onOpenFolder: () => void;
  onCreateFile: () => void;
  onShowShortcuts: () => void;
  recentFiles?: RecentFile[];
}
```

#### 3.5.3 단축키 가이드 (Cheatsheet)

- **우선순위**: P0 / **예상**: 3h
- **트리거**:
  - 메뉴 `Help ▸ 키보드 단축키` 
  - `⌘ ?` (또는 `⌘ /` on Windows/Linux)
  - 온보딩에서 "단축키 가이드 보기" 클릭

- **UI**: 모달 형태, 검색 가능
- **구조**:
  ```
  카테고리별 그룹화:
  ├─ 파일 (File)
  │   ├─ ⌘ N: 새 파일
  │   ├─ ⌘ O: 파일 열기
  │   ├─ ⌘ ⇧ O: 폴더 열기
  │   ├─ ⌘ S: 저장
  │   ├─ ⌘ W: 탭 닫기
  │   └─ ⌘ Q: 앱 종료
  ├─ 편집 (Edit)
  │   ├─ ⌘ Z / ⌘ ⇧ Z: 실행 취소 / 다시 실행
  │   ├─ ⌘ F: 찾기
  │   ├─ ⌘ ⌥ F: 찾기 & 바꾸기
  │   └─ ⌘ /: 주석 토글
  ├─ 보기 (View)
  │   ├─ ⌘ B: 사이드바 토글
  │   ├─ ⌘ ⇧ P: 프리뷰 토글
  │   └─ ⌘ ⇧ T: TOC 토글
  ├─ 네비게이션 (Navigation)
  │   ├─ ⌘ P: 파일 빠른 열기
  │   ├─ ⌘ ⇧ P: 명령어 팔레트
  │   ├─ Ctrl Tab: 다음 탭
  │   └─ Ctrl ⇧ Tab: 이전 탭
  └─ 기타
      └─ ⌘ ,: 환경설정
  ```

#### 3.5.4 릴리스 노트 표시

- **우선순위**: P1 / **예상**: 2h
- **트리거**: 업데이트 후 첫 실행 시
- **데이터 소스**: `assets/release-notes/{version}.md`
- **UI**: 모달 (스크롤 가능), "다시 보지 않기" 옵션

```ts
interface ReleaseNote {
  version: string;
  releaseDate: string;
  highlights: string[];  // 주요 변경사항
  features: string[];    // 새 기능
  fixes: string[];       // 버그 수정
  breaking?: string[];   // 호환성 변경
}
```

---

### 3.6 단축키 시스템 (Keyboard Shortcuts)

#### 3.6.1 단축키 정의 & 충돌 방지

- **우선순위**: P0 / **예상**: 4h
- **설명**: 모든 단축키를 중앙에서 관리하고, Monaco와 앱 단축키의 충돌을 방지한다.

**중앙 단축키 정의** (`src/shortcuts/registry.ts`):

```ts
export interface ShortcutDefinition {
  id: string;                    // unique ID (예: 'file.save')
  category: ShortcutCategory;
  label: string;                 // 사용자에게 보일 이름
  description?: string;
  keys: {
    mac: string;                 // 예: 'cmd+s'
    win: string;                 // 예: 'ctrl+s'
    linux: string;
  };
  scope: ShortcutScope;          // 'global' | 'editor' | 'palette' | 'modal'
  preventDefault: boolean;
  action: () => void | Promise<void>;
}

export type ShortcutCategory = 
  | 'file' | 'edit' | 'view' 
  | 'navigation' | 'help';

export type ShortcutScope = 
  | 'global'   // 항상 활성
  | 'editor'   // Monaco 포커스 시
  | 'palette'  // 명령어 팔레트 열림 시
  | 'modal';   // 모달 열림 시

export const SHORTCUTS: ShortcutDefinition[] = [
  {
    id: 'file.save',
    category: 'file',
    label: '저장',
    keys: { mac: 'cmd+s', win: 'ctrl+s', linux: 'ctrl+s' },
    scope: 'global',
    preventDefault: true,
    action: async () => {
      const { activeTabId, saveTab } = useEditorStore.getState();
      if (activeTabId) await saveTab(activeTabId, { force: true });
    }
  },
  // ... 모든 단축키
];
```

#### 3.6.2 Monaco vs 앱 단축키 우선순위

```
우선순위 규칙:
1. 'global' scope > 'editor' scope > Monaco 기본
2. 명시적 등록 단축키가 Monaco 기본보다 우선
3. 충돌 시 'global' scope가 승리

예시:
- ⌘ S: 앱의 'file.save'가 Monaco 무시하고 발동
- ⌘ Z: Monaco의 undo (editor scope 우선)
- ⌘ F: Monaco의 find (편집 중) / 앱의 검색 (사이드바 포커스 시)
```

#### 3.6.3 충돌 검출 메커니즘

```ts
function detectConflicts(shortcuts: ShortcutDefinition[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const seen = new Map<string, ShortcutDefinition>();
  
  for (const s of shortcuts) {
    const key = `${s.scope}:${getKeyForPlatform(s.keys)}`;
    if (seen.has(key)) {
      conflicts.push({
        keys: s.keys,
        conflictsBetween: [seen.get(key)!.id, s.id]
      });
    } else {
      seen.set(key, s);
    }
  }
  
  return conflicts;
}

// 앱 시작 시 자동 실행, 충돌 시 콘솔 경고
if (process.env.NODE_ENV === 'development') {
  const conflicts = detectConflicts(SHORTCUTS);
  if (conflicts.length > 0) {
    console.warn('[Shortcuts] Conflicts detected:', conflicts);
  }
}
```

#### 3.6.4 단축키 등록 훅

```ts
// src/hooks/useShortcuts.ts
export function useShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const matched = matchShortcut(e, SHORTCUTS);
      if (!matched) return;
      
      if (matched.scope === 'global' || 
          matched.scope === getCurrentScope()) {
        if (matched.preventDefault) e.preventDefault();
        matched.action();
      }
    };
    
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
```

#### 3.6.5 단축키 커스터마이징 (P3)

- 향후 확장 시 `userShortcuts.json`에 사용자 정의 저장
- UI: Settings 모달 → "단축키" 탭
- 충돌 시 사용자에게 경고

---

### 3.7 로깅 & 디버깅 (Logging & Observability)

#### 3.7.1 로그 시스템 (electron-log)

- **우선순위**: P0 / **예상**: 3h
- **라이브러리**: `electron-log` ^5.0

**로그 레벨 정의**:
```ts
type LogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly';

const LOG_CONFIG = {
  development: {
    fileLevel: 'debug',
    consoleLevel: 'debug',
  },
  production: {
    fileLevel: 'info',
    consoleLevel: 'warn',  // 콘솔은 경고 이상만
  }
};
```

**로그 파일 위치**:
```
macOS:   ~/Library/Logs/markdown-editor/{main,renderer}.log
Windows: %USERPROFILE%\AppData\Roaming\markdown-editor\logs\{main,renderer}.log
Linux:   ~/.config/markdown-editor/logs/{main,renderer}.log
```

**파일 로테이션**:
```ts
log.transports.file.maxSize = 10 * 1024 * 1024;  // 10 MB
log.transports.file.archiveLog = (oldLogPath) => {
  // 최대 5개 보관 (main.1.log, main.2.log, ...)
  const newPath = oldLogPath.replace('.log', `.${Date.now()}.log`);
  fs.renameSync(oldLogPath, newPath);
  cleanOldLogs(5);
};
```

#### 3.7.2 로그 사용 예시

```ts
// Main process
import log from 'electron-log/main';
log.initialize();

log.info('App started', { version: app.getVersion() });
log.warn('File not found', { path: '/tmp/missing.md' });
log.error('Save failed', { 
  path, 
  error: { code: err.code, message: err.message } 
});

// Renderer process
import log from 'electron-log/renderer';

log.info('Tab opened', { tabId, fileName });
log.debug('Markdown parsed', { length: content.length });
```

#### 3.7.3 사용자가 로그 확인하는 방법

**메뉴 추가**: `Help ▸ 로그 폴더 열기`

```ts
// menus.ts
{
  label: 'Help',
  submenu: [
    {
      label: '로그 폴더 열기',
      click: () => {
        const logPath = path.dirname(log.transports.file.getFile().path);
        shell.openPath(logPath);
      }
    },
    {
      label: '진단 정보 복사',
      click: async () => {
        const info = await collectDiagnostics();
        clipboard.writeText(info);
        // 토스트: "진단 정보가 복사되었습니다"
      }
    }
  ]
}
```

**진단 정보 (Diagnostics)**:
```ts
interface Diagnostics {
  appVersion: string;
  electronVersion: string;
  nodeVersion: string;
  osVersion: string;          // os.release()
  arch: string;               // process.arch
  totalMemory: number;        // os.totalmem()
  freeMemory: number;
  workspaceCount: number;
  openTabCount: number;
  recentCrashes: number;
}
```

#### 3.7.4 충돌 보고서 (Crash Reports)

- **메커니즘**: Electron의 `crashReporter` 사용
- **데이터**: 익명화된 충돌 정보 (사용자 콘텐츠 제외)
- **저장 위치**: `<appData>/markdown-editor/crashes/`
- **수집 정책**: opt-in (Settings에서 설정 가능)

```ts
// main.ts
import { crashReporter } from 'electron';

if (settings.general.sendCrashReports) {
  crashReporter.start({
    productName: 'Markflow',
    companyName: 'Personal',
    submitURL: '',  // 로컬 저장만
    uploadToServer: false,
    compress: true
  });
}
```

#### 3.7.5 개발자 도구 (Developer Tools)

```ts
// 메뉴 (개발 모드에서만 표시)
if (process.env.NODE_ENV === 'development') {
  menuTemplate.push({
    label: 'Developer',
    submenu: [
      { 
        label: 'DevTools 열기', 
        accelerator: 'CmdOrCtrl+Shift+I',
        click: () => mainWindow.webContents.openDevTools()
      },
      { 
        label: '메인 프로세스 콘솔', 
        click: () => log.transports.console.level = 'debug'
      },
      { 
        label: '캐시 비우기',
        click: async () => {
          await session.defaultSession.clearCache();
          // 토스트: "캐시가 비워졌습니다"
        }
      },
      {
        label: '강제 충돌 (테스트)',
        click: () => { throw new Error('Test crash'); }
      }
    ]
  });
}
```

#### 3.7.6 새 IPC 채널

```
Renderer → Main:
- 'diagnostics:collect' → Diagnostics
- 'logs:openFolder' → void
- 'crash:list' → CrashReport[]
- 'crash:clear' → void
```

---

### 3.8 백업 & 복구 (Backup & Recovery)

#### 3.8.1 자동 백업 메커니즘

- **우선순위**: P0 / **예상**: 5h
- **설명**: 사용자의 작업을 보호하기 위한 자동 백업 시스템

**백업 종류**:

```
1. 임시 백업 (Auto-save Backup)
   목적: 충돌 시 작업 복구
   위치: <appData>/markdown-editor/.backup/auto/
   파일명: {fileHash}.{timestamp}.md
   주기: 자동 저장과 별도로 30초마다
   보관: 7일 후 자동 삭제

2. 변경 직전 백업 (Pre-save Backup)
   목적: 의도치 않은 덮어쓰기 보호
   위치: <appData>/markdown-editor/.backup/versions/
   파일명: {fileHash}.{timestamp}.md
   주기: 저장 직전
   보관: 10개 버전, 30일 후 자동 삭제

3. 설정 백업
   목적: 설정 파일 손상 방지
   위치: 원본과 같은 폴더, .backup 접미사
   파일: config.json.backup, workspaces.json.backup
```

**백업 데이터 구조**:

```ts
interface BackupMetadata {
  id: string;                    // uuid
  type: 'auto' | 'pre-save' | 'manual';
  originalPath: string;          // 원본 파일 절대 경로
  backupPath: string;            // 백업 파일 경로
  fileHash: string;              // 원본 경로 SHA-1 (파일명 충돌 방지)
  timestamp: number;
  size: number;                  // bytes
  encoding: Encoding;
  isDirty: boolean;              // 백업 당시 미저장 상태였는지
}

// 메타데이터 파일
// <appData>/markdown-editor/.backup/metadata.json
interface BackupIndex {
  version: 1;
  backups: BackupMetadata[];
  lastCleanup: number;           // 마지막 정리 시각
}
```

#### 3.8.2 충돌 후 복구 (Recovery on Crash)

- **트리거**: 앱 시작 시 비정상 종료 감지
- **감지 로직**:

```ts
async function detectAbnormalShutdown(): Promise<boolean> {
  const flagPath = path.join(app.getPath('userData'), '.running');
  
  if (await fileExists(flagPath)) {
    // 이전 세션에서 정상 종료하지 못함
    return true;
  }
  
  // 정상 시작 시 플래그 생성
  await fs.writeFile(flagPath, String(Date.now()));
  
  app.on('before-quit', async () => {
    // 정상 종료 시 플래그 제거
    await fs.unlink(flagPath).catch(() => {});
  });
  
  return false;
}
```

**복구 흐름**:
```
앱 시작
  ↓
비정상 종료 감지?
  ├─ Yes → .backup/auto 폴더에서 dirty 백업 검색
  │         ↓
  │         발견된 백업 있음?
  │         ├─ Yes → 복구 다이얼로그 표시
  │         │         ├─ "복구하기" → 백업 내용을 새 탭으로 열기
  │         │         ├─ "원본 열기" → 디스크의 원본 열기
  │         │         └─ "삭제" → 백업 제거
  │         └─ No → 일반 시작
  └─ No → 일반 시작
```

#### 3.8.3 복구 다이얼로그

```tsx
interface RecoveryDialogProps {
  backups: BackupMetadata[];
  onRecover: (backup: BackupMetadata) => void;
  onDiscard: (backup: BackupMetadata) => void;
  onSkip: () => void;
}

// UI 구성:
// - 제목: "복구할 작업이 있습니다"
// - 설명: "이전 세션이 정상 종료되지 않았습니다. 다음 파일의 미저장 변경사항을 복구할 수 있습니다."
// - 목록: 각 백업별
//   - 파일명 + 마지막 수정 시각
//   - [복구] [원본 열기] [삭제] 버튼
// - 하단: [모두 건너뛰기]
```

#### 3.8.4 백업 자동 정리

```ts
// 앱 시작 후 5초 뒤 실행
async function cleanupOldBackups() {
  const index = await loadBackupIndex();
  const now = Date.now();
  
  const RETENTION = {
    auto: 7 * 24 * 60 * 60 * 1000,        // 7일
    'pre-save': 30 * 24 * 60 * 60 * 1000  // 30일
  };
  
  const toDelete = index.backups.filter(b => {
    const age = now - b.timestamp;
    return age > RETENTION[b.type];
  });
  
  for (const backup of toDelete) {
    await fs.unlink(backup.backupPath).catch(() => {});
  }
  
  index.backups = index.backups.filter(b => !toDelete.includes(b));
  index.lastCleanup = now;
  await saveBackupIndex(index);
  
  log.info('Backup cleanup', { deleted: toDelete.length });
}
```

#### 3.8.5 수동 백업 관리

**메뉴**: `File ▸ 백업 관리`

**UI**: 모달 (또는 패널)
```
백업 목록 (파일별로 그룹화)
├─ idea.md
│   ├─ 2024-01-15 14:30 (auto) [복구] [삭제]
│   ├─ 2024-01-15 13:00 (pre-save) [복구] [삭제]
│   └─ ...
├─ readme.md
│   └─ ...
└─ [모든 백업 삭제]
```

#### 3.8.6 IPC 채널 추가

```
Renderer → Main:
- 'backup:list' → BackupMetadata[]
- 'backup:recover' { id: string } → { content: string, encoding: Encoding }
- 'backup:delete' { id: string } → void
- 'backup:clearAll' → void
- 'backup:createManual' { path: string } → BackupMetadata

Main → Renderer:
- 'backup:recoveryAvailable' { backups: BackupMetadata[] }
```

---

### 3.9 데이터 마이그레이션 (Data Migration)

#### 3.9.1 스키마 버전 관리

- **우선순위**: P1 / **예상**: 4h
- **설명**: 앱 업데이트 시 설정 파일 호환성 보장

**모든 설정 파일에 version 필드 추가**:

```ts
interface VersionedConfig<T> {
  $schema: number;     // 스키마 버전 (정수)
  $appVersion: string; // 작성한 앱 버전
  $updatedAt: number;
  data: T;
}

// 예시: config.json
{
  "$schema": 2,
  "$appVersion": "1.2.0",
  "$updatedAt": 1705320000000,
  "data": {
    "general": { ... },
    "editor": { ... },
    "markdown": { ... },
    "ui": { ... }
  }
}
```

#### 3.9.2 마이그레이션 시스템

```ts
// src/migrations/index.ts
type Migration<TFrom, TTo> = {
  fromVersion: number;
  toVersion: number;
  description: string;
  migrate: (oldData: TFrom) => TTo | Promise<TTo>;
  rollback?: (newData: TTo) => TFrom;
};

const SETTINGS_MIGRATIONS: Migration<any, any>[] = [
  {
    fromVersion: 1,
    toVersion: 2,
    description: 'autoSave를 객체로 변경',
    migrate: (old) => ({
      ...old,
      editor: {
        ...old.editor,
        autoSave: {
          enabled: old.editor.autoSave ?? true,
          debounceMs: 500
        }
      }
    })
  },
  // ... 더 많은 마이그레이션
];

async function migrateConfig(
  config: VersionedConfig<any>,
  targetVersion: number,
  migrations: Migration<any, any>[]
): Promise<VersionedConfig<any>> {
  
  if (config.$schema === targetVersion) return config;
  
  if (config.$schema > targetVersion) {
    throw new Error(
      `설정 파일이 새 버전입니다 (${config.$schema}). 앱을 업데이트하세요.`
    );
  }
  
  // 백업 생성
  await createBackup(config);
  
  let current = config.data;
  let currentVersion = config.$schema;
  
  while (currentVersion < targetVersion) {
    const migration = migrations.find(m => m.fromVersion === currentVersion);
    if (!migration) {
      throw new Error(`마이그레이션 없음: v${currentVersion}`);
    }
    
    log.info('Migrating', { from: currentVersion, to: migration.toVersion });
    current = await migration.migrate(current);
    currentVersion = migration.toVersion;
  }
  
  return {
    $schema: targetVersion,
    $appVersion: app.getVersion(),
    $updatedAt: Date.now(),
    data: current
  };
}
```

#### 3.9.3 마이그레이션 실패 처리

```ts
async function loadSettingsWithMigration(): Promise<AppSettings> {
  const configPath = getConfigPath();
  
  try {
    const raw = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(raw);
    
    // 스키마 검증
    if (!config.$schema) {
      // 구버전 형식 → v1로 래핑
      const wrapped = wrapAsV1(config);
      return await migrateConfig(wrapped, CURRENT_SCHEMA_VERSION, SETTINGS_MIGRATIONS);
    }
    
    const migrated = await migrateConfig(
      config, 
      CURRENT_SCHEMA_VERSION, 
      SETTINGS_MIGRATIONS
    );
    
    if (migrated.$schema !== config.$schema) {
      // 마이그레이션 발생 → 저장
      await fs.writeFile(configPath, JSON.stringify(migrated, null, 2));
      log.info('Settings migrated', { 
        from: config.$schema, 
        to: migrated.$schema 
      });
    }
    
    return migrated.data;
    
  } catch (error) {
    log.error('Settings load failed', error);
    
    // 백업에서 복구 시도
    const backup = await loadBackup(configPath);
    if (backup) {
      // 사용자에게 알림
      await dialog.showMessageBox({
        type: 'warning',
        title: '설정 파일 손상',
        message: '설정 파일을 불러올 수 없어 백업에서 복구했습니다.',
        buttons: ['확인']
      });
      return backup;
    }
    
    // 백업도 없음 → 기본값
    log.warn('Using default settings');
    return DEFAULT_SETTINGS;
  }
}
```

#### 3.9.4 마이그레이션 대상 파일

```
config.json              → SETTINGS_MIGRATIONS
workspaces.json          → WORKSPACES_MIGRATIONS
recent-files.json        → RECENT_FILES_MIGRATIONS
session.json             → SESSION_MIGRATIONS
.backup/metadata.json    → BACKUP_INDEX_MIGRATIONS
```

#### 3.9.5 사용자 알림

```ts
// 마이그레이션 발생 시 토스트 또는 모달
if (migrationCount > 0) {
  uiStore.pushToast({
    kind: 'info',
    title: '설정 업데이트 완료',
    body: `${migrationCount}개 항목이 새 형식으로 마이그레이션되었습니다.`,
    actions: [
      { label: '백업 확인', action: 'open-backup-folder' }
    ]
  });
}
```

---

## 4. 데이터 모델 (TypeScript)

```ts
// ───────── workspace ─────────
export interface Folder {
  path: string;            // absolute
  name: string;            // basename
  expanded: boolean;
  addedAt: number;         // unix ms
}

export interface FileNode {
  path: string;            // absolute
  name: string;
  type: 'file' | 'folder';
  modifiedAt: number;
  size?: number;           // bytes (files only)
  children?: FileNode[];   // lazy-loaded for folders
}

export interface RecentFile {
  path: string;
  workspace: string;       // folder.path of containing workspace, or '' if standalone
  openedAt: number;
}

// ───────── editor ─────────
export type Encoding = 'utf-8' | 'utf-16le' | 'utf-16be' | 'euc-kr' | 'cp1252';
export type EOL = 'LF' | 'CRLF';

export interface Tab {
  id: string;              // uuid
  filePath: string;        // absolute
  fileName: string;
  content: string;
  encoding: Encoding;
  eol: EOL;
  isDirty: boolean;
  lastSavedAt: number;
  lastDiskMtime: number;   // for stale-detection vs chokidar
  cursorPosition: { line: number; column: number };
  scrollPosition: number;
  viewState?: unknown;     // Monaco serializable view state
}

export interface EditorState {
  openTabs: Tab[];
  activeTabId: string | null;
  splitMode: 'split' | 'editor-only' | 'preview-only';
  showSidebar: boolean;
  showToc: boolean;
  showMinimap: boolean;
}

// ───────── settings ─────────
export interface AppSettings {
  general: {
    theme: 'light' | 'dark' | 'system';
    checkForUpdates: boolean;
    startupView: 'empty' | 'lastSession';
  };
  editor: {
    fontFamily: string;
    fontSize: number;        // 11..24
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
    editorWidth: number;     // for split view
  };
}

// ───────── ui (transient) ─────────
export interface Toast {
  id: string;
  kind: 'success' | 'warning' | 'error' | 'info';
  title: string;
  body?: string;
  actions?: { label: string; action: string }[];
  ttlMs?: number;            // default 3000
}

export interface ModalState {
  newFile?: { workspacePath: string };
  rename?: { path: string };
  confirmDelete?: { path: string };
  encodingPicker?: { path: string };
  mergeConflict?: { path: string };
  recovery?: { backups: BackupMetadata[] };
  shortcuts?: void;          // 단축키 가이드 모달
  releaseNotes?: { version: string };
}

// ───────── onboarding ─────────
export type LaunchType = 'first-launch' | 'after-update' | 'normal';

export interface ReleaseNote {
  version: string;
  releaseDate: string;
  highlights: string[];
  features: string[];
  fixes: string[];
  breaking?: string[];
}

// ───────── shortcuts ─────────
export type ShortcutCategory = 
  | 'file' | 'edit' | 'view' 
  | 'navigation' | 'help';

export type ShortcutScope = 
  | 'global' | 'editor' | 'palette' | 'modal';

export interface ShortcutDefinition {
  id: string;
  category: ShortcutCategory;
  label: string;
  description?: string;
  keys: {
    mac: string;
    win: string;
    linux: string;
  };
  scope: ShortcutScope;
  preventDefault: boolean;
  action: () => void | Promise<void>;
}

// ───────── backup ─────────
export type BackupType = 'auto' | 'pre-save' | 'manual';

export interface BackupMetadata {
  id: string;                  // uuid
  type: BackupType;
  originalPath: string;
  backupPath: string;
  fileHash: string;            // SHA-1 of originalPath
  timestamp: number;
  size: number;                // bytes
  encoding: Encoding;
  isDirty: boolean;
}

export interface BackupIndex {
  $schema: number;
  version: 1;
  backups: BackupMetadata[];
  lastCleanup: number;
}

// ───────── migration ─────────
export interface VersionedConfig<T> {
  $schema: number;
  $appVersion: string;
  $updatedAt: number;
  data: T;
}

export interface Migration<TFrom, TTo> {
  fromVersion: number;
  toVersion: number;
  description: string;
  migrate: (oldData: TFrom) => TTo | Promise<TTo>;
  rollback?: (newData: TTo) => TFrom;
}

// ───────── diagnostics ─────────
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

## 5. 시스템 아키텍처

### 5.1 프로세스 분리

| 책임 | Main | Renderer |
|---|---|---|
| 파일 시스템 (`fs`) | ✓ | ✗ |
| `chokidar` 감시 | ✓ | ✗ |
| OS 다이얼로그 | ✓ | ✗ |
| 자동 업데이트 | ✓ | ✗ |
| Monaco / 렌더링 | ✗ | ✓ |
| 상태 관리(Zustand) | ✗ | ✓ |

### 5.2 보안 설정

```ts
new BrowserWindow({
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    preload: path.join(__dirname, 'preload.js'),
  },
});
```

`preload.js` 에서 `contextBridge.exposeInMainWorld('api', { ... })` 로 화이트리스트 IPC 만 노출.

### 5.3 IPC 채널

#### Renderer → Main (invoke / handle)

| 채널 | 입력 | 출력 |
|---|---|---|
| `dialog:openFile` | `{ filters?: Filter[] }` | `string[] \| null` |
| `dialog:openDirectory` | – | `string \| null` |
| `dialog:saveFile` | `{ defaultPath?: string }` | `string \| null` |
| `fs:readFile` | `{ path: string }` | `{ content: string; encoding: Encoding; eol: EOL; mtime: number }` |
| `fs:writeFile` | `{ path: string; content: string; encoding: Encoding }` | `{ mtime: number }` |
| `fs:createFile` | `{ path: string }` | `{ mtime: number }` |
| `fs:rename` | `{ oldPath: string; newPath: string }` | `void` |
| `fs:trash` | `{ path: string }` | `void` |
| `fs:readDirectory` | `{ path: string }` | `FileNode[]` |
| `fs:stat` | `{ path: string }` | `{ mtime: number; size: number }` |
| `watch:add` | `{ path: string }` | `void` |
| `watch:remove` | `{ path: string }` | `void` |
| `settings:get` | – | `AppSettings` |
| `settings:set` | `Partial<AppSettings>` | `AppSettings` |
| `shell:openExternal` | `{ url: string }` | `void` |
| `app:reportError` | `{ message: string; stack?: string }` | `void` |
| `app:launchType` | – | `LaunchType` |
| `app:getVersion` | – | `string` |
| `diagnostics:collect` | – | `Diagnostics` |
| `logs:openFolder` | – | `void` |
| `crash:list` | – | `CrashReport[]` |
| `crash:clear` | – | `void` |
| `backup:list` | – | `BackupMetadata[]` |
| `backup:recover` | `{ id: string }` | `{ content: string; encoding: Encoding }` |
| `backup:delete` | `{ id: string }` | `void` |
| `backup:clearAll` | – | `void` |
| `backup:createManual` | `{ path: string }` | `BackupMetadata` |
| `releaseNotes:get` | `{ version: string }` | `ReleaseNote \| null` |

#### Main → Renderer (send)

| 채널 | 페이로드 |
|---|---|
| `fs:externalChange` | `{ path: string; type: 'add' \| 'change' \| 'unlink'; mtime: number }` |
| `theme:nativeChanged` | `{ shouldUseDark: boolean }` |
| `app:beforeQuit` | – (저장되지 않은 변경 확인용) |
| `backup:recoveryAvailable` | `{ backups: BackupMetadata[] }` |
| `migration:completed` | `{ from: number; to: number; count: number }` |
| `update:available` | `{ version: string }` |
| `update:downloaded` | `{ version: string }` |

### 5.4 파일 시스템 접근 정책

- 모든 경로는 Main 에서 정규화/검증 후 처리.
- 워크스페이스 외부 경로 쓰기는 명시적 사용자 액션(저장 다이얼로그)에서만 허용.
- Symlink 따라가지 않음(`{ resolveSymlinks: false }`).

---

## 6. 상태 관리 (Zustand)

### 6.1 Store 구성

```
src/stores/
  editorStore.ts      // openTabs, activeTabId, split modes
  workspaceStore.ts   // folders, fileTree, recentFiles, search
  settingsStore.ts    // AppSettings + persistence
  uiStore.ts          // toasts, modals, sidebarWidth, editorWidth
```

### 6.2 핵심 액션

```ts
// editorStore
openTab(file: { path, content, encoding, eol, mtime }): void;
closeTab(id, opts?: { force?: boolean }): Promise<boolean>; // dirty 시 확인
activateTab(id): void;
updateContent(id, content): void;          // debounced save 트리거
saveTab(id, opts?: { force?: boolean }): Promise<void>;
saveAllDirty(): Promise<void>;
reloadFromDisk(id): Promise<void>;

// workspaceStore
addFolder(path): Promise<void>;
removeFolder(path): void;
refreshNode(path): Promise<void>;
pushRecent(path): void;
search(query, opts): AsyncIterable<SearchHit>;

// settingsStore
hydrate(): Promise<void>;                  // 앱 시작 시
update(patch: Partial<AppSettings>): Promise<void>;
subscribeTheme(cb): () => void;            // light/dark/system 통합

// uiStore
pushToast(toast: Omit<Toast,'id'>): string;
dismissToast(id): void;
openModal(modal: keyof ModalState, payload?): void;
closeModal(): void;
setEditorWidth(px): void;
setSidebarWidth(px): void;
```

### 6.3 영속화

- `settingsStore` 와 `workspaceStore.folders`, `workspaceStore.recentFiles` 는 디스크에 저장.
- `editorStore.openTabs`, `editorStore.activeTabId`, `uiStore.editorWidth`, `uiStore.sidebarWidth` 는 종료 시점 스냅샷.
- 복원은 `App` 마운트 직전 `settings:get` → `restore-session` 순서로 수행. (오류 시 백업 파일 fallback.)

---

## 7. 에러 처리 & 예외

### 7.1 정책

- 모든 IPC handler 는 try/catch + 정상화된 에러 객체 반환 `{ code, message, hint? }`.
- Renderer 는 IPC 실패 시 자동으로 `uiStore.pushToast` 호출.
- 치명적 에러는 `app:reportError` 로 Main 의 `electron-log` 에 기록 (`<appData>/markdown-editor/logs/`).

### 7.2 카테고리

| 카테고리 | 코드 | 사용자 메시지 |
|---|---|---|
| 파일 권한 | `EACCES` | "권한이 없습니다. 다른 위치에 저장하시겠어요?" + 액션 |
| 파일 없음 | `ENOENT` | "파일을 찾을 수 없습니다." + 트리에서 자동 제거 |
| 디스크 부족 | `ENOSPC` | "디스크 공간이 부족합니다." |
| 파일 잠김 | `EBUSY` | "다른 프로그램이 파일을 사용 중입니다. 재시도?" |
| 인코딩 실패 | `EENCODING` | 인코딩 선택 모달 |
| 외부 변경 | `EEXTERNAL` | 토스트 + 다시 불러오기/무시 액션 |
| 마크다운 파싱 | – | 부분 렌더링 유지, 콘솔 경고 |
| 알 수 없음 | `EUNKNOWN` | "오류가 발생했습니다. 다시 시도해주세요." |

### 7.3 글로벌 핸들러

- Main: `process.on('uncaughtException')`, `process.on('unhandledRejection')` → 로그 + 사용자 알림(스택 제외).
- Renderer: `window.addEventListener('error' / 'unhandledrejection')` → `app:reportError` 송신.

---

## 8. 성능 요구사항

| 항목 | 목표 |
|---|---|
| 100 KB 파일 열기 | < 100 ms |
| 1 MB 파일 열기 | < 500 ms |
| 10 MB 파일 열기 | < 2 s, 경고 토스트 표시 |
| 입력 → 프리뷰 갱신 | < 200 ms |
| 자동 저장 디바운스 | 500 ms (설정 가능 100~2000) |
| 기본 RAM | < 200 MB |
| 최대 RAM (10 탭 + 큰 파일) | < 500 MB |
| idle CPU | < 5 % |
| 편집 중 CPU | < 15 % |

### 8.1 전략

- 마크다운 파싱: Web Worker (`markdown.worker.ts`) 에서 수행, postMessage 로 HTML 문자열 전달.
- 대형 파일: Monaco `largeFileOptimizations` 활성, 미니맵 자동 비활성.
- 미사용 탭(2 시간 이상 비활성): content 를 메모리에서 비우고 path 만 유지, 다시 활성화 시 reload.
- 이미지: 프리뷰의 `<img loading="lazy">`.

---

## 9. 보안 & 데이터 보호

### 9.1 저장 위치

```
macOS:   ~/Library/Application Support/markdown-editor/
Windows: %APPDATA%\markdown-editor\
Linux:   ~/.config/markdown-editor/
```

### 9.2 파일

| 파일 | 내용 | 마이그레이션 대상 |
|---|---|---|
| `config.json` | `AppSettings` (with `$schema`) | ✓ |
| `workspaces.json` | `Folder[]` (with `$schema`) | ✓ |
| `recent-files.json` | `RecentFile[]` (with `$schema`) | ✓ |
| `session.json` | 마지막 열린 탭/창 상태 | ✓ |
| `logs/*.log` | electron-log 출력 | ✗ |
| `.cache/` | 임시 파일 (종료 시 정리) | ✗ |
| `.backup/auto/` | 자동 백업 (30초 주기, 7일 보관) | ✗ |
| `.backup/versions/` | 저장 직전 백업 (10개, 30일) | ✗ |
| `.backup/metadata.json` | 백업 인덱스 (with `$schema`) | ✓ |
| `.running` | 정상 종료 감지 플래그 | ✗ |
| `crashes/` | 충돌 보고서 (Electron crashReporter) | ✗ |

### 9.3 정책

- 비밀번호/토큰 저장 금지.
- 모든 설정 파일은 `0600` 권한(macOS/Linux).
- 자동 백업: `config.json.backup` (변경 직전 보존). 3 개월 이상 미수정 시 정리.
- 캐시는 종료 시 + 주 1회 자동 청소.

---

## 10. 호환성

- **OS**: macOS 11+ (권장 13+), Windows 10+, Ubuntu 20.04+ (또는 동등 GTK 3).
- **마크다운**: CommonMark + GFM. 옵션으로 KaTeX.
- **파일 인코딩**: UTF-8 (기본), UTF-16 LE/BE, EUC-KR, CP1252. BOM 자동 인식.
- **파일 확장자**: `.md`, `.markdown`, `.mdown`, `.mkd`, (옵션) `.txt`.
- **개행**: LF / CRLF 자동 감지. 저장 시 원본 유지(설정에서 강제 가능).

---

## 11. 개발 로드맵

| Phase | 기간 | 목표 |
|---|---|---|
| **0. 셋업** | 2 일 | Electron + Vite + React + TS 보일러플레이트, `contextBridge` preload, 디자인 토큰/컴포넌트 이식, electron-log 셋업 |
| **1. MVP** | 2.5 주 | P0 전체 — 파일 열기/저장/생성/이름변경/삭제, Monaco, 프리뷰, Split View, 자동 저장, 메뉴/토스트/모달/팔레트, **온보딩, 단축키 시스템, 로깅, 백업** |
| **2. 워크스페이스** | 1.5 주 | P1.1~P1.3 — 폴더 관리, 트리 lazy 로드, chokidar, 최근 파일, 설정 모달, **마이그레이션 시스템** |
| **3. 고급 렌더링** | 1 주 | P1.4~P1.5 — TOC 자동/싱크, KaTeX |
| **4. 검색·동기화** | 1 주 | P2 전부 |
| **5. 폴리싱/배포** | 1 주 | electron-builder, electron-updater, 코드 사이닝, 출시 노트, 릴리스 노트 시스템 |

### 11.1 Phase 1 (MVP) 세부 작업 분해

| 작업 | 우선순위 | 예상 시간 | 의존성 |
|---|---|---|---|
| 보일러플레이트 셋업 | P0 | 4h | - |
| 디자인 토큰 이식 | P0 | 4h | - |
| Zustand store 4종 | P0 | 4h | - |
| **로그 시스템 (electron-log)** | P0 | 3h | - |
| preload + IPC 골격 | P0 | 4h | - |
| **단축키 시스템 (registry)** | P0 | 4h | Zustand |
| 파일 열기 (3.1.1) | P0 | 6h | IPC, store |
| 자동 저장 (3.1.2) | P0 | 4h | 단축키, IPC |
| 파일 생성/이름변경/삭제 (3.1.3) | P0 | 5h | IPC, 모달 |
| Monaco 통합 (3.1.4) | P0 | 8h | 단축키, 토큰 |
| 마크다운 프리뷰 (3.1.5) | P0 | 6h | markdown-it |
| Split View (3.1.6) | P0 | 4h | useResize |
| 윈도우 크롬/메뉴/상태바 (3.1.7) | P0 | 6h | store |
| **초기 설정 & 온보딩 (3.5)** | P0 | 10h | 위 모두 |
| **백업 & 복구 (3.8)** | P0 | 5h | 자동 저장 |
| **단축키 가이드 모달 (3.5.3)** | P0 | 3h | 단축키 |

**총합**: 약 80h (2주 + 여유)

---

## 12. 테스트 전략

### 12.1 단위 테스트 (Vitest)

- 마크다운 파싱 래퍼 (헤딩 추출, 콜아웃 감지)
- 인코딩 감지 함수
- editorStore / workspaceStore / settingsStore 의 핵심 액션
- 경로 정규화 / 워크스페이스 외부 쓰기 차단

### 12.2 통합 테스트 (Vitest + happy-dom)

- IPC 모킹된 상태에서 "파일 열기 → 편집 → 자동 저장 → 외부 변경 감지" 시나리오.
- 탭 닫기 시 dirty 처리 분기.

### 12.3 E2E (Playwright + electron)

- S1, S2, S5 의 happy path.
- 다양한 인코딩 파일 fixture(`fixtures/encodings/*.md`).

### 12.4 수동 체크리스트

- [ ] 100 KB, 1 MB, 10 MB 파일 처리
- [ ] EUC-KR, UTF-16 BOM 파일 열기/저장
- [ ] 외부 변경(touch / 직접 편집) 감지
- [ ] 읽기 전용 폴더에서 저장 시도
- [ ] 네트워크 드라이브 / 클라우드 동기화 폴더
- [ ] 다크 ↔ 라이트 전환 시 Monaco 토큰 색 즉시 반영
- [ ] 30 분 연속 사용 — 누수/지연 없음
- [ ] **첫 실행 시 Welcome 화면 표시**
- [ ] **업데이트 후 첫 실행 시 마이그레이션 + 릴리스 노트 표시**
- [ ] **강제 종료 후 재시작 시 복구 다이얼로그 표시**
- [ ] **단축키 충돌 없음 (모든 단축키 검증)**
- [ ] **단축키 가이드 모달 (⌘?)**
- [ ] **로그 폴더 열기 동작 (Help 메뉴)**
- [ ] **백업 자동 정리 (7일 / 30일 기준)**
- [ ] **충돌 시 백업에서 복구 가능**
- [ ] **설정 파일 손상 시 백업에서 복구**
- [ ] **이전 버전 설정 파일 마이그레이션**

---

## 13. 배포 & 출시

### 13.1 빌드

- `npm run dev` — Vite dev 서버 + Electron (electron-vite 또는 동등).
- `npm run build` — Renderer Vite 프로덕션 빌드 + Main esbuild.
- `npm run package` — electron-builder 로 OS 패키지 생성.

### 13.2 자동 업데이트

- electron-updater + GitHub Releases.
- Main 부팅 후 1 분 뒤 update check, 사용자 알림(메뉴 `Help ▸ 업데이트 확인…` 도 동일 경로).

### 13.3 출시 체크리스트

- [ ] 모든 P0 완료
- [ ] OS 별 패키지 설치/제거/업데이트 테스트
- [ ] 30 분 사용 무중단
- [ ] README + 단축키 표
- [ ] 변경 로그 (`CHANGELOG.md`)

---

## 14. 개발 환경

- Node.js 18+, npm.
- TypeScript `strict: true`.
- ESLint + Prettier (커밋 훅: husky + lint-staged).
- 로깅: `electron-log`.
- VS Code 디버그 구성: Main 프로세스 attach + Renderer Chromium DevTools.

---

## 15. 외부 의존성

```jsonc
// runtime
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
"dompurify": "^3",          // 마크다운 HTML sanitization

// dev
"electron-builder": "^24",
"electron-vite": "^2",
"vite": "^5",
"typescript": "^5",
"vitest": "^1",
"@playwright/test": "^1",
"eslint": "^8",
"prettier": "^3"
```

---

## 16. UI 이식 가이드라인 (디자인 프로토타입 → 프로덕트 코드)

> 이 섹션은 디자인을 유실하지 않기 위한 체크리스트입니다. **반드시 빠짐없이 적용.**

### 16.1 토큰

- `styles.css` 의 `:root` 변수와 `.theme-dark` 변수를 그대로 가져오십시오. 변수 이름 변경 금지.
- 컴포넌트 안에서 색을 직접 쓰지 말고 항상 변수 참조: `color: var(--fg-primary)` 등.
- 액센트 컬러 변경 시 `--accent-soft` 는 `color-mix(in oklch, var(--accent) 18%, transparent)` 로 자동 산출.

### 16.2 폰트

- UI: `var(--font-ui)` (apple-system → SF Pro → Segoe UI → Inter → Helvetica Neue → sans-serif).
- 코드: `var(--font-mono)` (JetBrains Mono → ui-monospace → Menlo → Monaco → Cascadia → Consolas).
- 사용자가 JetBrains Mono 를 설치하지 않은 경우에도 폴백 체인이 자연스럽도록 임의로 폰트를 인라인 로드하지 마십시오(개인 앱이므로 시스템 폰트로 충분).

### 16.3 아이콘

- `design/data.jsx` 의 `ICON` 객체를 그대로 가져와 `components/icons.tsx` 로 정리하십시오. (`<Icon name="search" />` 형태로 래핑해도 무방.)
- 새 아이콘이 필요하면 기존과 동일한 규칙으로 추가: viewBox `0 0 16 16`, stroke `1.3`, `strokeLinecap="round"`, `strokeLinejoin="round"`, `fill="none"` (점은 예외).

### 16.4 컴포넌트 매핑

| 프로토타입 | 프로덕트 컴포넌트 | 비고 |
|---|---|---|
| `TitleBar` | `<TitleBar />` | 트래픽라이트는 macOS 에선 `titleBarStyle: 'hiddenInset'` 으로 OS 네이티브 활용, Win/Linux 는 커스텀 |
| `MenuBar` + `MenuDropdown` | `<MenuBar />` | 항목/단축키 정의는 `menus.ts` 로 추출 |
| `Sidebar` + `TreeNode` | `<Sidebar />` | 트리 노드는 `react-arborist` 또는 자체 가상화 고려(>1000 노드) |
| `Editor` (모킹) | `<EditorPane />` | 내부는 Monaco. 탭바/브레드크럼은 그대로 유지 |
| `Preview` | `<PreviewPane />` | 본문은 markdown-it 결과 sanitized HTML 주입 — DOMPurify 또는 markdown-it 자체 옵션 사용 |
| `TocPane` | `<TocPane />` | 헤딩 IntersectionObserver |
| `StatusBar` | `<StatusBar />` | 동일 |
| `NewFileModal` | `<NewFileModal />` | 같은 패턴으로 RenameModal, ConfirmDeleteModal 추가 |
| `Palette` | `<CommandPalette />` | 명령/파일 통합 검색 |
| `ToastStack` | `<ToastStack />` | uiStore 와 연결 |

### 16.5 인터랙션 보존

- 사이드바·에디터 리사이즈 핸들: 5 px hit, hover 시 accent 색. 프로토타입 `useResize` 그대로 사용.
- 프리뷰 툴바: `ResizeObserver` 로 너비 380 px 미만이면 "실시간 동기화" 라벨 자동 숨김.
- 메뉴 드롭다운: 클릭 토글, 열린 상태에서 다른 메뉴로 호버 시 자동 전환, ESC/외부클릭 닫힘.
- 토스트: 진입 애니메이션 `slideIn 0.25s`, 자동 dismiss(3 s), close 버튼.
- 모달: scrim + `pop 0.2s ease-out`, ESC 닫기, 첫 입력 필드 자동 포커스+select.
- 명령어 팔레트: ↑/↓ 탐색, Enter 실행, ESC 닫기.

### 16.6 제거할 것 / 대체할 것

- 프로토타입의 `Tweaks` 패널은 **개발용 도구**입니다. 프로덕트 빌드에는 포함하지 마십시오. 동일 항목은 모두 `Settings` 모달로 옮깁니다.
- `EDITOR_LINES`, `PreviewBody`, `OPEN_TABS`, `WORKSPACE`, `RECENT` 등 더미 데이터는 모두 제거하고 store/IPC 로 대체.
- 자체 신택스 하이라이팅 함수(`renderTokens`, `tokenizeMD`, `tokenizeTS`)는 Monaco 가 대체.

---

## 17. 작업 순서 가이드 (권장)

1. `Phase 0` — 보일러플레이트 + 디자인 토큰/컴포넌트/아이콘 이식 → 정적 셸이 프로토타입과 시각적으로 동일하게 표시되는지 확인.
2. preload + IPC 골격 + Zustand store 4 종.
3. P0 기능 순차 구현 (3.1.1 → 3.1.7).
4. settings 모달과 Settings store 영속화.
5. P1 → P2 → P3.

각 기능을 시작할 때는 본 문서의 해당 절을 다시 읽고, **완료 기준 체크리스트를 PR 설명에 그대로 옮겨** 자가 검증한 뒤 닫으십시오.

---

**문서 끝.** — 의문점이 생기면 본 문서를 1순위, 디자인 프로토타입(`design/`)을 2순위로 참조하고, 둘이 충돌할 때만 사용자에게 확인을 요청하십시오.
