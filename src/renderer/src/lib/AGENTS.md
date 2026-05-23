<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# lib

## Purpose
사이드이펙트 없는 순수 유틸리티 함수 및 헬퍼 모듈. React/Electron에 종속되지 않아 단위 테스트가 용이하다.

## Key Files

| File | Description |
|------|-------------|
| `fileActions.ts` | 파일 열기/저장/닫기 고수준 액션 (IPC 호출 + 스토어 업데이트 조합) |
| `monacoThemes.ts` | Monaco Editor용 커스텀 테마 정의 (라이트/다크) |
| `scrollSync.ts` | 에디터↔프리뷰 스크롤 위치 계산 로직 |
| `selfSaveRegistry.ts` | 자동저장 중복 실행 방지용 레지스트리 |
| `sessionActions.ts` | 세션 저장/복원 고수준 액션 |

## For AI Agents

### Working In This Directory
- 순수 함수 우선 — React hook이나 DOM API에 의존하는 로직은 `hooks/`로 이동
- `fileActions.ts`와 `sessionActions.ts`는 IPC + 스토어를 조합하는 예외적 케이스 (고수준 액션)
- `monacoThemes.ts` 수정 시 라이트/다크 두 테마 모두 업데이트

## Dependencies

### Internal
- `src/stores/` — 액션 함수들이 스토어 상태를 업데이트
- `src/renderer/src/env.d.ts` — `window.api` 타입 참조

<!-- MANUAL: -->
