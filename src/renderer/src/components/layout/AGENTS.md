<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# layout

## Purpose
앱 셸 레이아웃 컴포넌트 11개. 탭바, 사이드바, 파일 탐색기, 상태바, TOC 패널 등 앱의 뼈대를 구성한다.

## Key Files

| File | Description |
|------|-------------|
| `AppShell.tsx` | 최상위 레이아웃 — 사이드바 + 메인 에리어 배치 |
| `TabBar.tsx` | 열린 파일 탭 목록 — 탭 전환, 닫기, 수정 표시(•) |
| `Sidebar.tsx` | 사이드바 컨테이너 — 파일 탐색기/TOC 패널 전환 |
| `FileTree.tsx` | 워크스페이스 폴더 기반 파일 트리 탐색기 |
| `TOCPanel.tsx` | 현재 문서의 헤딩 기반 자동 목차 사이드패널 |
| `StatusBar.tsx` | 하단 상태바 — 줄/열 번호, 인코딩, 파일 크기 등 |
| `TitleBar.tsx` | 맞춤형 타이틀바 (프레임리스 윈도우용) |
| `MainArea.tsx` | 에디터/프리뷰/스플릿 뷰 모드 전환 컨테이너 |
| `ResizableSplit.tsx` | 드래그로 크기 조절 가능한 분할 패널 |
| `ToolBar.tsx` | 뷰 전환 버튼 등 툴바 |
| `EmptyState.tsx` | 열린 파일이 없을 때 표시되는 빈 화면 |

## For AI Agents

### Working In This Directory
- 레이아웃 컴포넌트는 `uiStore`의 `viewMode`, `isSidebarOpen` 등 UI 상태를 읽어 조건부 렌더링
- `ResizableSplit`은 사이드바와 메인 에리어, 에디터와 프리뷰 패널 모두에서 재사용
- 탭 관련 로직(`TabBar`)은 `editorStore`에서 탭 목록을 읽고 `useTabManager` 훅으로 조작

## Dependencies

### Internal
- `src/stores/uiStore` — 뷰 모드, 사이드바 상태
- `src/stores/editorStore` — 탭 목록, 활성 탭
- `src/stores/workspaceStore` — 파일 트리 데이터
- `src/hooks/useTOC` — TOC 데이터

<!-- MANUAL: -->
