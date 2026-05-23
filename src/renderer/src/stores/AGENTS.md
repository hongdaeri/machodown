<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# stores

## Purpose
Zustand 전역 상태 스토어. 앱 전반에 걸쳐 공유되는 상태(열린 파일 목록, 설정, UI 상태, 워크스페이스)를 관리한다.

## Key Files

| File | Description |
|------|-------------|
| `editorStore.ts` | 열린 탭 목록, 활성 탭, 각 파일 편집 내용 및 수정 상태 |
| `settingsStore.ts` | 사용자 설정(테마, 자동저장 간격, 폰트 크기 등) |
| `uiStore.ts` | UI 상태 — 사이드바 열림, 뷰 모드(에디터/프리뷰/스플릿), 토스트 메시지 |
| `workspaceStore.ts` | 현재 워크스페이스 폴더 경로 및 파일 트리 |
| `types.ts` | 스토어 간 공유되는 타입 정의 |

## For AI Agents

### Working In This Directory
- Zustand 스토어는 `create()` 로 정의되고 `immer` 미들웨어 없이 불변 패턴 사용
- 스토어 간 직접 의존 금지 — 필요하다면 훅(`hooks/`)에서 여러 스토어를 조합
- 설정 변경 시 `settingsStore`를 통해 IPC로 메인 프로세스에 persist 요청

### Common Patterns
```typescript
// 스토어 사용 패턴
const activeTab = useEditorStore(state => state.activeTab)
const setTheme = useSettingsStore(state => state.setTheme)
```

## Dependencies

### Internal
- `types.ts` — 공유 타입

<!-- MANUAL: -->
