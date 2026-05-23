<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# components

## Purpose
모든 React UI 컴포넌트. 도메인(editor, layout, modals)과 공통 UI(ui)로 구분되어 있다.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `editor/` | Monaco 에디터 패널과 마크다운 프리뷰 패널 (see `editor/AGENTS.md`) |
| `layout/` | 앱 셸 레이아웃 — 탭바, 사이드바, 상태바 등 11개 컴포넌트 (see `layout/AGENTS.md`) |
| `modals/` | 다이얼로그/모달 컴포넌트 15개 — 설정, 명령어 팔레트, 충돌 해소 등 (see `modals/AGENTS.md`) |
| `ui/` | 범용 UI 원자 컴포넌트 (`ToastStack`) (see `ui/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- 컴포넌트는 순수 함수형(React FC) — 클래스 컴포넌트 금지
- 상태는 로컬 `useState`/`useReducer` 또는 `src/stores/` Zustand 스토어에서 관리
- 스타일: Tailwind CSS 클래스 사용 (`className="..."`)
- Props 인터페이스는 컴포넌트 파일 상단에 정의

<!-- MANUAL: -->
