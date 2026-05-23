<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# hooks

## Purpose
커스텀 React 훅 11개. 사이드이펙트, IPC 통신, 키보드 단축키 등 재사용 가능한 로직을 컴포넌트에서 분리한다.

## Key Files

| File | Description |
|------|-------------|
| `useAutoSave.ts` | 편집 내용 자동저장 (500ms debounce) |
| `useFileWatch.ts` | 외부 파일 변경 감지 이벤트 구독 |
| `useKeyboardShortcuts.ts` | 전역 키보드 단축키 바인딩 |
| `useTheme.ts` | 라이트/다크/시스템 테마 상태 관리 |
| `useUpdater.ts` | 자동 업데이트 상태 구독 |
| `useTOC.ts` | 마크다운 헤딩 파싱 → TOC 항목 생성 |
| `useScrollSync.ts` | 에디터↔프리뷰 스크롤 동기화 |
| `useCommandPalette.ts` | 명령어 팔레트 열기/닫기 및 명령 목록 관리 |
| `useWorkspace.ts` | 워크스페이스 폴더 로드 및 파일 트리 상태 |
| `useRecentFiles.ts` | 최근 파일 목록 로드 |
| `useTabManager.ts` | 탭 생성/닫기/전환 및 수정 상태 추적 |

## For AI Agents

### Working In This Directory
- 훅 파일명은 `use` 접두사로 시작 (`camelCase`)
- 훅 내부에서 `window.api.*` 직접 호출 가능 — IPC 통신의 주요 진입점
- 부수효과(subscription, listener)는 반드시 `useEffect` cleanup에서 해제

### Common Patterns
```typescript
// IPC 이벤트 구독 패턴
useEffect(() => {
  const unsubscribe = window.api.onFileChanged(handler)
  return () => unsubscribe()
}, [])
```

## Dependencies

### Internal
- `src/stores/` — 전역 상태 읽기/쓰기
- `src/lib/` — 순수 유틸리티 함수

<!-- MANUAL: -->
